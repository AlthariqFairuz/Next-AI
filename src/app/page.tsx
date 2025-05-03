"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bot, Database, FileText, LogOut, User } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in, but don't redirect if not
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Animation classes for different elements
  const fadeIn = "animate-[fadeIn_1s_ease-in-out]";
  const slideUp = "animate-[slideUp_0.8s_ease-in-out]";
  const slideInLeft = "animate-[slideInLeft_0.8s_ease-in-out]";
  const slideInRight = "animate-[slideInRight_0.8s_ease-in-out]";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload(); // Refresh to update UI state
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradientBackground 15s ease infinite;
        }
        @keyframes gradientBackground {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.03);
        }
      `}</style>

      {/* Header */}
      <header className={`border-b border-gray-700/50 py-4 ${fadeIn}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">DeepSeek RAG</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-gray-300">
                  {user.email}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-700 bg-red-600 text-white hover:bg-gray-800 hover:text-white group transition-all duration-300"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300"
                onClick={() => router.push('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className={`text-center mb-16 ${slideUp} delay-100`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 animate-gradient shadow-lg shadow-indigo-500/30">
              <Bot className="h-10 w-10 text-white animate-[fadeIn_1.5s_ease-in-out]" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6 animate-[fadeIn_2s_ease-in-out]">Welcome to DeepSeek RAG</h2>
            <p className="text-xl text-gray-300 mb-8 animate-[fadeIn_2.5s_ease-in-out]">
              Your intelligent document assistant powered by DeepSeek and vector embeddings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fadeIn_3s_ease-in-out]">
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-lg transition-all duration-300 group"
                onClick={() => router.push(user ? '/test' : '/auth')}
              >
                {user ? 'Go to RAG Testing' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-700 text-black hover:bg-gray-800 hover:text-white transition-all duration-300 group"
                onClick={() => router.push(user ? '/chat' : '/auth')}
              >
                {user ? 'Open Chat' : 'Learn More'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 shadow-xl ${slideInLeft} delay-300 hover-scale`}>
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:bg-indigo-600/40">
                <FileText className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Document Processing</h3>
              <p className="text-gray-300">
                Upload and process PDF documents with advanced chunking and embedding techniques
              </p>
            </div>

            <div className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 shadow-xl ${slideUp} delay-500 hover-scale`}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:bg-purple-600/40">
                <Database className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Vector Search</h3>
              <p className="text-gray-300">
                Leverage pgvector for efficient semantic search across your document collection
              </p>
            </div>

            <div className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 shadow-xl ${slideInRight} delay-700 hover-scale`}>
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:bg-indigo-600/40">
                <Bot className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Chat</h3>
              <p className="text-gray-300">
                Interact with your documents through DeepSeek&apos;s powerful language models
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className={`bg-gradient-to-r from-indigo-800/30 to-purple-800/30 backdrop-blur-xl border border-indigo-600/20 rounded-xl p-8 shadow-xl text-center animate-gradient ${fadeIn} delay-1000`}>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to explore your documents?</h3>
            <p className="text-lg text-gray-300 mb-6">
              Start by uploading your PDFs and ask questions to extract valuable insights
            </p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 h-auto text-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 group"
              onClick={() => router.push(user ? '/test' : '/auth')}
            >
              {user ? 'Get Started' : 'Sign Up Now'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t border-gray-700/50 py-8 mt-12 ${fadeIn}`}>
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 DeepSeek RAG. All rights reserved.</p>
          <div className="mt-4 space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}