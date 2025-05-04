import { NextResponse } from "next/server";
import { queryDocuments } from "@/lib/ragservice";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openRouter = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

// Admin client to check documents
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }
    
    // Check if user has documents
    const { data: docs, error: docsError } = await supabaseAdmin
      .from("documents")
      .select("id")
      .eq("user_id", userId);
      
    if (docsError) {
      console.error("Error checking documents:", docsError);
    }
    
    if (!docs || docs.length === 0) {
      return NextResponse.json({
        response: "Please upload some documents first before asking questions.",
        sources: []
      });
    }
    
    // Query relevant documents from vector DB with more detailed error handling
    console.log("Querying documents for:", userId);
    const results = await queryDocuments(message, userId);
    console.log("Search results:", JSON.stringify(results, null, 2));
    
    if (!results || !results.matches || results.matches.length === 0) {
      return NextResponse.json({
        response: "I couldn't find relevant information in your documents to answer that question.",
        sources: []
      });
    }
    
    // Extract relevant context from the results
    const context = results.matches
      .map((match) => match.metadata.text)
      .join("\n\n");
    
    // Create sources list for citation
    const sources = [...new Set(
      results.matches.map((match) => 
        `Document-${match.metadata.documentId.substring(0, 8)}`
      )
    )];
    
    // Construct the prompt with context
    const prompt = `
      You are an AI assistant for question-answering on documents. 
      Answer the question based on the context below. If you cannot find
      the answer in the context, give a warning to user that you don't know about the context and answer as much as you can."

      Context:
      ${context}

      Question: ${message}

      Answer:`;
    
    // Get response from OpenRouter (using DeepSeek model)
    const completion = await openRouter.chat.completions.create({
      model: "deepseek/deepseek-r1-distill-qwen-14b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1000,
    });
    
    const response = completion.choices[0]?.message?.content || 
      "Sorry, I couldn't generate a response.";
    
    return NextResponse.json({
      response,
      sources,
    });
    
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}