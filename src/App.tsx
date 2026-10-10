/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Question, DocumentHeaderConfig } from './types';
import {
  DEFAULT_HEADER_CONFIG,
  VISION_CLASSES_QUESTIONS,
  MATH_EXAM_QUESTIONS,
} from './data/sampleQuestions';
import QuestionForm from './components/QuestionForm';
import QuestionList from './components/QuestionList';
import ExamPaperPreview from './components/ExamPaperPreview';
import HeaderSettingsModal from './components/HeaderSettingsModal';
import UploadReferenceModal from './components/UploadReferenceModal';
import BulkImportModal from './components/BulkImportModal';
import AiQuestionGeneratorModal from './components/AiQuestionGeneratorModal';
import {
  downloadExamPaperPdf,
  printExamPaper,
} from './utils/pdfExport';
import {
  Download,
  Printer,
  Sliders,
  Upload,
  Sparkles,
  Eye,
  Edit,
  CheckCircle,
  FileText,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  HelpCircle,
  ExternalLink,
  Layers,
  Image,
} from 'lucide-react';

export default function App() {
  // Main questions state (defaults to the 25 questions from the uploaded Vision Classes paper)
  const [questions, setQuestions] = useState<Question[]>(VISION_CLASSES_QUESTIONS);

  // Document formatting state
  const [headerConfig, setHeaderConfig] = useState<DocumentHeaderConfig>({
    ...DEFAULT_HEADER_CONFIG,
    questionsPerPage: 25, // Exactly 25 questions per page as requested
  });

  // Download ready modal state
  const [downloadReady, setDownloadReady] = useState<{
    blobUrl: string;
    fileName: string;
    pageImages?: string[];
  } | null>(null);

  // Currently editing question in the form
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Modal states
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Preview zoom & view mode
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // PDF generation status
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Ref to paper container for export
  const paperRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 4000);
  };

  // Add or update question
  const handleAddOrUpdateQuestion = (question: Question) => {
    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? question : q))
      );
      setEditingQuestion(null);
      showToast(`Updated Question #${question.number}`);
    } else {
      setQuestions((prev) => [...prev, question]);
      showToast(`Added Question #${question.number}`);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== id);
      return filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    });
    if (editingQuestion?.id === id) {
      setEditingQuestion(null);
    }
    showToast('Question deleted');
  };

  const handleDuplicateQuestion = (question: Question) => {
    const duplicated: Question = {
      ...question,
      id: `q_${Date.now()}`,
      number: questions.length + 1,
    };
    setQuestions((prev) => [...prev, duplicated]);
    showToast(`Duplicated Question #${question.number}`);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy.map((q, idx) => ({ ...q, number: idx + 1 }));
    });
  };

  // Load Presets
  const handleLoadVisionSample = () => {
    setQuestions(VISION_CLASSES_QUESTIONS);
    setHeaderConfig({
      ...DEFAULT_HEADER_CONFIG,
      questionsPerPage: 25,
    });
    setEditingQuestion(null);
    showToast('Loaded Vision Classes exam paper (25 questions on Page 1)');
  };

  const handleLoadMathSample = () => {
    setQuestions(MATH_EXAM_QUESTIONS);
    setHeaderConfig({
      ...DEFAULT_HEADER_CONFIG,
      badgeText: 'Class – 12th',
      instituteSubtitle2: 'ADVANCED MATHEMATICS & CALCULUS DIAGNOSTIC TEST',
      questionsPerPage: 20,
    });
    setEditingQuestion(null);
    showToast('Loaded Mathematics & Calculus exam sample');
  };

  const handleBulkImport = (importedQuestions: Question[]) => {
    setQuestions((prev) => {
      const startNum = prev.length;
      const renumbered = importedQuestions.map((q, idx) => ({
        ...q,
        number: startNum + idx + 1,
      }));
      return [...prev, ...renumbered];
    });
    showToast(`Imported ${importedQuestions.length} questions`);
  };

  const handleAiAddQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => {
      const startNum = prev.length;
      const renumbered = newQuestions.map((q, idx) => ({
        ...q,
        number: startNum + idx + 1,
      }));
      return [...prev, ...renumbered];
    });
    showToast(`Generated ${newQuestions.length} questions`);
  };

  // Trigger Download PDF
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    const baseName = `${headerConfig.instituteName.replace(/\s+/g, '_')}_${headerConfig.badgeText.replace(/\s+/g, '_')}_${
      headerConfig.showCorrectAnswers ? 'Answer_Key' : 'Question_Paper'
    }`;
    const fileName = `${baseName}.pdf`;

    try {
      const result = await downloadExamPaperPdf({
        fileName,
        onProgress: (status) => setExportProgressText(status),
      });
      setDownloadReady({
        blobUrl: result.blobUrl,
        fileName: result.fileName,
        pageImages: result.pageImages,
      });
      showToast('PDF downloaded successfully!');
    } catch (err: any) {
      console.error('PDF export issue:', err);
      showToast('PDF export error: ' + (err?.message || 'Please check questions'));
    } finally {
      setIsExportingPdf(false);
      setExportProgressText('');
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    printExamPaper();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-indigo-100/50 flex flex-col text-slate-800">
      {/* GLOBAL TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce-subtle">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP NAVIGATION & CONTROLS BAR IN BLUE GRADIENTS THEME */}
      <header className="no-print bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white sticky top-0 z-30 shadow-lg border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Branding & Uploaded Format Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-black flex items-center justify-center text-lg shadow-md border border-white/20">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base leading-tight tracking-wide">
                  QuestFormat
                </h1>
                <span className="text-[11px] font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded border border-white/15 hidden sm:inline-block">
                  25 Qs/Page · Blue Edition
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Format: <strong className="text-white font-semibold">{headerConfig.instituteName}</strong> ({headerConfig.badgeText})
              </p>
            </div>
          </div>

          {/* Center: Mode Toggle (Answer Key in Red vs Student Test) */}
          <div className="flex items-center gap-1.5 bg-blue-950/70 p-1 rounded-lg border border-blue-400/20 text-xs">
            <button
              type="button"
              onClick={() =>
                setHeaderConfig((prev) => ({ ...prev, showCorrectAnswers: true }))
              }
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                headerConfig.showCorrectAnswers
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse"></span>
                Answer Key (Red Answers)
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setHeaderConfig((prev) => ({ ...prev, showCorrectAnswers: false }))
              }
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                !headerConfig.showCorrectAnswers
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Student Test Paper (Blank)
            </button>
          </div>

          {/* Right: Actions (Template Settings, Upload, Print, Generate PDF) */}
          <div className="flex items-center gap-2">
            {/* Header Settings */}
            <button
              type="button"
              onClick={() => setIsHeaderModalOpen(true)}
              className="px-2.5 py-1.5 text-xs text-white hover:bg-white/15 border border-white/20 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Edit Institute Name, Phone, Watermark, Badges"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Upload PDF / Format */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-2.5 py-1.5 text-xs text-white hover:bg-white/15 border border-white/20 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload your coaching PDF or header template"
            >
              <Upload className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Upload Format</span>
            </button>

            {/* Browser Print / Vector PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 text-xs text-white hover:bg-white/15 border border-white/20 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print directly or save as vector PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* GENERATE DOWNLOADABLE PDF (Primary action in Blue Gradient) */}
            <button
              type="button"
              disabled={isExportingPdf || questions.length === 0}
              onClick={handleDownloadPdf}
              className="px-4 py-1.5 text-xs bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/30 transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95 border border-white/20"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="lg:hidden border-t border-blue-900/60 grid grid-cols-2 text-center text-xs font-semibold bg-blue-950/80">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`py-2 border-b-2 flex items-center justify-center gap-1.5 ${
              mobileTab === 'editor'
                ? 'border-sky-400 text-white bg-blue-900/50'
                : 'border-transparent text-blue-300'
            }`}
          >
            <Edit className="w-3.5 h-3.5" /> Question Form & List ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-2 border-b-2 flex items-center justify-center gap-1.5 ${
              mobileTab === 'preview'
                ? 'border-sky-400 text-white bg-blue-900/50'
                : 'border-transparent text-blue-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> A4 Paper Preview
          </button>
        </div>
      </header>

      {/* PROGRESS OVERLAY DURING PDF EXPORT */}
      {isExportingPdf && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-3 border border-blue-100">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Generating Your Exam PDF</h3>
            <p className="text-xs text-slate-600">
              {exportProgressText || 'Compiling 25 questions per page, math formulas, and red answer keys...'}
            </p>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Question Builder Form & Questions Manager */}
        <div
          className={`space-y-6 lg:col-span-5 no-print ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Form */}
          <QuestionForm
            onAddOrUpdateQuestion={handleAddOrUpdateQuestion}
            editingQuestion={editingQuestion}
            onCancelEdit={() => setEditingQuestion(null)}
            nextQuestionNumber={questions.length + 1}
          />

          {/* Quick AI Generator trigger banner in Blue Gradient */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm border border-blue-600/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Instant Question Presets
                </h4>
                <p className="text-[11px] text-blue-100">
                  Auto-generate Physics & Math questions with equations
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-white text-blue-900 font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
            >
              Generate
            </button>
          </div>

          {/* Questions List */}
          <QuestionList
            questions={questions}
            onEditQuestion={(q) => {
              setEditingQuestion(q);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteQuestion={handleDeleteQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onMoveQuestion={handleMoveQuestion}
            onLoadVisionSample={handleLoadVisionSample}
            onLoadMathSample={handleLoadMathSample}
            onOpenBulkImport={() => setIsBulkModalOpen(true)}
            onClearAll={() => setQuestions([])}
            activeEditingId={editingQuestion?.id}
          />
        </div>

        {/* RIGHT COLUMN: Live A4 Exam Paper Preview */}
        <div
          className={`space-y-3 lg:col-span-7 ${
            mobileTab === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Preview Toolbar with Blue Gradients & Questions-per-page selector */}
          <div className="no-print bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-blue-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">
                A4 Live Document
              </span>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                {questions.length} Questions ({Math.ceil(questions.length / (headerConfig.questionsPerPage || 25))} Pages)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Questions per page selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Page Size:</span>
                <select
                  value={headerConfig.questionsPerPage || 25}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({
                      ...prev,
                      questionsPerPage: parseInt(e.target.value, 10),
                    }))
                  }
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value={25}>25 Qs / Page (Default)</option>
                  <option value={20}>20 Qs / Page</option>
                  <option value={15}>15 Qs / Page</option>
                </select>
              </div>

              {/* Zoom buttons */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs text-slate-700">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf || questions.length === 0}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" /> Download PDF
              </button>
            </div>
          </div>

          {/* Visual Canvas Container */}
          <div className="bg-slate-300/60 p-2 sm:p-4 rounded-xl border border-slate-300/80 overflow-x-auto flex justify-center">
            <div
              id="preview-zoom-wrapper"
              style={{
                transform: isExportingPdf ? 'none' : `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: isExportingPdf ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <ExamPaperPreview
                ref={paperRef}
                questions={questions}
                headerConfig={headerConfig}
                activeQuestionId={editingQuestion?.id}
                onSelectQuestion={(q) => {
                  setEditingQuestion(q);
                  setMobileTab('editor');
                }}
              />
            </div>
          </div>

          {/* Bottom notice & hint */}
          <div className="no-print text-center text-xs text-slate-500 py-1">
            Note: Page 1 includes the full Institute Header. Page 2 and subsequent pages do not contain the header.
          </div>
        </div>
      </main>

      {/* MODALS */}
      <HeaderSettingsModal
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        config={headerConfig}
        onChange={(updated) => setHeaderConfig(updated)}
      />

      <UploadReferenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyHeaderBanner={(imageUrl) => {
          setHeaderConfig((prev) => ({
            ...prev,
            useCustomHeaderBanner: true,
            headerBannerImageUrl: imageUrl,
          }));
          showToast('Custom header banner applied!');
        }}
        onApplyPreset={(preset) => {
          setHeaderConfig((prev) => ({ ...prev, ...preset }));
          showToast('Format preset applied!');
        }}
      />

      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleBulkImport}
      />

      <AiQuestionGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestions={handleAiAddQuestions}
        currentCount={questions.length}
      />

      {/* PDF READY DOWNLOAD MODAL / DRAWER WITH MULTIPLE EXPORT FORMATS */}
      {downloadReady && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-blue-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Exam Paper is Ready!</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono truncate px-4">
                {downloadReady.fileName}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Choose your preferred export option below:
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Direct Save PDF to Computer */}
              <a
                href={downloadReady.blobUrl}
                download={downloadReady.fileName}
                onClick={() => {
                  showToast('Saving PDF file to your device...');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" /> Save PDF to Your Computer (.pdf)
              </a>

              {/* Option 2: Open in New Browser Tab */}
              <a
                href={downloadReady.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs rounded-xl border border-sky-200 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Open PDF in New Tab to View / Save
              </a>

              {/* Option 3: Browser Print dialog */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save via Browser Dialog (Ctrl + P)
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDownloadReady(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium py-1 px-3 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
