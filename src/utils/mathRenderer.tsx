import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  isBlock?: boolean;
}

/**
 * Parses and renders LaTeX equations in text.
 * Supports:
 * - Block math: $$ equation $$
 * - Inline math: $ equation $
 * - Pure LaTeX without $ delimiters if it contains LaTeX syntax
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  isBlock = false,
}) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Check if the whole string is meant to be a single block/inline formula without $ markers
    const hasDollarMath = /\$\$[\s\S]+?\$\$|\$[^$]+?\$/.test(content);
    const looksLikeLatex = !hasDollarMath && /(\\[a-zA-Z]+|\^|_|\{|\})/.test(content);

    if (looksLikeLatex) {
      try {
        const html = katex.renderToString(content, {
          displayMode: isBlock,
          throwOnError: false,
        });
        return (
          <span
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        // Fallback to plain text
        return <span className={className}>{content}</span>;
      }
    }

    if (!hasDollarMath) {
      return <span className={className}>{content}</span>;
    }

    // Split text by $$...$$ and $...$
    // We regex capture tokens: $$...$$ or $...$
    const tokens: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      // Preceding plain text
      if (match.index > lastIndex) {
        tokens.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      const matchText = match[0];
      const isDisplayMode = matchText.startsWith('$$');
      const formula = isDisplayMode
        ? matchText.slice(2, -2).trim()
        : matchText.slice(1, -1).trim();

      try {
        const html = katex.renderToString(formula, {
          displayMode: isDisplayMode,
          throwOnError: false,
        });
        tokens.push(
          <span
            key={`math-${match.index}`}
            className="inline-math px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        tokens.push(
          <span key={`err-${match.index}`} className="text-red-500 font-mono text-xs">
            {matchText}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Trailing plain text
    if (lastIndex < content.length) {
      tokens.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    return <span className={className}>{tokens}</span>;
  }, [content, className, isBlock]);

  return <>{renderedElements}</>;
};

export default MathRenderer;
