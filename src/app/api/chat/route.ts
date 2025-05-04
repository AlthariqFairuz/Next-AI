import { NextResponse } from "next/server";
import { queryDocuments } from "@/lib/ragservice";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
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
    const { error: docsError } = await supabaseAdmin
      .from("documents")
      .select("id")
      .eq("user_id", userId);

    const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('model_id')
    .eq('user_id', userId)
    .single();

    const modelId = userPrefs?.model_id || "meta-llama/llama-4-scout:free";
      
    if (docsError) {
      console.error("Error checking documents:", docsError);
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
      .map((match) => match.metadata?.text || '')
      .join("\n\n");
    
    // // Create sources list for citation
    // const sources = [...new Set(
    //   results.matches.map((match) => 
    //     `Document-${match.metadata.documentId.substring(0, 8)}`
    //   )
    // )];
    
    // Construct the prompt with context
    const prompt = `
      You are an AI assistant for question-answering on documents. Your model is ${modelId}.
      You have access to the following context from the user's documents. 
      Answer the question based on the context below unless the user say otherwise. If you cannot find
      the answer in the context or there is no context provided, 
      give a warning to user that you are unsure and answer based on your knowledge or your assumption."

      Context:
      ${context}

      Question: ${message}

      Answer:`;
    
    // Get response from OpenRouter 
    const completion = await openRouter.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    const response = completion.choices[0]?.message?.content || 
      "Sorry, I couldn't generate a response.";
    
    return NextResponse.json({
      response
    });
    
  } catch (error: Error | unknown) {
    console.error("Error in chat API:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process chat request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}