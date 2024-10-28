// src/components/VoiceAgent.tsx
import React, { useEffect, useRef } from 'react';

interface VoiceAgentProps {
  isActive: boolean;
  isMuted: boolean;
  onAddMessage: (message: string, isAI: boolean) => void;
  onSocketError: (error: string) => void;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({
  isActive,
  isMuted,
  onAddMessage,
  onSocketError,
}) => {
  const AGENT_ID =  'Sofia-5z9C9lXSbExVo-wIVEI7Q'; // Ensure to set in .env
  const API_KEY = 'ak-a8c546a168d84b63b4cd345a8c200026'; // Ensure to set in .env

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (isActive && !isMuted) {
      initializeWebSocket();
      startRecording();
    }

    return () => {
      stopRecording();
      closeWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isMuted]);

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

        if (event.type === 'onUserTranscript') {
          console.log('User transcript:', event.message);
          onAddMessage(event.message, false); // Add as user message
        } else if (event.type === 'onAgentTranscript') {
          console.log('Agent transcript:', event.message);
          onAddMessage(event.message, true); // Add as AI message
        }

        if (event.type === 'audioStream') {
          handleAudioStream(event.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        onSocketError('Error processing AI response.');
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onSocketError('WebSocket connection error.');
    };
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current) return; // Already recording

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        const base64Data = await blobToBase64(event.data);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: 'audioIn', data: base64Data })
          );
        }
      };

      mediaRecorder.start(250); // Collect 250ms chunks of audio
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onSocketError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
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

  const handleAudioStream = (base64Data: string) => {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.play().catch((error) => console.error('Error playing AI audio:', error));
  };

  return null; // This component does not render anything
};

export default VoiceAgent;
