// src/types.d.ts

export interface Session {
    id: string;                    // Firestore document ID
    userId: string;                // User's unique ID
    transcript: string;            // Session transcript
    date: string;                  // Session date (YYYY-MM-DD)
    time: string;                  // Session time (HH:MM AM/PM)
    audioURL: string;              // URL to the audio recording in Firebase Storage
    createdAt: firebase.firestore.Timestamp;  // Timestamp of session creation
  }
  
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
  
  export interface SessionsListProps {
    sessions: Session[];
    onSelectSession: (session: Session) => void;
  }
  
  export interface HeaderProps {
    xpRef: React.RefObject<HTMLDivElement>;
    xp: number;
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
  
  export interface SessionDetailsProps {
    session: Session;
    onClose: () => void;
  }
  