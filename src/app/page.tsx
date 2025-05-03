"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">DeepSeek RAG</h1>
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Register</Button>
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
        <div className="relative isolate">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Chat with your documents using AI
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Upload your PDFs and get instant answers to your questions using our RAG (Retrieval Augmented Generation) system powered by DeepSeek AI.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {!user ? (
                  <>
                    <Link href="/register">
                      <Button size="lg">Get started</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg">Login</Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2025 DeepSeek RAG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}