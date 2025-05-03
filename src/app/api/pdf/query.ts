import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Vector store query failed: ${errorData.error || response.statusText}`);
    }

    const { results } = await response.json();

    return NextResponse.json({
      results,
      query,
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({
      error: 'Failed to query documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}