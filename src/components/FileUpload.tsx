"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function FileUpload({ userId, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    
    setFileName(file.name);
    setUploading(true);
    
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(filePath);
      
      // 3. Process the PDF for RAG
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentName', file.name.replace(/\.[^/.]+$/, ""));
      
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
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
      
      alert('Document uploaded and processed successfully!');
      if (onUpload) onUpload();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.message);
    } finally {
      setUploading(false);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-medium mb-4">Upload PDF</h2>
      
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full border p-2 rounded"
        />
        
        {uploading && (
          <div className="text-sm text-gray-500">
            Processing {fileName}...
          </div>
        )}
      </div>
    </div>
  );
}