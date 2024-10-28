// LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { FeatureCard } from './components/FeatureCard';
import { FloatingCard } from './components/FloatingCard';
function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { Icon: MessageSquare, text: 'Friendly, natural AI chatbot' },
    { Icon: Mic, text: 'Practice English in various scenarios' },
    { Icon: BookOpen, text: 'Ideal for IELTS speaking prep' },
    { Icon: Sparkles, text: 'Engaging, personalized learning' },
  ];

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="h-full relative bg-gradient-to-br from-orange-50 via-white to-white">
        <Navbar onTryNowClick={() => navigate('/signup')} />

        <div className="h-full flex flex-col md:flex-row items-center justify-between px-16">
          {/* Left Section */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Replaced the Volume2 icon and "Luna" text with native-logo */}
            <div className="flex items-center justify-center mb-8">
             
            </div>

            <h1 className="text-6xl font-bold leading-tight text-gray-900">
              Speak Better.<br />
              <span className="text-orange-500">Learn Faster.</span>
            </h1>
            <p className="text-xl max-w-xl text-gray-600">
              Your first AI-native friend for international students, offering conversational English practice anytime, anywhere, and helping you boost your communication confidence.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  Icon={feature.Icon}
                  text={feature.text}
                />
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 flex justify-center items-center mt-12 md:mt-0">
            <div className="relative">
              {/* Pulsing Background */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-64 h-64 rounded-full blur-xl bg-orange-200/50 animate-pulse"></div>
              </div>
              
              {/* Main Mic Button */}
              <button
                className="relative z-10 bg-orange-500 p-8 rounded-full shadow-lg 
                  hover:bg-orange-400 transition-all duration-500 transform hover:scale-105
                  hover:rotate-3 active:scale-95"
                aria-label="Start Conversation"
              >
                <Mic className="h-12 w-12 text-black" />
              </button>

              {/* Floating Cards */}
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
