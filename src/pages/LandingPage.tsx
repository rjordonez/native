import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { FeatureCard } from '../components/FeatureCard';
import { FloatingCard } from '../components/FloatingCard';

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { Icon: Mic, text: 'Real-time feedback' },
    { Icon: MessageSquare, text: 'Natural conversations' },
    { Icon: BookOpen, text: 'Word of the day' },
    { Icon: Sparkles, text: 'Grammar analysis' },
  ];

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="h-full relative bg-gradient-to-br from-orange-50 via-white to-white">
        <Navbar onTryNowClick={() => navigate('/signup')} />

        <div className="h-full flex items-center justify-between px-16">
          <div className="w-1/2 space-y-6">
            <h1 className="text-6xl font-bold leading-tight text-gray-900">
              Speak Better.<br />
              <span className="text-orange-500">Learn Faster.</span>
            </h1>
            <p className="text-xl max-w-xl text-gray-600">
              Your AI-powered conversation partner that helps improve your speaking skills in real-time with personalized feedback.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  Icon={feature.Icon}
                  text={feature.text}
                />
              ))}
            </div>
          </div>

          <div className="w-1/2 flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-64 h-64 rounded-full blur-xl bg-orange-200/50 animate-pulse"></div>
              </div>
              
              <button className="relative z-10 bg-orange-500 p-8 rounded-full shadow-lg 
                hover:bg-orange-400 transition-all duration-500 transform hover:scale-105
                hover:rotate-3 active:scale-95">
                <Mic className="h-12 w-12 text-black" />
              </button>

              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 
                transition-transform duration-300 hover:translate-y-[-60%] hover:scale-105">
                <FloatingCard
                  title="Word of the Day"
                  content="Eloquent"
                />
              </div>

              <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2
                transition-transform duration-300 hover:translate-y-[60%] hover:scale-105">
                <FloatingCard
                  title="Speaking Score"
                  content="94%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;