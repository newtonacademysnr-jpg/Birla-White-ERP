import html2pdf from 'html2pdf.js';

/**
 * Downloads a DOM element as a real, official PDF document (A4 portrait).
 * @param {string} elementId - ID of the DOM element to export
 * @param {string} filename - Desired filename of the PDF
 */
export async function downloadElementAsPdf(elementId, filename = 'Birla_White_Document.pdf') {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} not found for PDF download`);
    return false;
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const opt = {
    margin: [6, 6, 6, 6], // top, left, bottom, right in mm
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      windowWidth: 1024
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  try {
    await html2pdf().set(opt).from(el).save();
    return true;
  } catch (err) {
    console.error('html2pdf generation error:', err);
    throw err;
  }
}

/**
 * Triggers clean single-page printing by isolating the target element directly on document.body,
 * hiding the entire single-page-app layout tree (#root) during print.
 * This completely prevents the 7-8 extra blank pages caused by background DOM scroll height.
 * @param {string} elementId - ID of the DOM element to print
 */
export function printElementIsolated(elementId) {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    window.print();
    return;
  }

  // Remove existing isolated container if lingering
  const existing = document.getElementById('print-isolated-container');
  if (existing) {
    existing.remove();
  }

  // Create isolated container attached directly to document.body
  const printContainer = document.createElement('div');
  printContainer.id = 'print-isolated-container';

  // Clone element content
  const clone = sourceEl.cloneNode(true);
  clone.id = `${elementId}-isolated-clone`;
  printContainer.appendChild(clone);
  document.body.appendChild(printContainer);

  document.body.classList.add('print-active-isolated');

  const cleanup = () => {
    document.body.classList.remove('print-active-isolated');
    const c = document.getElementById('print-isolated-container');
    if (c) c.remove();
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Short delay allowing DOM paint before print dialog triggers
  setTimeout(() => {
    window.print();
    setTimeout(cleanup, 2500); // Safety fallback
  }, 150);
}
