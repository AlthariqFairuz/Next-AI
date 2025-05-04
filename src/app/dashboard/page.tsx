"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";
import { FileText, ChevronRight, CircleHelp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
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
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error("Error fetching documents: " + message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDocumentUpload = () => {
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page heading with subtle animation */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Document Dashboard
          </h1>
          <p className="text-muted-foreground">
            Upload PDFs and chat with your documents using AI
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden mb-6">
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-md py-2"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-md py-2"
              >
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4 animate-fade-in">
              <ChatInterface userId={user?.id || ""} />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4 animate-fade-in">
              <div className="space-y-6">
                <FileUpload
                  userId={user?.id || ""}
                  onUpload={handleDocumentUpload}
                />

                <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800 shadow-xl">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" /> 
                      Your Documents
                    </h2>
                    {documents.length > 0 && (
                      <span className="text-sm bg-gray-800 px-2 py-1 rounded-md">
                        {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {isLoading ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-12 animate-fade-in">
                        <div className="bg-gray-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CircleHelp className="h-10 w-10 text-gray-500" />
                        </div>
                        <p className="text-lg text-gray-300 mb-2">No documents yet</p>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                          Upload your first PDF document to start asking questions and get AI-powered answers.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-3 animate-fade-in">
                        {documents.map((doc) => (
                          <li 
                            key={doc.id} 
                            className="group flex items-center justify-between p-3 rounded-md border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-700 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p className="truncate font-medium text-sm">{doc.name}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors group-hover:bg-gray-700"
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

            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800 shadow-xl hover:shadow-2xl transition-all animate-fade-in">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 
                  Your Documents
                </h2>
                {documents.length > 0 && (
                  <span className="text-sm bg-gray-800 px-2 py-1 rounded-md">
                    {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                  </span>
                )}
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="bg-gray-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CircleHelp className="h-10 w-10 text-gray-500" />
                    </div>
                    <p className="text-lg text-gray-300 mb-2">No documents yet</p>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                      Upload your first PDF document to start asking questions and get AI-powered answers.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3 animate-fade-in">
                    {documents.map((doc) => (
                      <li 
                        key={doc.id} 
                        className="group flex items-center justify-between p-3 rounded-md border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <p className="truncate font-medium text-sm">{doc.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors group-hover:bg-gray-700"
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
      </main>

      <Footer />

      {/* Global CSS for consistent animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 1.5s ease-in-out infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-slide-up,
          .animate-bounce-gentle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}