import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b bg-black/70">
      <div className="container flex h-14 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white to-black rounded-full animate-pulse"></div>
            <div className="absolute inset-1 bg-black rounded-full"></div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">NEXT AI</span>
        </Link>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          
        </div>
        
        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <>
              <Link href="/" className="text-sm px-4 py-2 hover:text-gray-300 transition-colors">Home</Link>
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-transparent borde hover:border-white transition-colors"
              >
                Dashboard
              </Link>
              <span className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-transparent hover:border-white transition-colors">{user.email}</span>
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
                            <Link href="/" className="text-sm px-4 py-2 hover:text-gray-300 transition-colors">Home</Link>
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
        
        {/* Mobile hamburger menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 relative focus:outline-none rounded-md hover:bg-gray-800/50 transition-colors"
          aria-label="Toggle menu"
        >
          <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span
              className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t border-gray-800' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 py-3 space-y-1 bg-black/95 backdrop-blur-lg">
          <Link href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          {/* Mobile auth buttons */}
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="px-3 py-2 text-sm text-gray-400">{user.email}</div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;