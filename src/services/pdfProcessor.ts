import { supabase } from '@/lib/supabase';
import { PDFExtract } from 'pdf.js-extract';
import { getVectorStore } from './vectorstore';

// Extract text from PDF
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();
    const pdfExtract = new PDFExtract();
    
    // const options = {};
    const data = await pdfExtract.extractBuffer(Buffer.from(pdfBuffer));
    
    // Concatenate text from all pages
    let extractedText = '';
    data.pages.forEach(page => {
      page.content.forEach(item => {
        extractedText += item.str + ' ';
      });
      extractedText += '\n\n';
    });
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Split text into chunks for embedding
export const splitTextIntoChunks = (text: string, chunkSize = 1000): string[] => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Process PDF and store embeddings
export const processPdf = async (
  pdfUrl: string, 
  userId: string, 
  documentName: string
): Promise<void> => {
  try {

    const extractedText = await extractTextFromPdf(pdfUrl);
    
    const textChunks = splitTextIntoChunks(extractedText);
    
    const vectorStore = await getVectorStore();
    
    // Embed and store each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      await vectorStore.addDocuments([{
        pageContent: chunk,
        metadata: {
          userId,
          documentName,
          chunkIndex: i,
          source: pdfUrl,
          timestamp: new Date().toISOString(),
        }
      }]);
    }
    
    // Store document metadata in Supabase
    await supabase.from('documents').insert({
      user_id: userId,
      name: documentName,
      url: pdfUrl,
      chunk_count: textChunks.length,
      created_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF');
  }
};

// Query vector store with a question
export const queryVectorStore = async (
  question: string,
  userId: string,
  topK = 5
): Promise<Array<{content: string, metadata: any}>> => {
  try {
    // Initialize vector store
    const vectorStore = await getVectorStore();
    
    // Generate embedding for the question
    const results = await vectorStore.similaritySearch(question, topK, {
      filter: { userId: userId },  // Filter by user ID
    });
    
    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    }));
  } catch (error) {
    console.error('Error querying vector store:', error);
    throw new Error('Failed to query vector store');
  }
};

const pdfProcessor = {
  extractTextFromPdf,
  splitTextIntoChunks,
  processPdf,
  queryVectorStore,
};

export default pdfProcessor;