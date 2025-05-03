"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error("Error fetching documents: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDocumentUpload = () => {
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">DeepSeek RAG</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="outline"
                onClick={signOut}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <FileUpload
              userId={user?.id || ""}
              onUpload={handleDocumentUpload}
            />

            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Your Documents</h2>
              
              {isLoading ? (
                <p className="text-gray-500">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View Document
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <ChatInterface userId={user?.id || ""} />
          </div>
        </div>
      </main>
    </div>
  );
}