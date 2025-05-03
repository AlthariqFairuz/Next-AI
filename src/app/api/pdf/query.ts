import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided');
}


export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, topK = 5 } = body;

    if (!query || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      // Query the vector store
      const response = await fetch(new URL('/api/vectorstore', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'similarity_search',
          params: {
            query: query,
            filter: { userId: userId },
            limit: topK
          }
        }),
      });

      // If vector store returns an error, just return empty results instead of failing
      if (!response.ok) {
        console.warn('Vector store search returned an error, returning empty results');
        return NextResponse.json({
          results: [],
          query,
          noDocuments: true,
        });
      }

      const { results } = await response.json();

      // Handle empty results gracefully
      return NextResponse.json({
        results: results || [],
        query,
        noDocuments: !results || results.length === 0
      });
    } catch (vectorStoreError) {
      console.error('Vector store error:', vectorStoreError);
      // Return empty results on error instead of failing
      return NextResponse.json({
        results: [],
        query,
        noDocuments: true,
        message: 'No documents available for search'
      });
    }
  } catch (error) {
    console.error('Query error:', error);
    // Return empty results instead of an error
    return NextResponse.json({
      results: [],
      query: '',
      noDocuments: true,
      message: 'No documents available for search'
    });
  }
}