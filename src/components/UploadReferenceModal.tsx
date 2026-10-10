import React, { useState } from 'react';
import { DocumentHeaderConfig } from '../types';
import { Upload, FileCheck, Image, AlertCircle, X, Check } from 'lucide-react';

interface UploadReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHeaderBanner: (imageUrl: string) => void;
  onApplyPreset: (config: Partial<DocumentHeaderConfig>) => void;
}

export const UploadReferenceModal: React.FC<UploadReferenceModalProps> = ({
  isOpen,
  onClose,
  onApplyHeaderBanner,
  onApplyPreset,
}) => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useAsHeader, setUseAsHeader] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // PDF file uploaded
      setPreviewUrl(null);
    }
  };

  const handleApply = () => {
    if (previewUrl && useAsHeader) {
      onApplyHeaderBanner(previewUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/20 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Upload Your PDF Format / Header Template
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
            Upload your coaching institute question paper (PDF or image). You can use its header/banner directly for your generated test paper, or match the layout automatically.
          </p>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-red-50/20 group">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-800 text-xs">
              Click to select PDF or Institute Header image
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Supports .pdf, .png, .jpg, .webp
            </span>
          </label>

          {uploadedFileName && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">{uploadedFileName}</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Loaded</span>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <span className="font-semibold text-slate-800 block">Uploaded Preview:</span>
              <div className="max-h-36 overflow-hidden rounded border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Uploaded template"
                  className="max-h-36 object-contain"
                />
              </div>

              <label className="flex items-center gap-2 mt-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAsHeader}
                  onChange={(e) => setUseAsHeader(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Use this image directly as the Institute Header Banner in the PDF</span>
              </label>
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
            Close
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadReferenceModal;
