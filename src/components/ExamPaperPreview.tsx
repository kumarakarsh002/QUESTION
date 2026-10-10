import React, { forwardRef, useMemo } from 'react';
import { Question, DocumentHeaderConfig } from '../types';
import MathRenderer from '../utils/mathRenderer';

interface ExamPaperPreviewProps {
  questions: Question[];
  headerConfig: DocumentHeaderConfig;
  activeQuestionId?: string;
  onSelectQuestion?: (question: Question) => void;
  scale?: number;
}

export const ExamPaperPreview = forwardRef<HTMLDivElement, ExamPaperPreviewProps>(
  ({ questions, headerConfig, activeQuestionId, onSelectQuestion, scale = 1 }, ref) => {
    // Determine badge color classes
    const getBadgeStyle = () => {
      switch (headerConfig.badgeColor) {
        case 'yellow':
          return 'bg-amber-300 text-slate-900 border-slate-700';
        case 'blue':
          return 'bg-sky-200 text-sky-900 border-sky-600';
        case 'rose':
          return 'bg-rose-200 text-rose-900 border-rose-600';
        case 'emerald':
          return 'bg-emerald-200 text-emerald-900 border-emerald-700';
        case 'purple':
          return 'bg-purple-200 text-purple-900 border-purple-600';
        case 'slate':
        default:
          return 'bg-slate-200 text-slate-900 border-slate-600';
      }
    };

    // Calculate options layout
    const getOptionLayoutClass = (
      layout?: 'inline' | 'two-column' | 'stacked' | 'auto'
    ) => {
      if (layout === 'stacked') {
        return 'grid grid-cols-1 gap-0.5';
      }
      if (layout === 'two-column') {
        return 'grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5';
      }
      // Inline
      return 'flex flex-wrap items-center gap-x-4 gap-y-0.5';
    };

    // Font size classes
    const getFontSizeClass = () => {
      switch (headerConfig.fontSize) {
        case 'base':
          return 'text-[12.5px] leading-[1.3]';
        case 'sm':
          return 'text-[11.5px] leading-[1.26]';
        case 'xs':
        default:
          return 'text-[10.5px] leading-[1.22]';
      }
    };

    const getItemSpacingClass = () => {
      switch (headerConfig.optionSpacing) {
        case 'relaxed':
          return 'mb-2.5';
        case 'normal':
          return 'mb-1.5';
        case 'compact':
        default:
          return 'mb-1';
      }
    };

    // Determine questions per page dynamically based on font size or explicit setting
    const questionsPerPage = useMemo(() => {
      if (headerConfig.questionsPerPage && headerConfig.questionsPerPage > 0) {
        return headerConfig.questionsPerPage;
      }
      // Compact (xs): 25 questions per page (matching uploaded sample)
      // Normal (sm): 20 questions per page
      // Relaxed (base): 16 questions per page
      switch (headerConfig.fontSize) {
        case 'base':
          return 16;
        case 'sm':
          return 20;
        case 'xs':
        default:
          return 25;
      }
    }, [headerConfig.questionsPerPage, headerConfig.fontSize]);

    // Split questions into chunks for each page
    const pages = useMemo(() => {
      if (questions.length === 0) return [[]];
      const result: Question[][] = [];
      for (let i = 0; i < questions.length; i += questionsPerPage) {
        result.push(questions.slice(i, i + questionsPerPage));
      }
      return result;
    }, [questions, questionsPerPage]);

    return (
      <div
        ref={ref}
        id="exam-paper-container"
        className="w-full flex flex-col items-center gap-8 select-text print:gap-0"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {pages.map((pageQuestions, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const pageNumber = pageIndex + 1;

          return (
            <div
              key={`page-${pageIndex}`}
              id={`exam-a4-page-${pageNumber}`}
              className="exam-a4-page relative w-[794px] min-h-[1123px] max-h-[1123px] h-[1123px] bg-white text-black shadow-2xl print:shadow-none print:m-0 print:border-black flex flex-col justify-between overflow-hidden page-break-after border border-black"
              style={{
                boxSizing: 'border-box',
                // Zero outer margin/padding in the border as requested:
                padding: '6px 10px 8px 10px',
              }}
            >
              {/* Subtle Watermark in background */}
              {headerConfig.showWatermark && (
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden z-0"
                  style={{ opacity: headerConfig.watermarkOpacity }}
                >
                  {headerConfig.watermarkImageUrl ? (
                    <img
                      src={headerConfig.watermarkImageUrl}
                      alt="Watermark"
                      className="max-w-[70%] max-h-[70%] object-contain"
                    />
                  ) : (
                    <div className="font-extrabold text-[240px] text-slate-800 tracking-tighter select-none font-serif rotate-[-15deg]">
                      {headerConfig.watermarkText || 'A'}
                    </div>
                  )}
                </div>
              )}

              {/* Page Content Container */}
              <div className="relative z-10 flex-1 flex flex-col">
                {/* HEADER: ONLY ON FIRST PAGE */}
                {isFirstPage ? (
                  headerConfig.useCustomHeaderBanner && headerConfig.headerBannerImageUrl ? (
                    <div className="mb-1 border-b-2 border-black pb-1">
                      <img
                        src={headerConfig.headerBannerImageUrl}
                        alt="Custom Institute Header"
                        className="w-full max-h-28 object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <header className="mb-1 pb-1 border-b-2 border-black">
                      {/* Top Header Row: Director Left, Mobile Right */}
                      <div className="flex items-start justify-between text-xs font-bold text-slate-900 tracking-tight leading-none">
                        <div className="text-left font-bold text-slate-900 pt-0.5">
                          {headerConfig.directorName}
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-slate-900 leading-none">
                            {headerConfig.mobileNumber}
                          </span>
                          {headerConfig.badgeText && (
                            <span
                              className={`inline-block mt-0.5 px-2.5 py-0.5 text-[11px] font-bold rounded border shadow-2xs ${getBadgeStyle()}`}
                            >
                              {headerConfig.badgeText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Institute Title & Subtitles Center */}
                      <div className="text-center -mt-5 mb-0.5 px-20">
                        {/* Stylized Title like VISION CLASSES */}
                        <h1
                          className="text-2xl font-black uppercase tracking-wider font-vision-title leading-tight"
                          style={{
                            color: '#2563eb', // Rich vibrant blue
                            textShadow: '0 0 1px #1d4ed8, 1px 1px 0px #bfdbfe, 2px 2px 0px rgba(0,0,0,0.08)',
                            fontFamily: headerConfig.fontTheme === 'academic-serif' ? 'Cinzel, serif' : 'Inter, sans-serif',
                          }}
                        >
                          {headerConfig.instituteName}
                        </h1>

                        {/* Address line */}
                        {headerConfig.instituteSubtitle1 && (
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-tight mt-0.5">
                            {headerConfig.instituteSubtitle1}
                          </p>
                        )}

                        {/* Subjects line */}
                        {headerConfig.instituteSubtitle2 && (
                          <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                            {headerConfig.instituteSubtitle2}
                          </p>
                        )}
                      </div>
                    </header>
                  )
                ) : (
                  // Subsequent pages DO NOT contain header (per user requirement 1)
                  <div className="pt-1 border-b border-slate-300 pb-1 mb-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="font-bold text-slate-700">{headerConfig.instituteName}</span>
                    <span>{headerConfig.badgeText} - Continued</span>
                  </div>
                )}

                {/* QUESTIONS LIST FOR THIS PAGE */}
                <main className={`flex-1 ${getFontSizeClass()}`}>
                  {pageQuestions.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic">
                      No questions in this page.
                    </div>
                  ) : (
                    pageQuestions.map((q) => {
                      const isCurrent = activeQuestionId === q.id;
                      return (
                        <div
                          key={q.id}
                          onClick={() => onSelectQuestion && onSelectQuestion(q)}
                          className={`relative group transition-colors ${getItemSpacingClass()} ${
                            isCurrent
                              ? 'bg-amber-50/70 ring-1 ring-amber-400 rounded px-1'
                              : 'hover:bg-slate-50/50 cursor-pointer'
                          }`}
                        >
                          {/* Question Line */}
                          <div className="flex items-baseline gap-1 text-black font-medium leading-snug">
                            <span className="font-bold shrink-0">{q.number}.</span>
                            <div className="font-semibold text-black flex-1">
                              <MathRenderer content={q.text} />
                            </div>
                          </div>

                          {/* Options Line */}
                          <div
                            className={`mt-0.5 pl-3 ${getOptionLayoutClass(q.layout)}`}
                          >
                            {q.options.map((opt) => {
                              const isCorrect =
                                headerConfig.showCorrectAnswers && q.correctOptionId === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  className={`inline-flex items-baseline gap-1 font-medium ${
                                    isCorrect ? 'text-red-600 font-bold' : 'text-black'
                                  }`}
                                  style={{
                                    color: isCorrect ? headerConfig.highlightColor : undefined,
                                  }}
                                >
                                  <span
                                    className={`font-semibold shrink-0 ${
                                      isCorrect ? 'text-red-600 font-bold' : 'text-black'
                                    }`}
                                    style={{
                                      color: isCorrect ? headerConfig.highlightColor : undefined,
                                    }}
                                  >
                                    ({opt.id})
                                  </span>
                                  <span
                                    className={isCorrect ? 'text-red-600 font-bold' : 'text-black'}
                                    style={{
                                      color: isCorrect ? headerConfig.highlightColor : undefined,
                                    }}
                                  >
                                    <MathRenderer content={opt.text} />
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </main>
              </div>

              {/* PAGE FOOTER WITH PAGE NUMBER */}
              {headerConfig.showPageNumbers && (
                <footer className="relative z-10 pt-1 border-t border-slate-300 text-center text-xs font-semibold text-slate-800 leading-none">
                  {pageNumber}
                </footer>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

ExamPaperPreview.displayName = 'ExamPaperPreview';
export default ExamPaperPreview;
