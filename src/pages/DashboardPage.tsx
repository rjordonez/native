// DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import the logo image
import nativeLogo from './native-logo.png'; // Adjust the path based on your project structure

// Define interfaces
interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp: string;
  type?: 'system';
}

interface ChatMessageType {
  id: string;
  message: string;
  isAI: boolean;
  timestamp: string;
  type?: 'system';
}

interface Session {
  id: number;
  date: string;
  transcript: string;
  hasReport: boolean;
  analytics?: {
    wordsPerMinute: number;
    commonWords: string[];
    improvementAreas: string[];
  };
}

interface SessionsListProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

// New interface for session state
interface SessionState {
  isActive: boolean;
  timeRemaining: number;
  showInstructions: boolean;
  isMuted: boolean;
  startTime: Date | null;
}

// ChatMessage Component
function ChatMessage({ message, isAI, timestamp, type }: ChatMessageProps) {
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
function WordOfDay() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-3 flex justify-between items-center mb-6">
      <div>
        <span className="text-sm text-gray-500">Word of the Day</span>
        <h3 className="font-semibold text-gray-900">Ephemeral</h3>
        <p className="text-sm text-gray-600">lasting for a very short time</p>
      </div>
      <div className="bg-white px-3 py-1 rounded-full text-sm text-orange-600 font-medium">
        +50 XP for using this word
      </div>
    </div>
  );
}

// SessionsList Component
function SessionsList({ sessions, onSelectSession }: SessionsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pb-6">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-gray-900">Session #{session.id}</h3>
              <p className="text-sm text-gray-500">{session.date}</p>
            </div>
            {session.hasReport ? (
              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
                Report Available
              </span>
            ) : (
              <button className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs hover:bg-yellow-100 transition">
                <Star size={12} className="fill-current" />
                <span>Use 5 Credits</span>
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSelectSession(session)}
              className="flex-1 flex items-center justify-center space-x-2 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition"
              aria-label={`Play Session ${session.id}`}
            >
              <Play size={16} />
              <span>Play</span>
            </button>
            {!session.hasReport && (
              <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FileText size={16} />
                <span>Request Report</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Header Component
function Header({
  xpRef,
  xp,
}: {
  xpRef: React.RefObject<HTMLDivElement>;
  xp: number;
}) {
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
function InstructionsModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">How to Interact with VoiceAI</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close Instructions">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            1. Once you start the session, you'll have 5 minutes to interact with the AI voice agent.
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
function SessionTimer({ timeRemaining }: { timeRemaining: number }) {
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
function LightningBoltIcon({ size, className }: { size: number; className?: string }) {
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

// XP Animation Component
interface XpAnimationProps {
  xpRef: React.RefObject<HTMLDivElement>;
  onAllAnimationsComplete: () => void;
  totalBolts: number;
  keyPressId: number;
}

function XpAnimations({
  xpRef,
  onAllAnimationsComplete,
  totalBolts,
  keyPressId,
}: XpAnimationProps) {
  const [bolts, setBolts] = useState<number[]>([]);
  const boltsCompleted = useRef(0);

  useEffect(() => {
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

interface XpAnimationBoltProps {
  xpRef: React.RefObject<HTMLDivElement>;
  startPosition: { x: number; y: number };
  delay: number;
  onAnimationComplete: () => void;
}

function XpAnimationBolt({
  xpRef,
  startPosition,
  delay,
  onAnimationComplete,
}: XpAnimationBoltProps) {
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
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

// AI Voice Agent Integration Constants
const AGENT_ID = 'Sofia-5z9C9lXSbExVo-wIVEI7Q'; // Replace with your Agent ID
const API_KEY = 'ak-a8c546a168d84b63b4cd345a8c200026'; // Replace with your API Key

// Main Dashboard Component
function DashboardPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [showingSessions, setShowingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    timeRemaining: 300, // 5 minutes in seconds
    showInstructions: false,
    isMuted: false,
    startTime: null,
  });
  const [xp, setXp] = useState(2450);
  const xpRef = useRef<HTMLDivElement>(null);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  // **New State for Sessions**
  const [sessions, setSessions] = useState<Session[]>([]); // Initialize with empty array or fetch from API

  // Refs for WebSocket, MediaRecorder, AudioContext, and GainNode
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const isSourceBufferUpdatingRef = useRef<boolean>(false);
  const lastUhTimestamp = useRef<number>(0); // For debouncing 'uh' detections
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null); // Corrected line

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState.isActive && sessionState.timeRemaining > 0) {
      timer = setInterval(() => {
        setSessionState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          isActive: prev.timeRemaining - 1 > 0,
        }));
      }, 1000);
    } else if (sessionState.isActive && sessionState.timeRemaining === 0) {
      // Session ended
      endSession();
    }
    return () => clearInterval(timer);
  }, [sessionState.isActive, sessionState.timeRemaining]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Keydown event listener for 'w' key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'w') {
        // Handle XP increment
        handleXpIncrement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      endSession(); // Clean up on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleXpIncrement = () => {
    // Add a new key press event
    setKeyPresses((prev) => [...prev, Date.now()]);
  };

  const incrementXpBy = (amount: number) => {
    const incrementSteps = 100; // Increment in 100 steps
    const incrementAmount = amount / incrementSteps;
    const incrementInterval = 50; // 50ms * 100 = 5 seconds total

    let currentStep = 0;
    const interval = setInterval(() => {
      setXp((prevXp) => prevXp + incrementAmount);
      currentStep += 1;
      if (currentStep >= incrementSteps) {
        clearInterval(interval);
        setXp((prevXp) => Math.round(prevXp)); // Ensure XP is an integer
      }
    }, incrementInterval);
  };

  const handleStartSession = () => {
    setSessionState((prev) => ({ ...prev, showInstructions: true }));
  };

  const handleConfirmStart = () => {
    setSessionState({
      isActive: true,
      timeRemaining: 300,
      showInstructions: false,
      isMuted: false,
      startTime: new Date(),
    });
    initializeMediaSource();
    initializeWebSocket();
    startRecording();
  };

  const handleEndSession = () => {
    const endTime = new Date();
    const { startTime, timeRemaining } = sessionState;
    let duration = 300 - timeRemaining; // duration in seconds

    // Compute duration based on startTime and endTime
    if (startTime) {
      const diffMs = endTime.getTime() - startTime.getTime();
      duration = Math.floor(diffMs / 1000); // duration in seconds
    }

    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;
    const durationStr = `${String(durationMinutes).padStart(2, '0')}:${String(durationSeconds).padStart(2, '0')}`;

    const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add system message to messages **only if a session was active**
    if (startTime) {
      const endedMessage = `Ended session at ${endTimeStr} for ${durationStr}`;
      const timestamp = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: endedMessage,
          isAI: false,
          timestamp,
          type: 'system',
        },
      ]);
    }

    // Then, set sessionState to inactive and reset
    setSessionState({
      isActive: false,
      timeRemaining: 300,
      showInstructions: false,
      isMuted: false,
      startTime: null,
    });

    stopRecording();
    closeWebSocket();
    setSocketError(null);

    // Reset MediaSource and SourceBuffer
    if (mediaSourceRef.current) {
      if (mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
      mediaSourceRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }

    audioChunksRef.current = [];
  };

  const initializeWebSocket = () => {
    if (wsRef.current) return; // Prevent multiple connections

    const ws = new WebSocket(`wss://api.play.ai/v1/talk/${AGENT_ID}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(
        JSON.stringify({
          type: 'setup',
          apiKey: API_KEY,
          outputFormat: 'mp3',
          outputSampleRate: 16000,
          inputEncoding: 'media-container',
          inputSampleRate: 16000,
        })
      );
    };

    ws.onmessage = (messageEvent) => {
      try {
        const event = JSON.parse(messageEvent.data);

        // Handle different event types
        if (event.type === 'onUserTranscript') {
          // User's transcript from AI agent
          console.log('User transcript:', event.message);
          addMessage(event.message, false); // Add as user message
        } else if (event.type === 'onAgentTranscript') {
          // Agent's transcript
          console.log('Agent transcript:', event.message);
          addMessage(event.message, true); // Add as AI message

          // Catch 'Uh,' in the chatbot with debouncing
          if (event.message.trim().toLowerCase() === 'uh,') {
            const now = Date.now();
            if (now - lastUhTimestamp.current > 5000) { // 5 seconds cooldown
              handleUhCase();
              lastUhTimestamp.current = now;
            }
          }
        }

        if (event.type === 'audioStream') {
          handleAudioStream(event.data);
        } else if (event.type === 'newAudioStream') {
          console.log('New audio stream started');
          // Handled by voiceActivityStart event
        } else if (event.type === 'voiceActivityStart') {
          console.log('User started speaking');
          handleVoiceActivityStart();
        } else if (event.type === 'voiceActivityEnd') {
          console.log('User stopped speaking');
          handleVoiceActivityEnd();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setSocketError('WebSocket connection error');
    };
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleAudioStream = (base64Data: string) => {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    audioChunksRef.current.push(new Uint8Array(arrayBuffer));

    if (sourceBufferRef.current && !isSourceBufferUpdatingRef.current) {
      appendNextBuffer();
    }
  };

  const appendNextBuffer = () => {
    if (audioChunksRef.current.length === 0 || !sourceBufferRef.current) {
      return;
    }

    const chunk = audioChunksRef.current.shift();
    if (chunk) {
      try {
        isSourceBufferUpdatingRef.current = true;
        sourceBufferRef.current.appendBuffer(chunk);
      } catch (error) {
        console.error('Error appending buffer:', error);
      }
    }
  };

  const handleUhCase = () => {
    // Add a special message prompting the user
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        message: "I notice you're using 'uh' quite a bit. Would you like some tips to reduce filler words?",
        isAI: true,
        timestamp,
      },
    ]);
  };

  const addMessage = (message: string, isAI: boolean) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optional: Log all transcripts for debugging
    console.log(`${isAI ? 'AI' : 'User'} (${timestamp}): ${message}`);
    
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        message,
        isAI,
        timestamp,
      },
    ]);
  };

  const initializeMediaSource = () => {
    if (audioElementRef.current && !mediaSourceRef.current) {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      audioElementRef.current.src = URL.createObjectURL(mediaSource);
      audioElementRef.current.autoplay = true; // Enable autoplay

      mediaSource.addEventListener('sourceopen', () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
          sourceBufferRef.current = sourceBuffer;

          sourceBuffer.addEventListener('updateend', () => {
            isSourceBufferUpdatingRef.current = false;
            appendNextBuffer();
          });

          sourceBuffer.addEventListener('error', (e) => {
            console.error('SourceBuffer error:', e);
          });
        } catch (e) {
          console.error('Exception while adding source buffer:', e);
        }
      });

      mediaSource.addEventListener('sourceended', () => {
        console.log('MediaSource ended');
      });

      mediaSource.addEventListener('sourceclose', () => {
        console.log('MediaSource closed');
      });

      audioElementRef.current.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
      });

      // Start playback once a minimal buffer is appended
      audioElementRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const startRecording = async () => {
    if (sessionState.isActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });

      // Set up Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode; // Corrected line

      source.connect(gainNode);

      // Create a new MediaStream from the GainNode
      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);

      const processedStream = destination.stream;

      // Set up MediaRecorder with the processed stream
      const mediaRecorder = new MediaRecorder(processedStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = async (event) => {
        const base64Data = await blobToBase64(event.data);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: 'audioIn', data: base64Data })
          );
        }
      };

      mediaRecorder.start(250); // Collect 250ms chunks of audio
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setSocketError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');

      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      gainNodeRef.current = null;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          resolve('');
        }
      };
    });
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  };

  const endSession = () => {
    const endTime = new Date();
    const { startTime, timeRemaining } = sessionState;
    let duration = 300 - timeRemaining; // duration in seconds

    // Compute duration based on startTime and endTime
    if (startTime) {
      const diffMs = endTime.getTime() - startTime.getTime();
      duration = Math.floor(diffMs / 1000); // duration in seconds
    }

    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;
    const durationStr = `${String(durationMinutes).padStart(2, '0')}:${String(durationSeconds).padStart(2, '0')}`;

    const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add system message to messages **only if a session was active**
    if (startTime) {
      const endedMessage = `Ended session at ${endTimeStr} for ${durationStr}`;
      const timestamp = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: endedMessage,
          isAI: false,
          timestamp,
          type: 'system',
        },
      ]);
    }

    // Then, set sessionState to inactive and reset
    setSessionState({
      isActive: false,
      timeRemaining: 300,
      showInstructions: false,
      isMuted: false,
      startTime: null,
    });

    stopRecording();
    closeWebSocket();
    setSocketError(null);

    // Reset MediaSource and SourceBuffer
    if (mediaSourceRef.current) {
      if (mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
      mediaSourceRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }

    audioChunksRef.current = [];
  };

  // **Fetch sessions data (you can replace this with actual API calls)**
  useEffect(() => {
    const fetchSessions = async () => {
      // Replace this with your actual data fetching logic
      const dummySessions: Session[] = [
        {
          id: 1,
          date: '2024-04-20',
          transcript: 'Transcript of session 1',
          hasReport: true,
          analytics: {
            wordsPerMinute: 120,
            commonWords: ['um', 'uh', 'like'],
            improvementAreas: ['Clarity', 'Conciseness'],
          },
        },
        {
          id: 2,
          date: '2024-04-18',
          transcript: 'Transcript of session 2',
          hasReport: false,
        },
        // Add more sessions as needed
      ];
      setSessions(dummySessions);
    };

    fetchSessions();
  }, []);

  // Handle selecting a session
  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    setShowingSessions(false);
    // Implement any additional logic, such as displaying session details
    // For example, you could set session details to state or navigate to a different view
  };

  // Handle closing the sessions list
  const handleCloseSessions = () => {
    setShowingSessions(false);
  };

  // Handle Voice Activity Start: Reset MediaSource to discard buffered audio
  const handleVoiceActivityStart = () => {
    // Pause the audio playback
    if (audioElementRef.current && !audioElementRef.current.paused) {
      audioElementRef.current.pause();
    }

    // Reset MediaSource and SourceBuffer to discard buffered audio
    if (mediaSourceRef.current) {
      try {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
      } catch (error) {
        console.error('Error ending MediaSource stream:', error);
      }
      mediaSourceRef.current = null;
      sourceBufferRef.current = null;
    }

    // Create a new MediaSource and assign to audio element
    if (audioElementRef.current) {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      audioElementRef.current.src = URL.createObjectURL(mediaSource);
      audioElementRef.current.autoplay = true;

      mediaSource.addEventListener('sourceopen', () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
          sourceBufferRef.current = sourceBuffer;

          sourceBuffer.addEventListener('updateend', () => {
            isSourceBufferUpdatingRef.current = false;
            appendNextBuffer();
          });

          sourceBuffer.addEventListener('error', (e) => {
            console.error('SourceBuffer error:', e);
          });
        } catch (e) {
          console.error('Exception while adding source buffer:', e);
        }
      });

      mediaSource.addEventListener('sourceended', () => {
        console.log('MediaSource ended');
      });

      mediaSource.addEventListener('sourceclose', () => {
        console.log('MediaSource closed');
      });

      audioElementRef.current.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
      });

      // Start playback once a minimal buffer is appended
      audioElementRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }

    // Clear any existing audio chunks
    audioChunksRef.current = [];
  };

  // Handle Voice Activity End: Resume playback if not muted
  const handleVoiceActivityEnd = () => {
    if (audioElementRef.current && !sessionState.isMuted) {
      if (audioElementRef.current.paused) {
        audioElementRef.current.play().catch((error) => console.error('Error resuming audio:', error));
      }
    }
  };

  // XP Animation Handling
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header
        xpRef={xpRef}
        xp={xp}
      />

      {/* XP Animations */}
      {keyPresses.map((keyPressId) => (
        <XpAnimations
          key={keyPressId}
          xpRef={xpRef}
          keyPressId={keyPressId}
          totalBolts={100}
          onAllAnimationsComplete={() => {
            // Start XP increment slowly
            incrementXpBy(50);
          }}
        />
      ))}

      {/* Main Content */}
      <main className="pt-24 pb-24 px-4">
        <WordOfDay />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[calc(100vh-400px)] mb-20 overflow-y-auto scrollbar-hide relative">
          {/* Session Timer positioned in top-right corner and sticky */}
          {sessionState.isActive && (
            <div className="sticky top-4 flex justify-end">
              <SessionTimer timeRemaining={sessionState.timeRemaining} />
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              isAI={msg.isAI}
              timestamp={msg.timestamp}
              type={msg.type}
            />
          ))}
        </div>
      </main>

      {/* Instructions Modal */}
      {sessionState.showInstructions && (
        <InstructionsModal
          onConfirm={handleConfirmStart}
          onClose={() =>
            setSessionState((prev) => ({ ...prev, showInstructions: false }))
          }
        />
      )}

      {/* Audio Element for AI Responses */}
      <audio ref={audioElementRef} />

      {/* **Conditional Rendering for Sessions List** */}
      {showingSessions && (
        <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Previous Sessions</h2>
            <button
              onClick={handleCloseSessions}
              className="text-gray-600 hover:text-gray-800"
              aria-label="Close Sessions List"
            >
              <X size={24} />
            </button>
          </div>
          <SessionsList sessions={sessions} onSelectSession={handleSelectSession} />
        </div>
      )}

      {/* **Bottom Bar** */}
      {!showingSessions && !selectedSession && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center relative">
            {/* Left Section: Previous Sessions Button */}
            <div className="absolute left-4">
              <button
                onClick={() => setShowingSessions(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition"
                aria-label="View Previous Sessions"
              >
                <History size={24} />
                <span>Previous Sessions</span>
              </button>
            </div>

            {/* Center Section: Start Session or Mute/Unmute Button */}
            <div>
              {!sessionState.isActive ? (
                <button
                  onClick={handleStartSession}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
                  aria-label="Start Session"
                >
                  <Play size={24} />
                  <span>Start Session</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Toggle mute/unmute
                    setSessionState((prev) => {
                      const newMuteState = !prev.isMuted;
                      // Adjust the gain accordingly
                      if (gainNodeRef.current) {
                        gainNodeRef.current.gain.setValueAtTime(
                          newMuteState ? 0 : 1,
                          audioContextRef.current?.currentTime || 0
                        );
                      }
                      return { ...prev, isMuted: newMuteState };
                    });
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    sessionState.isMuted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                  aria-label={sessionState.isMuted ? 'Unmute' : 'Mute'}
                >
                  {sessionState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  <span>{sessionState.isMuted ? 'Mute' : 'Unmute'}</span>
                </button>
              )}
            </div>

            {/* Right Section: End Session Button */}
            {sessionState.isActive && (
              <div className="absolute right-4">
                <button
                  onClick={handleEndSession}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg transition"
                  aria-label="End Session"
                >
                  <X size={24} />
                  <span>End Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display Socket Error */}
      {socketError && (
        <div className="fixed top-16 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center">
          <span>{socketError}</span>
          <button
            onClick={() => setSocketError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
            aria-label="Dismiss Error"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
