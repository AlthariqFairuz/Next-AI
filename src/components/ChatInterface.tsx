"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, FileText, Bot, User } from "lucide-react";

export default function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
  }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || !userId) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        sources: data.sources || []
      }]);
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Couldn't get a response. Please try again.");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className="bg-card text-card-foreground rounded-lg border shadow-sm h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center space-y-0">
        <CardTitle className="text-base font-medium">Chat with Your Documents</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
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
              key={index}
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
                    {msg.content}
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
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !userId}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}