export async function extractTextFromUrl(pdfUrl: string): Promise<string> {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      
      const response = await fetch(pdfUrl);
      const pdfBuffer = await response.arrayBuffer();
      
      const data = await pdfParse(Buffer.from(pdfBuffer));
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }