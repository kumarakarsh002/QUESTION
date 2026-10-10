export interface QuestionOption {
  id: string; // 'a', 'b', 'c', 'd'
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  options: QuestionOption[];
  correctOptionId: string; // 'a' | 'b' | 'c' | 'd'
  layout?: 'inline' | 'two-column' | 'stacked' | 'auto';
  marks?: number;
  topic?: string;
}

export interface DocumentHeaderConfig {
  directorName: string;
  instituteName: string;
  instituteSubtitle1: string;
  instituteSubtitle2: string;
  mobileNumber: string;
  badgeText: string;
  badgeColor: 'yellow' | 'blue' | 'rose' | 'emerald' | 'purple' | 'slate';
  fontTheme: 'vision-classic' | 'modern-sans' | 'academic-serif';
  
  // Watermark
  showWatermark: boolean;
  watermarkText: string;
  watermarkImageUrl?: string;
  watermarkOpacity: number;

  // Custom Header Banner (optional upload)
  useCustomHeaderBanner: boolean;
  headerBannerImageUrl?: string;

  // Paper formatting
  fontSize: 'xs' | 'sm' | 'base';
  optionSpacing: 'compact' | 'normal' | 'relaxed';
  highlightColor: string; // default '#dc2626'
  showCorrectAnswers: boolean; // Answer key mode (red) vs Student test paper
  showPageNumbers: boolean;
  testTitle?: string;
  duration?: string;
  maxMarks?: string;
  questionsPerPage?: number;
}
