// src/aiAgent.ts
import { useEffect, useRef } from 'react';

// AI Voice Agent Integration Constants
const AGENT_ID = 'Sofia-5z9C9lXSbExVo-wIVEI7Q'; // Replace with your Agent ID
const API_KEY = 'ak-a8c546a168d84b63b4cd345a8c200026'; // Replace with your API Key

interface UseAiAgentProps {
  addMessage: (message: string, isAI: boolean) => void;
  onSocketError: (error: string | null) => void;
}

export function useAiAgent({ addMessage, onSocketError }: UseAiAgentProps) {
  // Refs for WebSocket, MediaRecorder, AudioContext, and GainNode
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const userAudioChunksRef = useRef<Blob[]>([]); // For user audio
  const aiAudioChunksRef = useRef<Blob[]>([]); // For AI audio
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const isSourceBufferUpdatingRef = useRef<boolean>(false);
  const lastUhTimestamp = useRef<number>(0); // For debouncing 'uh' detections
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sessionStateRef = useRef<{
    isMuted: boolean;
  }>({
    isMuted: false,
  });

  // Initialize WebSocket connection
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
          addMessage(event.message, false);
        } else if (event.type === 'onAgentTranscript') {
          console.log('Agent transcript:', event.message);
          addMessage(event.message, true);

          if (event.message.trim().toLowerCase() === 'uh,') {
            const now = Date.now();
            if (now - lastUhTimestamp.current > 5000) {
              handleUhCase();
              lastUhTimestamp.current = now;
            }
          }
        }

        if (event.type === 'audioStream') {
          handleAudioStream(event.data);
        } else if (event.type === 'newAudioStream') {
          console.log('New audio stream started');
          // No action needed
        } else if (event.type === 'voiceActivityStart') {
          console.log('User started speaking');
          handleVoiceActivityStart();
        } else if (event.type === 'voiceActivityEnd') {
          console.log('User stopped speaking');
          handleVoiceActivityEnd(sessionStateRef.current.isMuted);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onSocketError('WebSocket connection error');
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

    // Collect AI audio chunks
    aiAudioChunksRef.current.push(new Blob([arrayBuffer], { type: 'audio/mp3' }));

    if (sourceBufferRef.current && !isSourceBufferUpdatingRef.current) {
      appendNextBuffer();
    }
  };

  const appendNextBuffer = () => {
    if (audioChunksRef.current.length === 0 || !sourceBufferRef.current) {
      return;
    }

    if (sourceBufferRef.current.updating) {
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
    addMessage(
      "I notice you're using 'uh' quite a bit. Would you like some tips to reduce filler words?",
      true
    );
  };

  const initializeMediaSource = () => {
    if (audioElementRef.current && !mediaSourceRef.current) {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      audioElementRef.current.src = URL.createObjectURL(mediaSource);
      audioElementRef.current.autoplay = true;

      mediaSource.addEventListener('sourceopen', () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
          sourceBufferRef.current = sourceBuffer;

          sourceBuffer.mode = 'sequence'; // Ensure proper sequence

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
    }
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') return;

    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });
      console.log('Microphone access granted.');

      // Set up Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;

      gainNode.gain.value = 1;
      source.connect(gainNode);

      // Create a new MediaStream from the GainNode
      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);

      const processedStream = destination.stream;

      // Set up MediaRecorder with the processed stream
      const options = { mimeType: 'audio/webm;codecs=opus' };
      console.log('Initializing MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(processedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      userAudioChunksRef.current = []; // Reset user audio chunks

      mediaRecorder.ondataavailable = async (event) => {
        userAudioChunksRef.current.push(event.data); // Collect user audio chunks

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
      onSocketError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
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

  // **Modified handleVoiceActivityStart: Reset MediaSource only if AI audio is playing**
  const handleVoiceActivityStart = () => {
    // Check if AI audio is currently playing
    if (
      audioElementRef.current &&
      !audioElementRef.current.paused &&
      !audioElementRef.current.ended
    ) {
      // User is interrupting the AI
      console.log('User is interrupting the AI');

      // Pause and reset the AI audio
      audioElementRef.current.pause();

      // Reset MediaSource and clear audio buffers
      resetMediaSource();

      // Reinitialize MediaSource
      initializeMediaSource();

      // Clear AI audio chunks
      audioChunksRef.current = [];
      aiAudioChunksRef.current = [];
    } else {
      // AI is not speaking, do not reset MediaSource
      console.log('User started speaking, but AI is not speaking');
    }
  };

  // Resume playback when the user stops speaking
  const handleVoiceActivityEnd = (isMuted: boolean) => {
    if (audioElementRef.current && !isMuted) {
      if (audioElementRef.current.paused) {
        audioElementRef.current
          .play()
          .catch((error) => console.error('Error resuming audio:', error));
      }
    }
  };

  // Reset MediaSource and related refs
  const resetMediaSource = () => {
    // Stop and detach the audio element safely
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.removeAttribute('src');
      audioElementRef.current.load(); // Reset the audio element
    }

    // Reset MediaSource and SourceBuffer
    if (mediaSourceRef.current) {
      try {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
      } catch (error) {
        console.error('Error ending MediaSource stream:', error);
      }
      mediaSourceRef.current = null;
    }

    if (sourceBufferRef.current) {
      sourceBufferRef.current = null;
    }

    audioChunksRef.current = [];
  };

  // Function to get the user's audio Blob
  function getUserAudioBlob(): Blob {
    return new Blob(userAudioChunksRef.current, {
      type: 'audio/webm; codecs=opus',
    });
  }

  // Function to get the AI's audio Blob
  function getAiAudioBlob(): Blob {
    return new Blob(aiAudioChunksRef.current, { type: 'audio/mp3' });
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      closeWebSocket();

      // Reset MediaSource and SourceBuffer
      resetMediaSource();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
}
