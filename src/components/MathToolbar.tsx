import React from 'react';

interface MathToolbarProps {
  onInsert: (snippet: string) => void;
}

interface MathSnippet {
  label: string;
  snippet: string;
  display: string;
}

const SNIPPET_GROUPS: { name: string; items: MathSnippet[] }[] = [
  {
    name: 'Algebra & Roots',
    items: [
      { label: 'Fraction', snippet: '$\\frac{a}{b}$', display: 'a/b' },
      { label: 'Power/Superscript', snippet: '$x^2$', display: 'x²' },
      { label: 'Subscript', snippet: '$x_1$', display: 'x₁' },
      { label: 'Square Root', snippet: '$\\sqrt{x}$', display: '√x' },
      { label: 'Nth Root', snippet: '$\\sqrt[n]{x}$', display: 'ⁿ√x' },
      { label: 'Parentheses', snippet: '$(x + y)$', display: '(·)' },
    ],
  },
  {
    name: 'Symbols & Operators',
    items: [
      { label: 'Times', snippet: '$\\times$', display: '×' },
      { label: 'Divide', snippet: '$\\div$', display: '÷' },
      { label: 'Plus-Minus', snippet: '$\\pm$', display: '±' },
      { label: 'Dot Product', snippet: '$\\cdot$', display: '·' },
      { label: 'Approx', snippet: '$\\approx$', display: '≈' },
      { label: 'Not Equal', snippet: '$\\neq$', display: '≠' },
      { label: 'Less/Equal', snippet: '$\\le$', display: '≤' },
      { label: 'Greater/Equal', snippet: '$\\ge$', display: '≥' },
      { label: 'Degree', snippet: '$^{\\circ}$', display: '°' },
      { label: 'Infinity', snippet: '$\\infty$', display: '∞' },
    ],
  },
  {
    name: 'Greek & Physics',
    items: [
      { label: 'Theta', snippet: '$\\theta$', display: 'θ' },
      { label: 'Pi', snippet: '$\\pi$', display: 'π' },
      { label: 'Alpha', snippet: '$\\alpha$', display: 'α' },
      { label: 'Beta', snippet: '$\\beta$', display: 'β' },
      { label: 'Delta', snippet: '$\\Delta$', display: 'Δ' },
      { label: 'Lambda', snippet: '$\\lambda$', display: 'λ' },
      { label: 'Vector Force', snippet: '$\\vec{F}$', display: 'F⃗' },
      { label: 'Newton Unit', snippet: '$\\text{ N}$', display: 'N' },
      { label: 'Arrow', snippet: '$\\rightarrow$', display: '→' },
      { label: 'Integral', snippet: '$\\int$', display: '∫' },
      { label: 'Sum', snippet: '$\\sum$', display: '∑' },
    ],
  },
];

export const MathToolbar: React.FC<MathToolbarProps> = ({ onInsert }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Quick Math & Equation Toolbar</span>
        <span className="text-[11px] text-slate-400">Enclose in $...$ for inline math</span>
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {SNIPPET_GROUPS.map((group) => (
          <React.Fragment key={group.name}>
            {group.items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onInsert(item.snippet)}
                title={`Insert ${item.label}: ${item.snippet}`}
                className="inline-flex items-center justify-center px-2 py-1 text-xs font-mono bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                {item.display}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MathToolbar;
