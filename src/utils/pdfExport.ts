import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  fileName?: string;
  onProgress?: (status: string) => void;
}

export interface ExportResult {
  success: boolean;
  blobUrl: string;
  fileName: string;
  pageImages: string[];
}

/**
 * Captures all .exam-a4-page elements and compiles a multi-page A4 PDF document.
 * Temporarily resets preview zoom transforms to ensure 100% sharp, distortion-free capture.
 */
export async function downloadExamPaperPdf(
  options: ExportPdfOptions = {}
): Promise<ExportResult> {
  const { fileName = 'Question_Paper.pdf', onProgress } = options;

  const pageElements = document.querySelectorAll<HTMLElement>('.exam-a4-page');
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No exam paper pages found to export. Please check that preview is loaded.');
  }

  // Find preview zoom wrapper to temporarily neutralize zoom scale during capture
  const zoomWrapper = document.getElementById('preview-zoom-wrapper');
  const originalTransform = zoomWrapper ? zoomWrapper.style.transform : '';
  if (zoomWrapper) {
    zoomWrapper.style.transform = 'none';
  }

  onProgress?.('Preparing pages for PDF generation...');

  // Scroll to top to ensure clean capture coordinates
  const prevScrollY = window.scrollY;
  window.scrollTo(0, 0);

  const pageImages: string[] = [];

  try {
    // Wait for repaint after zoom reset
    await new Promise((r) => setTimeout(r, 100));

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Rendering Page ${i + 1} of ${pageElements.length}...`);

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x retina clarity for math formulas and red text
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pageImages.push(imgData);

      if (i > 0) {
        pdf.addPage();
      }

      // Add image filling standard A4 page (210mm x 297mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    onProgress?.('Generating downloadable PDF file...');

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // Primary: Call jsPDF's built-in file saver
    try {
      pdf.save(fileName);
    } catch (saveErr) {
      console.warn('pdf.save encountered browser sandbox, using blob trigger:', saveErr);
    }

    // Secondary: Direct anchor download link
    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.target = '_blank';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
      }, 1000);
    } catch (clickErr) {
      console.warn('Direct click caught by browser security:', clickErr);
    }

    return {
      success: true,
      blobUrl,
      fileName,
      pageImages,
    };
  } finally {
    // Restore original zoom transform and scroll position
    if (zoomWrapper) {
      zoomWrapper.style.transform = originalTransform;
    }
    window.scrollTo(0, prevScrollY);
  }
}

/**
 * Triggers browser print dialog for vector PDF output
 */
export function printExamPaper(): void {
  window.print();
}
