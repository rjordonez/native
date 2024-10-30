// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  WordOfDay,
  SessionsList,
  Header,
  InstructionsModal,
  SessionTimer,
  XpAnimations,
  QuestionCarousel, // Import the new component
} from './components/DashboardComponents'; // Adjust the import path as needed
import { Mic, MicOff, Play, X, History, ExternalLink } from 'lucide-react'; // Import ExternalLink icon
import { useAiAgent } from './aiAgent'; // Adjust the import path as needed
import { auth, storage, db } from '../firebase'; // Adjust the import path as needed
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// Define interfaces if not already defined elsewhere
interface Session {
  id: string; // Changed to string to match Firestore document IDs
  date: string;
  transcript: string;
  hasReport: boolean;
  userAudioURL?: string;
  aiAudioURL?: string;
  duration?: string;
  sessionName: string;
  reportRequested: boolean;
  analytics?: {
    wordsPerMinute: number;
    commonWords: string[];
    improvementAreas: string[];
  };
}

interface ChatMessageType {
  id: string;
  message: string;
  isAI: boolean;
  timestamp: string;
  type?: 'system';
}

interface SessionState {
  isActive: boolean;
  timeRemaining: number;
  showInstructions: boolean;
  isMuted: boolean;
  startTime: Date | null;
}

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
  const [xp, setXp] = useState(0);
  const xpRef = useRef<HTMLDivElement>(null);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  // **State for Sessions**
  const [sessions, setSessions] = useState<Session[]>([]);

  // **State for Authentication**
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null indicates loading

  const navigate = useNavigate(); // Initialize navigate function

  // Utilize the custom AI agent hook
  const {
    initializeWebSocket,
    closeWebSocket,
    initializeMediaSource,
    startRecording,
    stopRecording,
    handleVoiceActivityStart,
    handleVoiceActivityEnd,
    resetMediaSource,
    getUserAudioBlob,
    getAiAudioBlob,
    audioElementRef,
    gainNodeRef,
  } = useAiAgent({
    addMessage: (message: string, isAI: boolean) => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

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
    },
    onSocketError: (error) => setSocketError(error),
  });

  // **Check Authentication Status**
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setIsAuthenticated(true);
        fetchSessions(user.uid);
      } else {
        // User is not signed in
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to sign-in page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState.isActive && sessionState.timeRemaining > 0) {
      timer = setInterval(() => {
        setSessionState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState.isActive, sessionState.timeRemaining]);

  useEffect(() => {
    if (sessionState.isActive && sessionState.timeRemaining === 0) {
      handleEndSession();
      setSessionState((prev) => ({
        ...prev,
        isActive: false,
      }));
    }
  }, [sessionState.timeRemaining, sessionState.isActive]);

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

  // **Ref for Session State**
  const sessionStateRef = useRef(sessionState);

  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionStateRef.current.isActive && sessionStateRef.current.startTime) {
        handleEndSession(); // Clean up on unmount
      }
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
      startTime: new Date(), // Ensure startTime is set
    });
    initializeMediaSource(); // Initialize MediaSource before starting
    initializeWebSocket();
    startRecording();
  };

  const handleEndSession = async () => {
    if (!sessionStateRef.current.isActive || !sessionStateRef.current.startTime) {
      console.log('No active session to end.');
      return;
    }

    const endTime = new Date();
    const { startTime, timeRemaining } = sessionStateRef.current;
    let duration = 300 - timeRemaining; // duration in seconds

    // Compute duration based on startTime and endTime
    const diffMs = endTime.getTime() - startTime.getTime();
    duration = Math.floor(diffMs / 1000); // duration in seconds

    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;
    const durationStr = `${String(durationMinutes).padStart(2, '0')}:${String(
      durationSeconds
    ).padStart(2, '0')}`;

    const endTimeStr = endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Add system message to messages
    const endedMessage = `Ended session at ${endTimeStr} for ${durationStr}`;
    const timestamp = endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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

    // Reset MediaSource via the aiAgent hook
    resetMediaSource();

    // **Collect and Save Session Data**
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (userId) {
      // Get transcript (user and AI messages)
      const allMessages = messages.filter((msg) => msg.type !== 'system');
      const transcript = allMessages
        .map((msg) => `${msg.isAI ? 'AI' : 'User'}: ${msg.message}`)
        .join('\n');

      // Get date and time
      const date = new Date().toISOString();

      // Get audio Blobs
      const userAudioBlob = getUserAudioBlob();
      const aiAudioBlob = getAiAudioBlob();

      // Combine user and AI audio into one Blob
      const combinedAudioBlob = new Blob([userAudioBlob, aiAudioBlob], {
        type: 'audio/webm',
      });

      // Generate unique filenames
      const timestamp = Date.now();
      const combinedAudioFileName = `${timestamp}_combined.webm`;

      // Create storage references
      const combinedAudioFileRef = storageRef(
        storage,
        `combined_audios/${userId}/${combinedAudioFileName}`
      );

      try {
        // Upload combined audio to Firebase Storage
        await uploadBytes(combinedAudioFileRef, combinedAudioBlob);
        const combinedAudioURL = await getDownloadURL(combinedAudioFileRef);

        // Generate session name
        const sessionNumber = sessions.length + 1;
        const sessionName = `Session ${sessionNumber}`;

        // Save session data to Firestore under the user's collection
        const userSessionsRef = collection(db, 'users', userId, 'sessions');
        const docRef = await addDoc(userSessionsRef, {
          transcript: transcript,
          date: date,
          duration: durationStr,
          combinedAudioURL: combinedAudioURL,
          sessionName: sessionName,
          reportRequested: false,
        });

        // Update sessions state
        setSessions((prevSessions) => [
          {
            id: docRef.id, // Use Firestore document ID
            date: date,
            transcript: transcript,
            hasReport: false,
            duration: durationStr,
            sessionName: sessionName,
            reportRequested: false,
            userAudioURL: combinedAudioURL,
          },
          ...prevSessions,
        ]);
      } catch (error) {
        console.error('Error saving session data:', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  // **Fetch sessions data from Firestore when auth state changes**
  useEffect(() => {
    if (isAuthenticated) {
      const user = auth.currentUser;
      if (user) {
        fetchSessions(user.uid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchSessions = async (userId: string) => {
    const userSessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(userSessionsRef, orderBy('date', 'desc'));

    try {
      const querySnapshot = await getDocs(q);
      const sessionsData: Session[] = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use Firestore's unique document ID
        date: doc.data().date,
        transcript: doc.data().transcript,
        hasReport: false,
        duration: doc.data().duration,
        sessionName: doc.data().sessionName || `Session`,
        reportRequested: doc.data().reportRequested || false,
        userAudioURL: doc.data().combinedAudioURL,
      }));

      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Handle selecting a session
  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    setShowingSessions(false);
  };

  // Handle closing the sessions list
  const handleCloseSessions = () => {
    setShowingSessions(false);
  };

  // Handle toggling mute/unmute
  const toggleMute = () => {
    setSessionState((prev) => {
      const newMuteState = !prev.isMuted;

      // Adjust the gain accordingly
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newMuteState ? 0 : 1;
      }

      return { ...prev, isMuted: newMuteState };
    });
  };

  // Handle requesting a report
  const handleRequestReport = async (sessionId: string) => { // Changed to string
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Find the session
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;

      // Update Firestore
      const sessionDocRef = doc(
        db,
        'users',
        userId,
        'sessions',
        session.id // Use the document ID
      );
      await updateDoc(sessionDocRef, {
        reportRequested: true,
      });

      // Update local state
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === sessionId ? { ...s, reportRequested: true } : s
        )
      );
    } catch (error) {
      console.error('Error updating report request:', error);
    }
  };

  // **Define handleSignOut function**
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redirect to sign-in page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // **Add this new array for the questions**
  const carouselQuestions = [
    "Explain a topic in American culture.",
    "Practice your elevator pitch or self-introduction.",
    "Practice small talk or a conversation with a stranger.",
    "Prepare for a speaking test, presentation, or interview.",
    "Or just talk about your hobbies or interests.",
  ];

  // **Conditional Rendering Based on Authentication Status**
  if (isAuthenticated === null) {
    // Authentication status is loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated; optional since we already redirect
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Pass handleSignOut to Header component */}
      <Header xpRef={xpRef} xp={xp} onSignOut={handleSignOut} />

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[calc(100vh-400px)] mb-4 overflow-y-auto scrollbar-hide relative">
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

        {/* Add the QuestionCarousel here */}
        {!sessionState.isActive && (
          <QuestionCarousel questions={carouselQuestions} />
        )}
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

      {/* Conditional Rendering for Sessions List */}
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
          <SessionsList
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onRequestReport={handleRequestReport}
          />
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedSession.sessionName}</h2>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-600 hover:text-gray-800"
              aria-label="Close Session Details"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <p>
              <strong>Date:</strong>{' '}
              {new Date(selectedSession.date).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {selectedSession.duration}
            </p>
            <h3 className="font-medium text-lg">Transcript:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {selectedSession.transcript}
            </pre>
            <div className="flex space-x-2">
              {/* Play Combined Audio Button */}
              {selectedSession.userAudioURL && (
                <a
                  href={selectedSession.userAudioURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition"
                  aria-label={`Play Audio for ${selectedSession.sessionName}`}
                >
                  <Play size={16} />
                  <span>Play Audio</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {!showingSessions && !selectedSession && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Section: Previous Sessions Button */}
            <div className="flex-1 flex justify-start">
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
            <div className="flex-shrink-0">
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
                  onClick={toggleMute}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    sessionState.isMuted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                  aria-label={sessionState.isMuted ? 'Unmute' : 'Mute'}
                >
                  {sessionState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  <span>{sessionState.isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              )}
            </div>

            {/* Right Section: Feedback and End Session Buttons */}
            <div className="flex-1 flex justify-end space-x-2">
              {/* Feedback Button */}
              <a
                href="https://forms.gle/UmeH7nSKtZucMJkV6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition"
                aria-label="Feedback"
              >
                <ExternalLink size={24} />
                <span>Feedback</span>
              </a>

              {/* End Session Button (visible only when session is active) */}
              {sessionState.isActive && (
                <button
                  onClick={handleEndSession}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg transition"
                  aria-label="End Session"
                >
                  <X size={24} />
                  <span>End Session</span>
                </button>
              )}
            </div>
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
