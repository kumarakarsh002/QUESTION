import React from 'react';
import { Question } from '../types';
import MathRenderer from '../utils/mathRenderer';
import {
  ChevronUp,
  ChevronDown,
  Edit3,
  Copy,
  Trash2,
  FileQuestion,
  Sparkles,
  BookOpen,
  Upload,
} from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  onLoadVisionSample: () => void;
  onLoadMathSample: () => void;
  onOpenBulkImport: () => void;
  onClearAll: () => void;
  activeEditingId?: string;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  onLoadVisionSample,
  onLoadMathSample,
  onOpenBulkImport,
  onClearAll,
  activeEditingId,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 border-b border-blue-900/20 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-blue-200" />
          <h2 className="text-base font-semibold text-white">
            Questions in Paper ({questions.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenBulkImport}
            className="text-xs px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-200" /> Bulk Paste / Import
          </button>
          <button
            type="button"
            onClick={onLoadVisionSample}
            title="Load the 25 Physics & Force questions from the uploaded PDF"
            className="text-xs px-2.5 py-1.5 bg-blue-500/30 hover:bg-blue-500/50 text-white border border-blue-300/30 rounded-md font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-200" /> Vision Preset (25 Qs)
          </button>
          <button
            type="button"
            onClick={onLoadMathSample}
            className="text-xs px-2.5 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-white border border-indigo-300/30 rounded-md font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" /> Math Sample
          </button>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs px-2 py-1.5 text-blue-200 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Clear all questions"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List content */}
      <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
        {questions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">No questions added yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the form on the left to add your first question, or load the pre-filled 25 questions from the uploaded Vision Classes test sheet.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onLoadVisionSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" /> Load Uploaded PDF Format (25 Questions)
              </button>
            </div>
          </div>
        ) : (
          questions.map((q, index) => {
            const isEditing = activeEditingId === q.id;
            return (
              <div
                key={q.id}
                className={`p-3.5 transition-colors group ${
                  isEditing ? 'bg-amber-50/60 ring-1 ring-amber-300' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Number & question text */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 text-xs shrink-0 mt-0.5">
                        {index + 1}.
                      </span>
                      <div className="text-xs font-medium text-slate-900 leading-snug break-words">
                        <MathRenderer content={q.text} />
                      </div>
                    </div>

                    {/* Options preview with red correct answer */}
                    <div className="pl-5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctOptionId === opt.id;
                        return (
                          <span
                            key={opt.id}
                            className={`inline-flex items-center gap-1 ${
                              isCorrect
                                ? 'text-red-600 font-semibold bg-red-50/80 px-1.5 py-0.5 rounded border border-red-200/60'
                                : 'text-slate-600'
                            }`}
                          >
                            <span>({opt.id})</span>
                            <MathRenderer content={opt.text} />
                            {isCorrect && <span className="text-[10px] text-red-500 font-bold">✓</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveQuestion(index, 'up')}
                      title="Move Up"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200/60 rounded"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={() => onMoveQuestion(index, 'down')}
                      title="Move Down"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200/60 rounded"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditQuestion(q)}
                      title="Edit Question"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateQuestion(q)}
                      title="Duplicate Question"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      title="Delete Question"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionList;
