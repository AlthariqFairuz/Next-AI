import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, params } = body;

    if (!operation) {
      return NextResponse.json({ error: 'Operation not specified' }, { status: 400 });
    }

    const vectorStore = await PGVectorStore.initialize(embeddings, pgvectorConfig);

    switch (operation) {
      case 'add_document': {
        const { document, metadata } = params;
        if (!document || !metadata) {
          return NextResponse.json({ error: 'Document or metadata not provided' }, { status: 400 });
        }

        await vectorStore.addDocuments([
          {
            pageContent: document,
            metadata: metadata,
          },
        ]);

        return NextResponse.json({ success: true });
      }

      case 'similarity_search': {
        const { query, filter, limit = 5 } = params;
        if (!query) {
          return NextResponse.json({ error: 'Query not provided' }, { status: 400 });
        }

        const results = await vectorStore.similaritySearch(query, limit, filter);
        
        return NextResponse.json({
          results: results.map(doc => ({
            content: doc.pageContent,
            metadata: doc.metadata,
          })),
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Vector store API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}