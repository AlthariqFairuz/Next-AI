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
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Error fetching chat history:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            message: msg.message,
            sources: msg.sources || [],
            created_at: msg.created_at
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error: unknown) {
        console.error('Error fetching chat history:', error);
        toast.error('Could not load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    }
    
    loadChatHistory();
  }, [userId, supabase]);
  
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
      
      return data;
      
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
      
    } catch (error: unknown) {
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
    <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800 rounded-lg shadow-xl text-foreground h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col animate-fade-in">
      <CardHeader className="px-4 py-3 border-b border-gray-800 flex flex-row items-center space-y-0 justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Chat with Your Documents
        </CardTitle>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            disabled={isLoading || isLoadingHistory}
            className="h-8 gap-1 text-xs hover:bg-gray-800/50"
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black mb-4 p-3 shadow-inner border border-gray-700">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-medium">Ask about your documents</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                Upload PDFs from the sidebar, then ask questions to get instant, AI-powered answers based on your content.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`flex max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-800/70 text-foreground backdrop-blur-sm border border-gray-700'
                }`}
              >
                <div className={`mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'user' ? 'bg-primary-foreground/20' : 'bg-gray-700'
                }`}>
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
                    <div className="mt-2 text-xs border-t border-gray-700/40 pt-2 opacity-80">
                      <div className="font-medium">Sources:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.sources.map((source, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-gray-700/70 px-2 py-0.5 text-xs">
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
      
      <CardFooter className="border-t border-gray-800 p-4 bg-black/40">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading || isLoadingHistory}
            className="flex-1 bg-gray-800/50 border-gray-700 focus-visible:ring-gray-500 placeholder:text-gray-500"
          />
          <Button
            type="submit"
            disabled={isLoading || isLoadingHistory || !input.trim() || !userId}
            size="icon"
            className="shrink-0 bg-primary hover:bg-primary/80 text-white"
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