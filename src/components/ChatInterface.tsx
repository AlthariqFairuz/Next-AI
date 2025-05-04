"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Bot, User, RotateCcw, Sparkles } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { Message } from "@/types/MessageProps";
import ConfirmDialog from './ConfirmDialog';

const MODEL_OPTIONS = [
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek-R1", description: "Ultimate Model for Complex Tasks" },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4", description: "Open source, highly capable" },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small", description: "Perfect for Everyday Tasks" }
];

export default function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[1].id);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    toast.success(`Model changed to ${MODEL_OPTIONS.find(m => m.id === modelId)?.name}`);
  }
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
      scrollToBottom('smooth');
    }
  }, [messages]);
  
  // Scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  };
  
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
  
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim() || !userId) return;
    
    const userMessage = input.trim();
    setInput('');
    

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    

    const newUserMessage: Message = { 
      role: 'user', 
      message: userMessage
    };
    

    setMessages(prev => [...prev, newUserMessage]);
    

    await saveChatMessage(newUserMessage);
    
    setIsLoading(true);
    
    try {

      const tempLoadingMessage: Message = {
        role: 'assistant',
        message: '',
        isTyping: true
      };
      
      setMessages(prev => [...prev, tempLoadingMessage]);
      scrollToBottom('smooth');
      
      // Call API for chat response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId,
          modelId: selectedModel,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // create ai response
      const newAIMessage: Message = { 
        role: 'assistant', 
        message: data.response,
        sources: data.sources || []
      };
      
      // replace the loading message with the real response
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isTyping ? newAIMessage : msg
      ));
      
      // save AI response to db
      await saveChatMessage(newAIMessage);
      
    } catch (error: unknown) {
      console.error('Error:', error);
      toast.error("Couldn't get a response. Please try again.");
      
      // Remove loading message if there was an error
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
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

    // Open the confirmation dialog
    function handleClearHistoryClick() {
      setConfirmDialogOpen(true);
    }
    
    // Execute the actual history clearing operation
    async function doClearChatHistory() {
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
        setConfirmDialogOpen(false);
      }
    }
  
  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800 rounded-lg shadow-xl text-foreground h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col animate-fade-in transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="px-4 py-3 border-b border-gray-800 flex flex-row items-center space-y-0 justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Chat with Your Documents
        </CardTitle>
        {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistoryClick}
              disabled={isLoading || isLoadingHistory}
              className="h-8 gap-1 text-xs hover:bg-gray-800/50 transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Clear History
            </Button>
          )}
      </CardHeader>

      {/* Model selection */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800 p-3">
        <div className="flex items-center mb-2">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Select AI Model:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MODEL_OPTIONS.map((model) => (
            <div
              key={model.id}
              className={`p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                selectedModel === model.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="font-medium text-xs">{model.name}</div>
              <div className="text-xs text-muted-foreground mt-1 text-[10px]">{model.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black mb-4 p-3 shadow-inner border border-gray-700 animate-pulse-slow">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-medium opacity-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>Ask about your documents</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
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
                className={`flex max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 shadow-xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-black'
                    : 'bg-gradient-to-b from-gray-900 to-black text-foreground backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all'
                }`}
              >
                <div className={`mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'user' 
                    ? 'bg-black/10' 
                    : 'bg-gradient-to-br from-gray-800 to-black border border-gray-700'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1">
                  {msg.isTyping ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <div className="prose-sm whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  )}
                  
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
      
      <CardFooter className="border-t border-gray-800 p-4 bg-black/40 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading || isLoadingHistory}
            className="flex-1 bg-gray-900/80 border-gray-800 focus-visible:border-gray-600 focus-visible:ring-gray-700 placeholder:text-gray-500 transition-all"
          />
          <Button
            type="submit"
            disabled={isLoading || isLoadingHistory || !input.trim() || !userId}
            size="icon"
            className="shrink-0 bg-gradient-to-r from-gray-200 to-gray-300 text-black hover:from-white hover:to-gray-200 transition-all group"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onConfirm={doClearChatHistory}
        onCancel={() => setConfirmDialogOpen(false)}
        title="Clear Chat History"
        message="Are you sure you want to clear your chat history? This action cannot be undone."
      />
      
      {/* Animation styles */}
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
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        /* Typing indicator animation */
        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 4px 0;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          float: left;
          margin: 0 1px;
          background-color: #9e9e9e;
          display: block;
          border-radius: 50%;
          opacity: 0.4;
        }
        
        .typing-indicator span:nth-of-type(1) {
          animation: 1s blink infinite 0.3333s;
        }
        
        .typing-indicator span:nth-of-type(2) {
          animation: 1s blink infinite 0.6666s;
        }
        
        .typing-indicator span:nth-of-type(3) {
          animation: 1s blink infinite 0.9999s;
        }
        
        @keyframes blink {
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
}