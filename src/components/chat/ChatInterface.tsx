"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import openRouterService from '@/services/openRouter';
import { supabase } from '@/lib/supabase';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Get user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Retrieve relevant chunks from vector store API
      const queryResponse = await fetch('/api/pdf/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          userId: user.id,
          topK: 5
        }),
      });
      
      if (!queryResponse.ok) {
        const errorData = await queryResponse.json();
        throw new Error(errorData.details || 'Failed to query documents');
      }
      
      const { results } = await queryResponse.json();
      
      // Format context for the model
      const context = results.map(chunk => chunk.content).join('\n\n');
      
      // Prepare prompt with context and user query
      const prompt = `
        You are a helpful assistant answering questions based on provided documents.
        
        CONTEXT:
        ${context}
        
        USER QUESTION:
        ${userMessage.content}
        
        Please answer the question based only on the provided context. If you can't answer from the context, simply state that the information isn't available in the provided documents.
      `;
      
      // Call the model API
      const response = await openRouterService.chat.completions.create({
        model: "deepseek/deepseek-lm-67b",
        messages: [
          { role: "system", content: "You are a helpful RAG assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: response.choices[0]?.message.content || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing request:', error);
      
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Bot className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ask about your documents</h3>
            <p>Upload PDFs and ask me questions about their content.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <div className="border-t p-4 bg-background">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSubmit()} 
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              'Thinking...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex items-center">
          <CornerDownLeft className="h-3 w-3 mr-1" />
          Press Enter to send your message
        </div>
      </div>
    </div>
  );
}