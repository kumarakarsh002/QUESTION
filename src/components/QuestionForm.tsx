import React, { useState, useRef, useEffect } from 'react';
import { Question, QuestionOption } from '../types';
import MathToolbar from './MathToolbar';
import MathRenderer from '../utils/mathRenderer';
import { Check, Plus, Trash2, HelpCircle, Sparkles, CornerDownLeft, RotateCcw } from 'lucide-react';

interface QuestionFormProps {
  onAddOrUpdateQuestion: (question: Question) => void;
  editingQuestion: Question | null;
  onCancelEdit: () => void;
  nextQuestionNumber: number;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onAddOrUpdateQuestion,
  editingQuestion,
  onCancelEdit,
  nextQuestionNumber,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState<string>('a');
  const [layout, setLayout] = useState<'inline' | 'two-column' | 'stacked' | 'auto'>('inline');
  const [topic, setTopic] = useState('');

  // Track focused field for math toolbar insert
  const [activeField, setActiveField] = useState<{
    type: 'question' | 'option';
    optionIndex?: number;
  }>({ type: 'question' });

  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // When editingQuestion changes, populate form
  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.text);
      setOptions(editingQuestion.options);
      setCorrectOptionId(editingQuestion.correctOptionId);
      setLayout(editingQuestion.layout || 'inline');
      setTopic(editingQuestion.topic || '');
    } else {
      resetForm();
    }
  }, [editingQuestion]);

  const resetForm = () => {
    setQuestionText('');
    setOptions([
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ]);
    setCorrectOptionId('a');
    setLayout('inline');
    setTopic('');
  };

  const handleInsertSnippet = (snippet: string) => {
    if (activeField.type === 'question') {
      const textarea = questionInputRef.current;
      if (!textarea) {
        setQuestionText((prev) => prev + snippet);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = questionText;
      const updated = text.substring(0, start) + snippet + text.substring(end);
      setQuestionText(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    } else if (activeField.type === 'option' && activeField.optionIndex !== undefined) {
      const index = activeField.optionIndex;
      const input = optionInputRefs.current[index];
      const optText = options[index].text;
      if (!input) {
        handleOptionTextChange(index, optText + snippet);
        return;
      }
      const start = input.selectionStart || optText.length;
      const end = input.selectionEnd || optText.length;
      const updated = optText.substring(0, start) + snippet + optText.substring(end);
      handleOptionTextChange(index, updated);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const handleOptionTextChange = (index: number, val: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: val };
      return copy;
    });
  };

  const handleAddOption = () => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const nextLetter = letters[options.length] || `opt${options.length + 1}`;
    setOptions((prev) => [...prev, { id: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) return;
    const removedId = options[indexToRemove].id;
    const filtered = options.filter((_, idx) => idx !== indexToRemove);
    setOptions(filtered);
    if (correctOptionId === removedId) {
      setCorrectOptionId(filtered[0].id);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionText.trim()) return;

    const questionToSave: Question = {
      id: editingQuestion ? editingQuestion.id : `q_${Date.now()}`,
      number: editingQuestion ? editingQuestion.number : nextQuestionNumber,
      text: questionText.trim(),
      options: options.map((opt) => ({ ...opt, text: opt.text.trim() })),
      correctOptionId,
      layout,
      topic: topic.trim() || undefined,
    };

    onAddOrUpdateQuestion(questionToSave);
    if (!editingQuestion) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-blue-900/20 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs text-white font-bold flex items-center justify-center text-sm shadow-xs border border-white/30">
            {editingQuestion ? `#${editingQuestion.number}` : `#${nextQuestionNumber}`}
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">
              {editingQuestion ? 'Edit Question' : 'Add Question & Options'}
            </h2>
            <p className="text-xs text-blue-100">
              Type question and options. Mark the correct answer tick in red.
            </p>
          </div>
        </div>

        {editingQuestion && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs px-2.5 py-1 text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md font-medium transition-colors cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Math Toolbar */}
        <MathToolbar onInsert={handleInsertSnippet} />

        {/* Question Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Question Statement</span>
              <span className="text-[11px] font-normal text-slate-400 lowercase">(LaTeX equations supported via $...$)</span>
            </label>
            <span className="text-xs text-slate-400">Ctrl + Enter to Save</span>
          </div>

          <textarea
            ref={questionInputRef}
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onFocus={() => setActiveField({ type: 'question' })}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g. Two forces of $15\text{ N}$ and $10\text{ N}$ act on a wooden block in opposite directions. What is the net force?"
            className="w-full text-sm font-sans px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
          />

          {/* Live Math Preview for Question */}
          {questionText.trim() && (
            <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/60 text-sm text-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Preview:
              </span>
              <MathRenderer content={questionText} />
            </div>
          )}
        </div>

        {/* Options Builder */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Options & Correct Answer Tick</span>
              <span className="text-[11px] font-normal text-rose-600 font-medium">
                (Click tick/radio to mark red correct answer)
              </span>
            </label>

            {/* Layout selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1">Display:</span>
              <button
                type="button"
                onClick={() => setLayout('inline')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  layout === 'inline' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Inline (a)(b)(c)(d)
              </button>
              <button
                type="button"
                onClick={() => setLayout('two-column')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  layout === 'two-column' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2-Columns
              </button>
              <button
                type="button"
                onClick={() => setLayout('stacked')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  layout === 'stacked' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Stacked
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {options.map((option, idx) => {
              const isCorrect = correctOptionId === option.id;
              return (
                <div
                  key={option.id}
                  className={`group flex items-start gap-2 p-2 rounded-lg border transition-all ${
                    isCorrect
                      ? 'bg-red-50/70 border-red-200 ring-1 ring-red-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Correct Answer Selector Button */}
                  <button
                    type="button"
                    onClick={() => setCorrectOptionId(option.id)}
                    title={isCorrect ? 'Marked as Correct Answer (Will appear Red)' : 'Click to mark as Correct Answer'}
                    className={`mt-1 flex items-center justify-center w-7 h-7 rounded-md font-bold text-xs transition-all cursor-pointer ${
                      isCorrect
                        ? 'bg-red-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : `(${option.id})`}
                  </button>

                  {/* Option Text Input */}
                  <div className="flex-1 space-y-1">
                    <div className="relative">
                      <input
                        ref={(el) => {
                          optionInputRefs.current[idx] = el;
                        }}
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        onFocus={() => setActiveField({ type: 'option', optionIndex: idx })}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                        placeholder={`Option (${option.id}) value e.g. $5\\text{ N}$`}
                        className={`w-full text-xs font-medium px-3 py-1.5 rounded border focus:outline-none transition-colors ${
                          isCorrect
                            ? 'bg-white border-red-300 text-red-950 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                            : 'bg-slate-50 focus:bg-white border-slate-200 text-slate-800 focus:border-blue-400'
                        }`}
                      />

                      {/* Correct label indicator */}
                      {isCorrect && (
                        <span className="absolute right-2 top-1.5 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-100/80 px-1.5 py-0.5 rounded">
                          Correct Answer (Red)
                        </span>
                      )}
                    </div>

                    {/* Live Option Math Preview */}
                    {option.text.trim() && (
                      <div
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isCorrect ? 'text-red-700 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        ({option.id}) <MathRenderer content={option.text} />
                      </div>
                    )}
                  </div>

                  {/* Delete option button if > 2 options */}
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      title="Remove Option"
                      className="mt-1 p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Option button */}
          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium inline-flex items-center gap-1 mt-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Option
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Form
          </button>

          <button
            type="submit"
            disabled={!questionText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            <CornerDownLeft className="w-4 h-4" />
            {editingQuestion ? 'Update Question' : 'Add Question to Paper'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
