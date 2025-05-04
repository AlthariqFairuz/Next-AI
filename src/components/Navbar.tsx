import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b bg-black/70">
      <div className="container flex h-14 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-white to-black rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-black rounded-full"></div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">NEXT AI</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between md:justify-end space-x-2">
          <nav className="hidden md:flex space-x-8 mr-4">
            <a href="#features" className="text-sm hover:text-gray-300 transition-colors">Features</a>
            <a href="#about" className="text-sm hover:text-gray-300 transition-colors">About</a>
            <a href="#contact" className="text-sm hover:text-gray-300 transition-colors">Contact</a>
          </nav>
          
          {/* Auth buttons */}
          <div className="hidden md:flex space-x-2">
            {user ? (
              <>
                <div className="hidden md:flex">
                  <span className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-transparent hover:border-white transition-colors">{user.email}</span>
                </div>
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-transparent border border-gray-700 hover:border-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-transparent border border-gray-700 hover:border-white transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;