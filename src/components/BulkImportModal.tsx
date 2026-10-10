import React, { useState } from 'react';
import { Question } from '../types';
import { X, Check, FileText, AlertCircle } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedQuestions: Question[]) => void;
}

const SAMPLE_BULK_TEXT = `1. The S.I unit of Force is:
(a) Pascal (b) Joule (c) Newton (d) Gravity
Ans: c

2. What is the value of gravitational acceleration on Earth's surface?
(a) $9.8\\text{ m/s}^2$ (b) $8.9\\text{ m/s}^2$ (c) $10.5\\text{ m/s}^2$ (d) $0\\text{ m/s}^2$
Ans: a

3. Which formula represents Newton's Second Law of Motion?
(a) $F = m \\cdot a$ (b) $E = mc^2$ (c) $v = u + at$ (d) $P = \\frac{W}{t}$
Ans: a`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    if (!rawText.trim()) return;

    const questions: Question[] = [];
    // Split by question number pattern like "\n1." or "\n20." or start of string
    const blocks = rawText.split(/(?:^|\n)(?=\d+\s*[\.\)])/);

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Extract question number if present
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s*([\s\S]+)/);
      const questionNumber = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
      const content = numMatch ? numMatch[2] : trimmed;

      // Extract answer if specified at end: "Ans: c" or "Answer: (c)"
      let correctOption = 'a';
      const ansMatch = content.match(/(?:Ans|Answer|Correct|ans|Key):\s*\(?([a-dA-D1-4])\)?/i);
      if (ansMatch) {
        const rawOpt = ansMatch[1].toLowerCase();
        if (['1', '2', '3', '4'].includes(rawOpt)) {
          const map: Record<string, string> = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
          correctOption = map[rawOpt];
        } else {
          correctOption = rawOpt;
        }
      }

      // Remove the Ans line from the question content
      const contentWithoutAns = content.replace(/(?:Ans|Answer|Correct|ans|Key):\s*\(?[a-dA-D1-4]\)?/i, '').trim();

      // Extract options: matches (a) ... (b) ... (c) ... (d) ...
      // or A) ... B) ...
      const optionMatches = [
        ...contentWithoutAns.matchAll(/(?:\(([a-dA-D])\)|\b([a-dA-D])\))\s*([^(\n]+?)(?=(?:\([a-dA-D]\)|\b[a-dA-D]\)|$))/g),
      ];

      let questionStatement = contentWithoutAns;
      const options = [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ];

      if (optionMatches.length >= 2) {
        // Question text is everything before the first option
        const firstOptIndex = contentWithoutAns.search(/(?:\([a-dA-D]\)|\b[a-dA-D]\))/);
        if (firstOptIndex > 0) {
          questionStatement = contentWithoutAns.substring(0, firstOptIndex).trim();
        }

        optionMatches.forEach((m) => {
          const optLetter = (m[1] || m[2]).toLowerCase();
          let optText = m[3].trim();
          if (optText.endsWith('*')) {
            optText = optText.slice(0, -1).trim();
            correctOption = optLetter;
          }
          const index = options.findIndex((o) => o.id === optLetter);
          if (index !== -1) {
            options[index].text = optText;
          }
        });
      } else {
        // Split by lines if options were formatted line-by-line
        const lines = contentWithoutAns.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          questionStatement = lines[0];
          lines.slice(1).forEach((l, lIdx) => {
            const letter = ['a', 'b', 'c', 'd'][lIdx];
            if (letter) {
              const cleanText = l.replace(/^[\(\[]?[a-dA-D1-4][\)\]\.\-]?\s*/, '');
              const target = options.find((o) => o.id === letter);
              if (target) target.text = cleanText;
            }
          });
        }
      }

      questions.push({
        id: `bulk_${Date.now()}_${idx}`,
        number: questionNumber,
        text: questionStatement,
        options,
        correctOptionId: correctOption,
        layout: 'inline',
      });
    });

    if (questions.length > 0) {
      onImport(questions);
      onClose();
    } else {
      setParsedCount(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/20 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Bulk Paste & Import Questions
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-600">
            Paste multiple questions with options in standard format. LaTeX formulas ($...$) and answer markers (e.g. <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Ans: c</span>) will be auto-detected!
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Paste Question Sheet Text:</span>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_BULK_TEXT)}
              className="text-blue-600 hover:text-blue-700 font-medium underline text-[11px]"
            >
              Load Example Text
            </button>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`1. The S.I unit of Force is:\n(a) Pascal (b) Joule (c) Newton (d) Gravity\nAns: c\n\n2. Next question...`}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          {parsedCount === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Could not parse questions. Make sure questions start with a number like "1. What is..."</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!rawText.trim()}
            onClick={handleParseAndImport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" /> Parse & Add to Paper
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
