import { NextResponse } from "next/server";
import { queryDocuments } from "@/lib/ragservice";
import OpenAI from "openai";

// Initialize OpenRouter client
const openRouter = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }
    
    // Query relevant documents from vector DB
    const results = await queryDocuments(message, userId);
    
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
the answer in the context, just say "I don't know based on the available documents."

Context:
${context}

Question: ${message}

Answer:`;
    
    // Get response from OpenRouter (using DeepSeek model)
    const completion = await openRouter.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
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