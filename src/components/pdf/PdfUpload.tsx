// src/components/pdf/PdfUpload.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cloudinaryUpload } from '@/services/cloudinary';
import { processPdf } from '@/services/pdfProcessor';
import { supabase } from '@/lib/supabase';
import { Upload, File } from 'lucide-react';

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast("Invalid file type", {
          description: "Please upload a PDF file",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Set default document name from file name
      if (!documentName) {
        setDocumentName(selectedFile.name.replace(/\.pdf$/, ''));
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file || !documentName) {
      toast("Missing information", {
        description: "Please select a file and provide a document name",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Upload to Cloudinary
      const cloudinaryUrl = await cloudinaryUpload(file);
      
      // Process PDF and store in vector database
      await processPdf(cloudinaryUrl, user.id, documentName);
      
      toast("Success", {
        description: "PDF uploaded and processed successfully",
      });
      
      // Reset form
      setFile(null);
      setDocumentName('');
      
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast("Error", {
        description: error instanceof Error ? error.message : 'Failed to upload and process PDF',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="text-lg font-medium">Upload PDF Document</div>
      
      <div className="space-y-2">
        <Input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <Input
          type="text"
          placeholder="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          disabled={isUploading}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || !documentName || isUploading}
        >
          {isUploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Process
            </>
          )}
        </Button>
      </div>
      
      {file && (
        <div className="text-sm text-muted-foreground">
          <File className="inline mr-2 h-4 w-4" />
          {file.name} ({Math.round(file.size / 1024)} KB)
        </div>
      )}
    </div>
  );
}