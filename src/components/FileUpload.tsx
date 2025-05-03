"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, File, Loader2 } from "lucide-react";

interface FileUploadProps {
  userId: string;
  onUpload?: () => void;
}

export default function FileUpload({ userId, onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    
    setFileName(file.name);
    setUploading(true);
    setProgress(10);
    
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      setProgress(20);
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(filePath);
      
      setProgress(40);
      
      // 3. Process the PDF for RAG
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentName', file.name.replace(/\.[^/.]+$/, ""));
      
      setProgress(60);
      
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
      setProgress(80);
      
      // 4. Add document to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: publicUrl,
          created_at: new Date().toISOString(),
        });
        
      if (dbError) throw dbError;
      
      setProgress(100);
      toast.success('Document uploaded successfully!');
      
      if (onUpload) onUpload();
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setFileName('');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000);
    }
  }
  
  function handleButtonClick() {
    fileInputRef.current?.click();
  }
  
  return (
    <Card>
      <CardHeader className="px-6 py-3 border-b">
        <CardTitle className="text-lg">Upload PDF</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Processing PDF...</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">{fileName}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload a PDF</p>
                <p className="text-xs text-muted-foreground">
                  or drag and drop
                </p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            PDF files only. Max size: 10MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}