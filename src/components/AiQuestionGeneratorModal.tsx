import React, { useState } from 'react';
import { Question } from '../types';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (generatedQuestions: Question[]) => void;
  currentCount: number;
}

// Built-in high quality curricula question banks for instant generation across topics
const TOPIC_PRESETS: Record<string, Partial<Question>[]> = {
  'Newton Laws of Motion': [
    {
      text: "Newton's first law of motion gives the qualitative definition of:",
      options: [
        { id: 'a', text: 'Force and Inertia' },
        { id: 'b', text: 'Momentum' },
        { id: 'c', text: 'Velocity' },
        { id: 'd', text: 'Acceleration' },
      ],
      correctOptionId: 'a',
    },
    {
      text: 'A force of $20\\text{ N}$ acts on a mass of $5\\text{ kg}$. The acceleration produced is:',
      options: [
        { id: 'a', text: '$100\\text{ m/s}^2$' },
        { id: 'b', text: '$4\\text{ m/s}^2$' },
        { id: 'c', text: '$0.25\\text{ m/s}^2$' },
        { id: 'd', text: '$25\\text{ m/s}^2$' },
      ],
      correctOptionId: 'b',
    },
    {
      text: "Action and reaction forces according to Newton's third law act on:",
      options: [
        { id: 'a', text: 'The same body in same direction' },
        { id: 'b', text: 'Different bodies in opposite directions' },
        { id: 'c', text: 'The same body in opposite directions' },
        { id: 'd', text: 'Different bodies in same direction' },
      ],
      correctOptionId: 'b',
    },
    {
      text: 'The momentum $p$ of an object of mass $m$ moving with velocity $v$ is given by:',
      options: [
        { id: 'a', text: '$p = mv$' },
        { id: 'b', text: '$p = \\frac{m}{v}$' },
        { id: 'c', text: '$p = \\frac{1}{2}mv^2$' },
        { id: 'd', text: '$p = m \\cdot a$' },
      ],
      correctOptionId: 'a',
    },
    {
      text: 'When a passenger jumps out of a moving bus, he falls forward due to:',
      options: [
        { id: 'a', text: 'Inertia of rest' },
        { id: 'b', text: 'Inertia of motion' },
        { id: 'c', text: 'Inertia of direction' },
        { id: 'd', text: 'Gravitational pull' },
      ],
      correctOptionId: 'b',
    },
  ],
  'Work, Power and Energy': [
    {
      text: 'Work done is zero when the angle $\\theta$ between force and displacement is:',
      options: [
        { id: 'a', text: '$0^\\circ$' },
        { id: 'b', text: '$45^\\circ$' },
        { id: 'c', text: '$90^\\circ$' },
        { id: 'd', text: '$180^\\circ$' },
      ],
      correctOptionId: 'c',
    },
    {
      text: 'The potential energy of an object of mass $m$ at a height $h$ is given by:',
      options: [
        { id: 'a', text: '$U = mgh$' },
        { id: 'b', text: '$U = \\frac{1}{2}mgh$' },
        { id: 'c', text: '$U = \\frac{mg}{h}$' },
        { id: 'd', text: '$U = mgh^2$' },
      ],
      correctOptionId: 'a',
    },
    {
      text: 'The commercial unit of electrical energy is kilowatt-hour (kWh), where $1\\text{ kWh} = $:',
      options: [
        { id: 'a', text: '$3.6 \\times 10^5\\text{ J}$' },
        { id: 'b', text: '$3.6 \\times 10^6\\text{ J}$' },
        { id: 'c', text: '$1000\\text{ J}$' },
        { id: 'd', text: '$3600\\text{ J}$' },
      ],
      correctOptionId: 'b',
    },
    {
      text: 'Power is defined as the rate of doing work: $P = \\frac{W}{t}$. Its S.I unit is:',
      options: [
        { id: 'a', text: 'Joule' },
        { id: 'b', text: 'Watt' },
        { id: 'c', text: 'Newton' },
        { id: 'd', text: 'Pascal' },
      ],
      correctOptionId: 'b',
    },
  ],
  'Trigonometry & Calculus': [
    {
      text: 'The identity $\\sin^2(\\theta) + \\cos^2(\\theta)$ equals:',
      options: [
        { id: 'a', text: '$0$' },
        { id: 'b', text: '$1$' },
        { id: 'c', text: '$-1$' },
        { id: 'd', text: '$2$' },
      ],
      correctOptionId: 'b',
    },
    {
      text: 'The derivative $\\frac{d}{dx}[\\sin(x)]$ is:',
      options: [
        { id: 'a', text: '$\\cos(x)$' },
        { id: 'b', text: '$-\\cos(x)$' },
        { id: 'c', text: '$\\tan(x)$' },
        { id: 'd', text: '$\\sec^2(x)$' },
      ],
      correctOptionId: 'a',
    },
    {
      text: 'The value of $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$ is:',
      options: [
        { id: 'a', text: '$0$' },
        { id: 'b', text: '$\\infty$' },
        { id: 'c', text: '$1$' },
        { id: 'd', text: 'Does not exist' },
      ],
      correctOptionId: 'c',
    },
  ],
};

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  currentCount,
}) => {
  const [topic, setTopic] = useState('Newton Laws of Motion');
  const [grade, setGrade] = useState('Class 8 - 10');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const template = TOPIC_PRESETS[topic] || TOPIC_PRESETS['Newton Laws of Motion'];
      const generated: Question[] = template.map((item, idx) => ({
        id: `ai_${Date.now()}_${idx}`,
        number: currentCount + idx + 1,
        text: item.text || 'Question',
        options: item.options || [],
        correctOptionId: item.correctOptionId || 'a',
        layout: 'inline',
        topic,
      }));

      onAddQuestions(generated);
      setIsGenerating(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/20 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Smart Question Generator
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600">
            Select a subject topic to instantly populate questions with LaTeX formulas and marked answers into your paper:
          </p>

          <div>
            <label className="font-semibold block mb-1.5">Select Topic / Subject:</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 font-medium text-xs bg-slate-50"
            >
              <option value="Newton Laws of Motion">Physics: Newton Laws of Motion & Forces</option>
              <option value="Work, Power and Energy">Physics: Work, Power & Energy</option>
              <option value="Trigonometry & Calculus">Math: Trigonometry & Calculus</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1.5">Class / Standard:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 font-medium text-xs bg-slate-50"
            >
              <option value="Class 8">Class 8th (Matches Uploaded Sheet)</option>
              <option value="Class 9">Class 9th</option>
              <option value="Class 10">Class 10th</option>
              <option value="Class 11 - 12">Class 11th - 12th</option>
            </select>
          </div>
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
            disabled={isGenerating}
            onClick={handleGenerate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiQuestionGeneratorModal;
