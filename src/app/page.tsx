"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Database, MessageSquare, Upload, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate hero section on page load
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.classList.add("animate-fade-in");
    }

    // Animate features with staggered delay when visible
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

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header with glassmorphism effect */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">DeepSeek RAG</span>
            </div>
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign up</Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section with gradient animation */}
        <section
          ref={heroRef}
          className="relative opacity-0 translate-y-6 transition-all duration-700 ease-out py-16 md:py-24 lg:py-32 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Chat with your documents using{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sidebar-primary animate-gradient">
                  NEXT AI
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10">
                Upload your PDFs and get instant answers powered by DeepSeek AI. 
                No more searching through hundreds of pages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="w-full sm:w-auto group gap-2">
                        Get started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Log in
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto group gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Animated background gradient orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div
              className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl motion-safe:animate-pulse-slow"
            ></div>
            <div
              className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-sidebar-primary/20 blur-3xl motion-safe:animate-pulse-slow motion-safe:animation-delay-2000"
            ></div>
          </div>
        </section>

        {/* Features section with stagger animation */}
        <section
          ref={featuresRef}
          className="py-16 md:py-20 bg-muted"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Powerful features at your fingertips
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
                  className="feature-card opacity-0 translate-y-8 transition-all duration-700 ease-out p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
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
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Ready to transform how you work with documents?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
                Join thousands of professionals who are saving hours with DeepSeek RAG.
              </p>
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="w-full sm:w-auto group gap-2">
                  {user ? "Go to Dashboard" : "Get started for free"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-sidebar-primary/30 blur-3xl"></div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-semibold">DeepSeek RAG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 DeepSeek RAG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}