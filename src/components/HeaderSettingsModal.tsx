import React, { useRef } from 'react';
import { DocumentHeaderConfig } from '../types';
import { DEFAULT_HEADER_CONFIG } from '../data/sampleQuestions';
import { X, Sliders, Image, RotateCcw, Upload, Check } from 'lucide-react';

interface HeaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DocumentHeaderConfig;
  onChange: (updated: DocumentHeaderConfig) => void;
}

export const HeaderSettingsModal: React.FC<HeaderSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const headerBannerInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...config,
          useCustomHeaderBanner: true,
          headerBannerImageUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...config,
          showWatermark: true,
          watermarkImageUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/20 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Exam Paper Format & Header Settings
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

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Header Type selection */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Header Style</span>
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_HEADER_CONFIG })}
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Vision Classes Preset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...config, useCustomHeaderBanner: false })}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                  !config.useCustomHeaderBanner
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">Standard Institute Template</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Matches Vision Classes with Director, Phone, stylized title & class badge
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange({ ...config, useCustomHeaderBanner: true });
                  if (!config.headerBannerImageUrl && headerBannerInputRef.current) {
                    headerBannerInputRef.current.click();
                  }
                }}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                  config.useCustomHeaderBanner
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">Upload Custom Banner / Logo</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Use your own scanned header image or banner
                </div>
              </button>
            </div>

            {config.useCustomHeaderBanner && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                <input
                  ref={headerBannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => headerBannerInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded-md text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Header Banner Image
                </button>
                {config.headerBannerImageUrl && (
                  <span className="text-[11px] text-emerald-600 font-medium">✓ Image uploaded</span>
                )}
              </div>
            )}
          </div>

          {/* Template fields if not custom banner */}
          {!config.useCustomHeaderBanner && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs border-b pb-1">
                Institute Header Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Director Name (Top Left):</label>
                  <input
                    type="text"
                    value={config.directorName}
                    onChange={(e) => onChange({ ...config, directorName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-medium"
                    placeholder="Dir. Aditya Kr. Singh"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Mobile / Phone (Top Right):</label>
                  <input
                    type="text"
                    value={config.mobileNumber}
                    onChange={(e) => onChange({ ...config, mobileNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-medium"
                    placeholder="Mobile - 9955811379"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Institute Name (Center Large Title):</label>
                <input
                  type="text"
                  value={config.instituteName}
                  onChange={(e) => onChange({ ...config, instituteName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-bold uppercase tracking-wider text-blue-700"
                  placeholder="VISION CLASSES"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Address / Tagline (Line 1):</label>
                <input
                  type="text"
                  value={config.instituteSubtitle1}
                  onChange={(e) => onChange({ ...config, instituteSubtitle1: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                  placeholder="OLD A.N.S COLLEGE GATE, PANCHSHEEL NAGAR, BARH"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Subjects / Streams (Line 2):</label>
                <input
                  type="text"
                  value={config.instituteSubtitle2}
                  onChange={(e) => onChange({ ...config, instituteSubtitle2: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                  placeholder="MATHS. FOR XI & XII MATHS, PHYSICS, CHEMISTRY, BIOLOGY FOR IX & X"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Class Badge Text:</label>
                  <input
                    type="text"
                    value={config.badgeText}
                    onChange={(e) => onChange({ ...config, badgeText: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-medium"
                    placeholder="Class – 8th"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Badge Background Color:</label>
                  <select
                    value={config.badgeColor}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        badgeColor: e.target.value as DocumentHeaderConfig['badgeColor'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-medium"
                  >
                    <option value="yellow">Yellow (Uploaded Format)</option>
                    <option value="blue">Blue</option>
                    <option value="rose">Rose</option>
                    <option value="emerald">Emerald</option>
                    <option value="purple">Purple</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Watermark Section */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Background Watermark</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-normal">
                <input
                  type="checkbox"
                  checked={config.showWatermark}
                  onChange={(e) => onChange({ ...config, showWatermark: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Enable Watermark</span>
              </label>
            </h4>

            {config.showWatermark && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <label className="font-semibold block mb-1">Watermark Letter / Monogram:</label>
                  <input
                    type="text"
                    value={config.watermarkText}
                    onChange={(e) => onChange({ ...config, watermarkText: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-bold"
                    placeholder="A"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Opacity: {Math.round(config.watermarkOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.25"
                    step="0.01"
                    value={config.watermarkOpacity}
                    onChange={(e) =>
                      onChange({ ...config, watermarkOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full mt-2 accent-red-600"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => watermarkInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 font-medium inline-flex items-center gap-1"
                  >
                    <Image className="w-3.5 h-3.5" /> Or Upload Watermark Logo Image
                  </button>
                  {config.watermarkImageUrl && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...config, watermarkImageUrl: undefined })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove custom image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Typography & Page Density */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-bold text-slate-800 text-xs">Page Pagination & Questions Count</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Questions Per Page:</label>
                <select
                  value={config.questionsPerPage || 25}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      questionsPerPage: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs font-bold text-blue-800"
                >
                  <option value={25}>25 Questions (Uploaded Format)</option>
                  <option value={20}>20 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={30}>30 Questions (Extra compact)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Font Size:</label>
                <select
                  value={config.fontSize}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      fontSize: e.target.value as DocumentHeaderConfig['fontSize'],
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="xs">Compact (10.5px - fits 25 questions on page 1)</option>
                  <option value="sm">Normal (11.5px)</option>
                  <option value="base">Relaxed (12.5px)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Spacing Between Questions:</label>
                <select
                  value={config.optionSpacing}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      optionSpacing: e.target.value as DocumentHeaderConfig['optionSpacing'],
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="compact">Compact (Uploaded PDF style)</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Apply & Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSettingsModal;
