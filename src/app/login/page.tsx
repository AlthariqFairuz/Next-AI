"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const formElement = formRef.current;
    if (formElement) {
      setTimeout(() => {
        formElement.classList.add("animate-fade-in");
      }, 100);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login successful!");
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-700/20 blur-3xl animate-pulse-slow"></div>
          
          {/* Grid overlay for texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxMTEiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAxIiBzdHJva2U9IiNmZmYiIGZpbGw9IiMwYzBjMGMiLz48cGF0aCBkPSJNMzAgMHYzMEgwVjB6IiBzdHJva2Utb3BhY2l0eT0iLjAxIiBzdHJva2U9IiNmZmYiIGZpbGw9IiMwYzBjMGMiLz48L2c+PC9zdmc+')] opacity-30"></div>
          
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-radial-gradient"></div>
        </div>
      
        <div 
          ref={formRef}
          className="w-full max-w-md px-4 opacity-0 translate-y-6 transition-all duration-700 ease-out"
        >
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-black rounded-full animate-pulse-slow"></div>
                <div className="absolute inset-1 bg-black rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">NEXT AI</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to access your documents
            </p>
          </div>
          
          <Card className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email and password to continue
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="bg-transparent border-gray-800 focus-visible:ring-gray-500"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none">
                      Password
                    </label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-transparent border-gray-800 focus-visible:ring-gray-500"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-black hover:from-white hover:to-gray-200 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" /> Sign in
                    </span>
                  )}
                </Button>
                
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary hover:text-white underline underline-offset-4 transition-colors">
                    Register
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Global animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
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
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-slow,
          .animate-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}