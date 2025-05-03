import { NextResponse } from "next/server";
import { processPdf, storeDocument } from "@/lib/ragservice";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import * as os from "os";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const documentName = formData.get("documentName") as string;
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temp file
    const tempFilePath = join(os.tmpdir(), `${documentId}.pdf`);
    await writeFile(tempFilePath, buffer);
    
    // Process PDF and get text chunks
    const textChunks = await processPdf(tempFilePath);
    
    // Store text chunks in vector database
    await storeDocument(documentId, textChunks);
    
    // Insert document metadata to Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY!, 
      { auth: { persistSession: false } }
    );
    
    // Then use this client for database operations
    const { error } = await supabaseAdmin
      .from("document_metadata")
      .insert({
        id: documentId,
        user_id: userId,
        name: documentName,
        chunk_count: textChunks.length,
      });
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      documentId,
      message: "Document processed successfully",
    });
    
  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}

// function createClient(arg0: string, arg1: string, arg2: { auth: { persistSession: boolean; }; }) {
//   throw new Error("Function not implemented.");
// }
