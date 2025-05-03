"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Bot, User, RotateCcw } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  message: string; 
  sources?: string[];
  created_at?: string;
}

export default function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create supabase client once
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch chat history on component mount
  useEffect(() => {
    async function loadChatHistory() {
      if (!userId) return;
      
      setIsLoadingHistory(true);
      try {
        console.log("Fetching chat history for user:", userId);
        
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Error fetching chat history:", error);
          throw error;
        }
        
        console.log("Fetched chat history:", data);
        
        if (data && data.length > 0) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            message: msg.message,
            sources: msg.sources || [],
            created_at: msg.created_at
          }));
          
          setMessages(formattedMessages);
          console.log("Set messages state with:", formattedMessages.length, "messages");
        } else {
          console.log("No chat history found");
        }
      } catch (error: any) {
        console.error('Error fetching chat history:', error);
        toast.error('Could not load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    }
    
    loadChatHistory();
  }, [userId]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);
  
  async function saveChatMessage(message: Message) {
    if (!userId) return null;
    
    try {
      console.log("Saving chat message:", message.role, "for user:", userId);
      
      // Format sources for JSONB
      const sourcesData = message.sources && message.sources.length > 0 
        ? message.sources 
        : null;
      
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          role: message.role,
          message: message.message,
          sources: sourcesData
        })
        .select();
      
      if (error) {
        console.error("Error saving chat message:", error);
        throw error;
      }
      
      console.log("Successfully saved chat message:", data);
      return data;
      
    } catch (error: any) {
      console.error('Error saving chat message:', error);
      toast.error('Failed to save message');
      return null;
    }
  }
  
  async function clearChatHistory() {
    if (!confirm('Are you sure you want to clear your chat history?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error: any) {
      console.error('Error clearing chat history:', error);
      toast.error('Could not clear chat history');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || !userId) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Create user message
    const newUserMessage: Message = { 
      role: 'user', 
      message: userMessage
    };
    
    // Add user message to UI
    setMessages(prev => [...prev, newUserMessage]);
    
    // Save user message to database
    await saveChatMessage(newUserMessage);
    
    setIsLoading(true);
    
    try {
      // Call API for chat response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Create AI response
      const newAIMessage: Message = { 
        role: 'assistant', 
        message: data.response,
        sources: data.sources || []
      };
      
      // Add AI response to UI
      setMessages(prev => [...prev, newAIMessage]);
      
      // Save AI response to database
      await saveChatMessage(newAIMessage);
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Couldn't get a response. Please try again.");
      
      const errorMessage: Message = { 
        role: 'assistant', 
        message: 'Sorry, I encountered an error. Please try again.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className="bg-card text-card-foreground rounded-lg border shadow-sm h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center space-y-0 justify-between">
        <CardTitle className="text-base font-medium">Chat with Your Documents</CardTitle>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            disabled={isLoading || isLoadingHistory}
            className="h-8 gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Clear History
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Ask about your documents</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                Upload PDFs from the sidebar, then ask questions to get instant, AI-powered answers based on your content.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background/30">
                  {msg.role === 'user' ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="prose-sm whitespace-pre-wrap">
                    {msg.message}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs border-t border-border/40 pt-2 opacity-80">
                      <div className="font-medium">Sources:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.sources.map((source, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading || isLoadingHistory}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || isLoadingHistory || !input.trim() || !userId}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}