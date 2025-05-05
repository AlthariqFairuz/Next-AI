"use client";

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, FileIcon, CheckCircle2, FilePlus } from "lucide-react";
import { FileUploadProps } from '@/types/FileUploadProps';

export default function FileUpload({ userId, onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // use createBrowserClient to check auth cookies
  const supabase = createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  
  // Reset success state after animation completes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [success]);
  
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    
    processFile(file);
  }
  
  async function processFile(file: File) {
    if (!userId) {
      toast.error('User ID is missing. Please log in again.');
      return;
    }
    
    setFileName(file.name);
    setUploading(true);
    setProgress(10);
    
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const storageFileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${storageFileName}`;
      setProgress(20);
      
      // Upload the file directly
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/pdfs/${userId}/${storageFileName}`;


      setProgress(40);
      
      // 3. Process the PDF for RAG
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentName', file.name.replace(/\.[^/.]+$/, ""));
      formData.append('fileUrl', fileUrl);
      // formData.append('modelId', selectedModel);
      
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
      
      setProgress(100);
      toast.success('Document uploaded successfully!');
      setSuccess(true);
      
      if (onUpload) onUpload();
      
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
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
  
  // Drag and drop handlers
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }
  
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      processFile(file);
    }
  }
  
  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black text-foreground rounded-lg border border-gray-800 shadow-xl hover:shadow-2xl hover:border-gray-700 transition-all animate-fade-in">
      <CardHeader className="px-4 py-3 border-b border-gray-800 flex flex-row items-center space-y-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          Upload Document
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all duration-200 ${
              dragActive ? 'border-primary bg-primary/5 scale-105' : 'border-gray-700 hover:bg-gray-800/50'
            } ${success ? 'bg-green-900/20 border-green-700' : ''}`}
            onClick={handleButtonClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
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
              <div className="flex flex-col items-center space-y-3 animate-fade-in">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Processing PDF...</p>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ 
                      width: `${progress}%`,
                      transition: 'width 0.5s ease-in-out'
                    }} 
                  />
                </div>
                <div className="flex items-center text-xs gap-2 text-muted-foreground animate-slide-up">
                  <FileIcon className="h-3 w-3" />
                  <span className="truncate max-w-[180px]">{fileName}</span>
                </div>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center space-y-2 animate-slide-up">
                <CheckCircle2 className="h-8 w-8 text-green-500 animate-pulse" />
                <p className="text-sm font-medium text-green-400">Upload Complete!</p>
                <p className="text-xs text-green-500/80">Your document is ready to use</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Upload className={`h-8 w-8 text-muted-foreground ${dragActive ? 'text-primary animate-bounce-gentle' : ''}`} />
                  {dragActive && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {dragActive ? "Drop PDF here" : "Drop PDF here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF files only, max 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}