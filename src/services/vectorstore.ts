import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { CohereEmbeddings } from "@langchain/cohere";

// Initialize Cohere Embeddings
const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-multilingual-v3.0",
  });

// PGVector configuration
const pgvectorConfig = {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL || '',
    },
    tableName: 'document_embeddings',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  };
  
// Initialize vector store
export const getVectorStore = async () => {
    return await PGVectorStore.initialize(embeddings, pgvectorConfig);
};