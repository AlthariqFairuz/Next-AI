import { CohereEmbeddings } from "@langchain/cohere";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";


const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-multilingual-v3.0"
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('sample-movies');

// Process PDF files
export async function processPdf(file) {
  try {
    // Load and extract text from PDF
    const loader = new PDFLoader(file);
    const docs = await loader.load();
    
    console.log(`Loaded ${docs.length} pages from PDF`);
    
    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const chunks = await splitter.splitDocuments(docs);
    
    console.log(`Split into ${chunks.length} chunks`);
    
    return chunks.map(chunk => chunk.pageContent);
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
}

// Vector DB operations
export async function storeDocument(documentId, texts) {
  try {
    console.log(`Creating embeddings for ${texts.length} chunks`);
    
    const vectors = await Promise.all(
      texts.map(async (text, i) => {
        const embedding = await embeddings.embedQuery(text);
        return {
          id: `${documentId}-${i}`,
          values: embedding,
          metadata: { 
            documentId, 
            text, 
            chunkIndex: i 
          }
        };
      })
    );
    
    console.log(`Storing ${vectors.length} vectors in Pinecone`);
    
    // Batch inserts for better performance
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
    
    return { success: true, count: vectors.length };
  } catch (error) {
    console.error("Error storing document:", error);
    throw error;
  }
}

export async function queryDocuments(query, userId, topK = 5) {
  try {
    console.log(`Generating embedding for query: "${query}"`);
    
    const queryEmbedding = await embeddings.embedQuery(query);
    
    console.log(`Querying Pinecone with userId: ${userId}`);
    
    // No filter for now to troubleshoot retrieval issues
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });
    
    console.log(`Found ${results.matches.length} matches`);
    
    return results;
  } catch (error) {
    console.error("Error querying documents:", error);
    throw error;
  }
}