// src/components/SessionDetails.tsx
import React from 'react';
import { X } from 'lucide-react';
import { SessionDetailsProps } from '../types';

export function SessionDetails({ session, onClose }: SessionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close Session Details"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-4">Session Details</h2>
        <p><strong>Date:</strong> {session.date}</p>
        <p><strong>Time:</strong> {session.time}</p>
        <p className="mt-2"><strong>Transcript:</strong></p>
        <p className="bg-gray-100 p-2 rounded mt-1">{session.transcript}</p>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Audio Recording:</h3>
          <audio controls className="w-full mt-2">
            <source src={session.audioURL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
}
