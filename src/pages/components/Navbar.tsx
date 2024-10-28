// Navbar.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import nativeLogo from '../native-logo.png'; // Adjust the path based on your project structure

interface NavbarProps {
  onTryNowClick: () => void;
}

export function Navbar({ onTryNowClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 p-6 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Replaced Volume2 icon and "Luna" text with native-logo.png */}
        <Link to="/" className="flex items-center">
          <img src={nativeLogo} alt="Native Logo" className="h-10 w-auto sm:h-12" />
        </Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onTryNowClick}
            className="bg-orange-500 text-black px-6 py-2 rounded-full font-semibold 
              hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 
              transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
            aria-label="Try Now"
          >
            Try Now <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
