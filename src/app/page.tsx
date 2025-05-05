"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Upload, MessageSquare, Sparkles  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.classList.add("animate-fade-in");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const features = Array.from(
              entry.target.querySelectorAll(".feature-card")
            );
            features.forEach((feature, index) => {
              setTimeout(() => {
                feature.classList.add("animate-fade-in");
              }, index * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentFeaturesRef = featuresRef.current;
    if (currentFeaturesRef) {
      observer.observe(currentFeaturesRef);
    }

    return () => {
      if (currentFeaturesRef) {
        observer.unobserve(currentFeaturesRef);
      }
    };
  }, []);


  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Hero section */}
        <section
          ref={heroRef}
          className="relative opacity-0 translate-y-6 transition-all duration-700 ease-out py-16 md:py-24 lg:py-32 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Chat with your
              <br /> documents using{" "}
              <div className="flex justify-center items-center mt-4">
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-reveal-animation">
                NEXT AI
              </span>
              </div>
            </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
                Upload your PDFs and get instant answers powered by various AI models. 
                No more searching through hundreds of pages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto group gap-2 cursor-pointer">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="w-full sm:w-auto group gap-2 cursor-pointer">
                        Get started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto cursor-pointer">
                        Log in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Animated background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Gradient orbs */}
            <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-700/20 blur-3xl animate-pulse-slow"></div>
            
            {/* Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxMTEiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAxIiBzdHJva2U9IiNmZmYiIGZpbGw9IiMwYzBjMGMiLz48cGF0aCBkPSJNMzAgMHYzMEgwVjB6IiBzdHJva2Utb3BhY2l0eT0iLjAxIiBzdHJva2U9IiNmZmYiIGZpbGw9IiMwYzBjMGMiLz48L2c+PC9zdmc+')] opacity-30"></div>
            
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-radial-gradient"></div>
          </div>
        </section>

        {/* Features section */}
        <section
          id="features"
          ref={featuresRef}
          className="py-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Powerful features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to build modern applications in one accessible platform</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Upload className="h-6 w-6" />,
                  title: "Easy PDF Upload",
                  description: "Simply drag and drop your PDFs. We'll handle the rest, processing and indexing every page."
                },
                {
                  icon: <Database className="h-6 w-6" />,
                  title: "Semantic Search",
                  description: "Our RAG system understands context, not just keywords. Ask questions in natural language."
                },
                {
                  icon: <MessageSquare className="h-6 w-6" />,
                  title: "AI Chat Interface",
                  description: "Chat with your documents like talking to an expert who's read everything."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card opacity-0 translate-y-8 transition-all duration-700 ease-out p-6 rounded-xl border border-gray-800 hover:border-gray-700 bg-gradient-to-b from-gray-900 to-black"
                >
                  <div className="p-2 bg-primary/10 inline-flex rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-6 text-primary motion-safe:animate-float" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                Ready to transform how you work with documents?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of professionals who are saving hours with NEXT AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto group gap-2 cursor-pointer">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto cursor-pointer">
                      Get started for free
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full"></div>
            </div>
          </div>
        </section>
      </main>

      <Footer/>

      {/* Global CSS */}
      <style jsx global>{`

        @keyframes text-reveal {
          0% {
            background-position: -200% 0;
            opacity: 0.3;
          }
          100% {
            background-position: 0% 0;
            opacity: 1;
          }
        }

        .text-reveal-animation {
          background: linear-gradient(to right, white, black);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: text-reveal 2s ease-out forwards;
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
        }
        
        /* Media queries for responsive design */
        @media (max-width: 640px) {
          .animate-pulse-slow,
          .animate-float,
          .animate-gradient-x {
            animation-duration: 4s; /* Shorter animations on mobile */
          }
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-slow,
          .animate-float,
          .animate-gradient-x {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}