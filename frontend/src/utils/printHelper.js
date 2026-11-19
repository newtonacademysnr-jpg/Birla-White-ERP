import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads a DOM element as a real, official PDF document (A4 portrait).
 * Renders in a dedicated A4 sandbox (794px width) so that responsive layouts
 * on phones, tablets, or narrow viewports are exported in pristine full desktop format.
 * Automatically guarantees a crisp single-page fit without overflowing into blank pages.
 *
 * @param {string} elementId - ID of the DOM element to export
 * @param {string} filename - Desired filename of the PDF
 */
export async function downloadElementAsPdf(elementId, filename = 'Birla_White_Document.pdf') {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    console.error(`Element #${elementId} not found for PDF download`);
    return false;
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // 1. Create an isolated off-screen sandbox with exact A4 desktop dimensions
  // 794px corresponds to 210mm at standard 96 DPI screen density.
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-9999px';
  sandbox.style.top = '0';
  sandbox.style.width = '794px';
  sandbox.style.minWidth = '794px';
  sandbox.style.maxWidth = '794px';
  sandbox.style.background = '#ffffff';
  sandbox.style.zIndex = '-9999';
  sandbox.style.opacity = '1';
  sandbox.style.visibility = 'visible';

  // 2. Deep clone the source element into the sandbox
  const clone = sourceEl.cloneNode(true);
  clone.id = `${elementId}-pdf-export-clone`;
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.margin = '0 auto';
  clone.style.boxSizing = 'border-box';
  clone.style.background = '#ffffff';
  clone.style.borderRadius = '0';
  clone.style.border = 'none';
  clone.style.boxShadow = 'none';

  // Ensure all images inside clone have proper crossOrigin setup
  const images = clone.querySelectorAll('img');
  images.forEach((img) => {
    img.crossOrigin = 'anonymous';
  });

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // Short wait to ensure DOM styles and fonts are calculated
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. Render high-resolution canvas with html2canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x scale for sharp, high-DPI text rendering
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794
    });

    // 4. Convert canvas to JPEG data URL
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 5. Construct jsPDF instance (A4 Portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const margin = 6; // 6 mm border margins
    const availableWidth = pageWidth - margin * 2; // 198 mm
    const availableHeight = pageHeight - margin * 2; // 285 mm

    // Compute proportional height in mm
    const contentHeight = (canvas.height * availableWidth) / canvas.width;

    if (contentHeight <= availableHeight) {
      // Clean single page fit
      pdf.addImage(imgData, 'JPEG', margin, margin, availableWidth, contentHeight, undefined, 'FAST');
    } else if (contentHeight <= availableHeight * 1.25) {
      // Slightly longer than 1 page: scale down so official invoice/challan remains on 1 single page
      const scale = availableHeight / contentHeight;
      const fitWidth = availableWidth * scale;
      const fitHeight = contentHeight * scale;
      const xOffset = margin + (availableWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, margin, fitWidth, fitHeight, undefined, 'FAST');
    } else {
      // Truly long document: multi-page pagination
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, availableWidth, contentHeight, undefined, 'FAST');
      heightLeft -= availableHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, availableWidth, contentHeight, undefined, 'FAST');
        heightLeft -= availableHeight;
      }
    }

    // 6. Direct file download into browser's Downloads folder
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('downloadElementAsPdf error:', err);
    throw err;
  } finally {
    // 7. Always remove sandbox container from document body
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
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
