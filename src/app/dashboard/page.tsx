"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";
import { FileText, LogOut, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const [activeTab, setActiveTab] = useState<string>("chat");

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

  // Mobile-friendly layout with tabs
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mt-6">
        {/* Mobile tabs */}
        <div className="md:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4">
              <ChatInterface userId={user?.id || ""} />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <div className="space-y-6">
                <FileUpload
                  userId={user?.id || ""}
                  onUpload={handleDocumentUpload}
                />

                <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">Your Documents</h2>
                  </div>
                  <div className="p-4">
                    {isLoading ? (
                      <p className="text-muted-foreground">Loading documents...</p>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-4 text-muted-foreground">No documents uploaded yet.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {documents.map((doc) => (
                          <li key={doc.id} className="group flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 rounded-full p-1 hover:bg-accent"
                            >
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View Document</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <FileUpload
              userId={user?.id || ""}
              onUpload={handleDocumentUpload}
            />

            <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Your Documents</h2>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <p className="text-muted-foreground">Loading documents...</p>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-4 text-muted-foreground">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id} className="group flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 rounded-full p-1 hover:bg-accent"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">View Document</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <ChatInterface userId={user?.id || ""} />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}