import { PdfPageImage } from '../types';

declare const pdfjsLib: any;

export const loadPdfDocument = async (file: File | Blob): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    return await loadingTask.promise;
  } catch (error: any) {
    if (error.name === 'RenderingCancelledException' || error.message?.includes('cancelled') || error.message === 'Canceled') {
      return null;
    }
    throw error;
  }
};

export const renderPageToImage = async (pdfDoc: any, pageNumber: number, scale: number = 3): Promise<PdfPageImage> => {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    // Get the viewport at the requested scale (high res for canvas)
    const viewport = page.getViewport({ scale });
    
    // Get the viewport at scale 1 for logical dimensions (CSS pixels)
    const defaultViewport = page.getViewport({ scale: 1 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Canvas context missing");

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return {
      pageNumber,
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      // We return the logical width/height for the Stage placement
      width: defaultViewport.width,
      height: defaultViewport.height
    };
  } catch (error: any) {
    if (error.name === 'RenderingCancelledException' || error.message?.includes('cancelled') || error.message === 'Canceled') {
      throw new Error('Cancelled');
    }
    throw error;
  }
};