"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { FileText, Trash2 } from 'lucide-react';

type Document = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  chunk_count: number;
};

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch documents for current user
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast("Error", {
        description: error instanceof Error ? error.message : 'Failed to fetch documents',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Delete from vector store (this would need to be implemented on the server)
      // In a real implementation, you'd need to handle this with an API endpoint
      // that would delete the document chunks from the vector store
      
      toast("Success", {
        description: "Document deleted successfully",
      });
      
      // Refresh document list
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast("Error", {
        description: error instanceof Error ? error.message : 'Failed to delete document',
      });
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading documents...</div>;
  }
  
  if (documents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No documents yet. Upload a PDF to get started.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">Your Documents</div>
      
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{doc.name}</div>
                <div className="text-sm text-muted-foreground">
                  Uploaded on {new Date(doc.created_at).toLocaleDateString()} • 
                  {doc.chunk_count} chunks
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(doc.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}