// PDF.js is loaded dynamically on the client side only
let pdfjsLib: any = null;

async function loadPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in browser environment');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Use worker file from public directory
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  
  return pdfjsLib;
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function convertPdfToImage(
  file: File
): Promise<{ previewUrl: string; base64: string; mediaType: string }> {
  // Load PDF.js dynamically
  const pdfjs = await loadPdfJs();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('無法獲取 Canvas 上下文');
  }

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const base64 = dataUrl.split(',')[1];

  return {
    previewUrl: dataUrl,
    base64,
    mediaType: 'image/jpeg'
  };
}
