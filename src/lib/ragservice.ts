import { CohereEmbeddings } from "@langchain/cohere";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-multilingual-v3.0"
});

// Initialize vector database
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('sample-movies');

// Process PDF files
export async function processPdf(file) {
  // Load and extract text from PDF
  const loader = new PDFLoader(file);
  const docs = await loader.load();
  
  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const chunks = await splitter.splitDocuments(docs);
  
  return chunks.map(chunk => chunk.pageContent);
}

// Vector DB operations
export async function storeDocument(documentId, texts) {
  const vectors = await Promise.all(
    texts.map(async (text, i) => ({
      id: `${documentId}-${i}`,
      values: await embeddings.embedQuery(text),
      metadata: { documentId, text, chunkIndex: i }
    }))
  );
  
  return index.upsert(vectors);
}

export async function queryDocuments(query, userId, topK = 5) {
  const queryEmbedding = await embeddings.embedQuery(query);
  return index.query({
    vector: queryEmbedding,
    filter: { userId },
    topK,
    includeMetadata: true
  });
}