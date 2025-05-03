import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractTextFromUrl } from '@/lib/pdfWrapper';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided');
}

// Server-side Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Split text into chunks
const splitTextIntoChunks = (text: string, chunkSize = 1000): string[] => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Extract text from PDF using our safe wrapper
const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  return extractTextFromUrl(pdfUrl);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdfUrl, userId, documentName } = body;

    if (!pdfUrl || !userId || !documentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPdf(pdfUrl);
    
    // Split into chunks
    const textChunks = splitTextIntoChunks(extractedText);
    
    // Process each chunk through the vector store API
    const chunkPromises = textChunks.map(async (chunk, index) => {
      const response = await fetch(new URL('/api/vectorstore', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'add_document',
          params: {
            document: chunk,
            metadata: {
              userId,
              documentName,
              chunkIndex: index,
              source: pdfUrl,
              timestamp: new Date().toISOString(),
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add document chunk ${index} to vector store`);
      }
    });
    
    // Wait for all chunks to be processed
    await Promise.all(chunkPromises);
    
    // Store document metadata in Supabase
    const { error } = await supabase.from('documents').insert({
      user_id: userId,
      name: documentName,
      url: pdfUrl,
      chunk_count: textChunks.length,
      created_at: new Date().toISOString(),
    });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true,
      chunkCount: textChunks.length,
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}