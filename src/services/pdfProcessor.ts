import { env } from 'process';
import { supabase } from '@/lib/supabase';
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { CohereEmbeddings } from "@langchain/cohere";

// Initialize Cohere Embeddings
const embeddings = new CohereEmbeddings({
  apiKey: env.COHERE_API_KEY,
  model: "embed-multilingual-v3.0",
});

// Initialize pgvector connection (connection params should be set in environment variables)
const connectionConfig = {
  postgresConnectionOptions: {
    connectionString: env.DATABASE_URL || '',
  },
  tableName: 'document_embeddings',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'embedding',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
};

// Extract text from PDF
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();
    
    // Using PDF.js to extract text (would need to be loaded in client components)
    // For server components, you might want to use a PDF parsing library or API
    // This is a simplified example - in production, you'd need robust PDF parsing
    
    // Simulating text extraction result
    return "Extracted text from PDF would be here";
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
    // Extract text from PDF
    const extractedText = await extractTextFromPdf(pdfUrl);
    
    // Split text into chunks
    const textChunks = splitTextIntoChunks(extractedText);
    
    // Initialize vector store
    const vectorStore = await PGVectorStore.initialize(embeddings, connectionConfig);
    
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
    const vectorStore = await PGVectorStore.initialize(embeddings, connectionConfig);
    
    // Generate embedding for the question
    const results = await vectorStore.similaritySearch(question, topK, {
      userId, // Filter by user ID
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