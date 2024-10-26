import React from 'react';
import { Volume2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onTryNowClick: () => void;
}

export function Navbar({ onTryNowClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 p-6 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Volume2 className="h-8 w-8 text-orange-500" />
          <span className="text-2xl font-bold text-gray-900">
            Luna
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={onTryNowClick}
            className="bg-orange-500 text-black px-6 py-2 rounded-full font-semibold 
              hover:bg-orange-400 transition-all duration-300 flex items-center gap-2 transform hover:scale-105">
            Try Now <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}