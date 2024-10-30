// src/components/DashboardComponents.tsx
import React from 'react';
import {
  Mic,
  MicOff,
  History,
  LogOut,
  Star,
  FileText,
  Play,
  Timer,
  X,
  Info,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nativeLogo from '../native-logo.png'; // Adjust the path based on your project structure

// Define interfaces
export interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp: string;
  type?: 'system';
}

export interface ChatMessageType {
  id: string;
  message: string;
  isAI: boolean;
  timestamp: string;
  type?: 'system';
}

export interface Session {
  id: string; // Changed to string to match Firestore document IDs
  date: string;
  transcript: string;
  hasReport: boolean;
  userAudioURL?: string;
  aiAudioURL?: string;
  duration?: string;
  sessionName: string; // Added sessionName
  reportRequested: boolean; // Added reportRequested flag
  analytics?: {
    wordsPerMinute: number;
    commonWords: string[];
    improvementAreas: string[];
  };
}

export interface SessionsListProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  onRequestReport: (sessionId: string) => void; // Changed to string
}

export interface SessionState {
  isActive: boolean;
  timeRemaining: number;
  showInstructions: boolean;
  isMuted: boolean;
  startTime: Date | null;
}

export interface HeaderProps {
  xpRef: React.RefObject<HTMLDivElement>;
  xp: number;
  onSignOut: () => void; // Added this line
}

export interface InstructionsModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export interface SessionTimerProps {
  timeRemaining: number;
}

export interface XpAnimationProps {
  xpRef: React.RefObject<HTMLDivElement>;
  onAllAnimationsComplete: () => void;
  totalBolts: number;
  keyPressId: number;
}

export interface XpAnimationBoltProps {
  xpRef: React.RefObject<HTMLDivElement>;
  startPosition: { x: number; y: number };
  delay: number;
  onAnimationComplete: () => void;
}

export interface QuestionCarouselProps {
  questions: string[];
}

// ChatMessage Component
export function ChatMessage({ message, isAI, timestamp, type }: ChatMessageProps) {
  if (type === 'system') {
    return (
      <div className="flex justify-center mb-4">
        <div className="text-gray-500 italic text-sm">
          {message} ({timestamp})
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] ${
          isAI ? 'bg-gray-100' : 'bg-orange-500 text-white'
        } rounded-2xl px-4 py-3`}
      >
        <p className="text-sm">{message}</p>
        <span className="text-xs opacity-70 mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
}

// WordOfDay Component
export function WordOfDay() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-3 flex justify-between items-center mb-6">
      <div>
        <span className="text-sm text-gray-500">Word of the Day</span>
        <h3 className="font-semibold text-gray-900">Cherish ˈtʃer.ɪʃ</h3>
        <p className="text-sm text-gray-600">to love, protect, and care for someone or something that is important to you</p>
      </div>
      <div className="bg-white px-3 py-1 rounded-full text-sm text-orange-600 font-medium">
        +50 XP for using this word
      </div>
    </div>
  );
}

// SessionsList Component
export function SessionsList({ sessions, onSelectSession, onRequestReport }: SessionsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pb-6">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-gray-900">
                {session.sessionName}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(session.date).toLocaleString()}
              </p>
              {session.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {session.duration}
                </p>
              )}
            </div>
            {session.reportRequested ? (
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                Requested
              </span>
            ) : (
              <button
                onClick={() => onRequestReport(session.id)}
                className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs hover:bg-yellow-100 transition"
              >
                <Star size={12} className="fill-current" />
                <span>Request Report</span>
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            {/* Info Button */}
            <button
              onClick={() => onSelectSession(session)}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
              aria-label={`View Info for ${session.sessionName}`}
            >
              <Info size={16} />
              <span>Info</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Header Component
export function Header({ xpRef, xp, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4 fixed top-0 w-full z-50 flex flex-col md:flex-row items-center justify-between shadow">
      <div className="flex items-center space-x-4">
        {/* Replace text with logo image */}
        <img src={nativeLogo} alt="Native Logo" className="h-10 w-auto" />
      </div>
      <div className="flex items-center space-x-6 mt-2 md:mt-0">
        <div ref={xpRef} className="flex items-center space-x-2 text-purple-600">
          <LightningBoltIcon size={20} className="fill-current" />
          <span className="font-semibold">{Math.floor(xp)} XP</span>
        </div>
        <div className="flex items-center space-x-2 text-yellow-600">
          <Star size={20} className="fill-current" />
          <span className="font-semibold">15 Credits</span>
        </div>
        <button
          onClick={onSignOut} // Attach the onSignOut function
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition"
          aria-label="Sign Out"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}

// Instructions Modal Component
export function InstructionsModal({ onConfirm, onClose }: InstructionsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">How to Interact with Native</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close Instructions">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            1. Once you start the session, you'll have 5 minutes to interact with Luna - your AI-native 
            friend.
          </p>
          <p className="text-gray-600">
            2. Click the microphone button to mute/unmute your voice.
          </p>
          <p className="text-gray-600">
            3. Speak clearly and naturally—the AI will respond to your questions and prompts.
          </p>
          <p className="text-gray-600">
            4. You can end the session at any time using the "End Session" button.
          </p>
          <p className="text-gray-600">
            5. You can hear back conversation by clicking “Previous Sessions”.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            aria-label="Cancel Instructions"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            aria-label="Confirm Start Session"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

// Session Timer Component
export function SessionTimer({ timeRemaining }: SessionTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg shadow z-10">
      <Timer size={16} />
      <span className="font-mono text-sm">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// Custom Lightning Bolt Icon (Filled, Purple)
export function LightningBoltIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path d="M13 2L3 14h7v8l11-12h-7l-1-8z" />
    </svg>
  );
}

// XP Animation Components
export function XpAnimations({
  xpRef,
  onAllAnimationsComplete,
  totalBolts,
  keyPressId,
}: XpAnimationProps) {
  const [bolts, setBolts] = React.useState<number[]>([]);
  const boltsCompleted = React.useRef(0);

  React.useEffect(() => {
    // Generate bolt IDs
    const newBolts = Array.from({ length: totalBolts }, (_, i) => keyPressId + i);
    setBolts(newBolts);
  }, [keyPressId, totalBolts]);

  const handleBoltComplete = () => {
    boltsCompleted.current += 1;
    if (boltsCompleted.current >= totalBolts) {
      onAllAnimationsComplete();
      boltsCompleted.current = 0;
    }
  };

  return (
    <AnimatePresence>
      {bolts.map((id, index) => {
        const isLeft = index % 2 === 0;
        const yPosition = (window.innerHeight / totalBolts) * index;
        const xPosition = isLeft ? -50 : window.innerWidth + 50;
        const startPosition = { x: xPosition, y: yPosition };

        // Random delay between 0 and 2 seconds
        const delay = Math.random() * 2;

        return (
          <XpAnimationBolt
            key={id}
            xpRef={xpRef}
            startPosition={startPosition}
            delay={delay}
            onAnimationComplete={handleBoltComplete}
          />
        );
      })}
    </AnimatePresence>
  );
}

export function XpAnimationBolt({
  xpRef,
  startPosition,
  delay,
  onAnimationComplete,
}: XpAnimationBoltProps) {
  const [targetPosition, setTargetPosition] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  React.useEffect(() => {
    if (xpRef.current) {
      const rect = xpRef.current.getBoundingClientRect();
      setTargetPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [xpRef]);

  return (
    <motion.div
      initial={{ x: startPosition.x, y: startPosition.y, opacity: 1 }}
      animate={{ x: targetPosition.x, y: targetPosition.y, opacity: 0 }}
      transition={{ duration: 2, delay, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-50 pointer-events-none"
      onAnimationComplete={onAnimationComplete}
    >
      <LightningBoltIcon size={30} className="text-purple-500" />
    </motion.div>
  );
}

// QuestionCarousel Component
export function QuestionCarousel({ questions }: QuestionCarouselProps) {
  // Duplicate the questions array to create a seamless loop
  const duplicatedQuestions = [...questions, ...questions];

  return (
    <div className="relative overflow-hidden h-24 mt-4">
      <motion.div
        className="flex"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 20, // Adjust speed here
          ease: 'linear',
        }}
      >
        {duplicatedQuestions.map((question, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="bg-orange-100 text-orange-800 px-6 py-3 rounded-xl shadow-md mx-2">
              {question}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
