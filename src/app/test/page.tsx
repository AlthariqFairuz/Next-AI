"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PdfUpload from "@/components/pdf/PdfUpload";
import DocumentList from "@/components/pdf/DocumentList";
import ChatInterface from "@/components/chat/ChatInterface";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { User } from '@supabase/supabase-js';

export default function TestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        setUser(data.user);
      } else {
        router.push('/auth');
      }
      
      setLoading(false);
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/auth');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push('/auth');
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to auth page via useEffect
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">DeepSeek RAG Tester</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload">
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                    <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-4">
                    <PdfUpload />
                  </TabsContent>
                  <TabsContent value="documents" className="pt-4">
                    <DocumentList />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <strong>1. Upload a PDF</strong>
                  <p className="text-muted-foreground">
                    Upload a PDF document to be processed and stored in the vector database.
                  </p>
                </div>
                <div>
                  <strong>2. Process the PDF</strong>
                  <p className="text-muted-foreground">
                    The system extracts text, chunks it, and creates embeddings.
                  </p>
                </div>
                <div>
                  <strong>3. Ask Questions</strong>
                  <p className="text-muted-foreground">
                    Use the chat interface to ask questions about your documents. 
                    The DeepSeek model will answer based on the relevant content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat interface */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="border-b">
                <CardTitle>Chat with Your Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <ChatInterface />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}