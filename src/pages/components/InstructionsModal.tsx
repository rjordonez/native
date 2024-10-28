// src/components/InstructionsModal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface InstructionsModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">How to Interact with VoiceAI</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            1. Once you start the session, you'll have 5 minutes to interact with the AI voice agent.
          </p>
          <p className="text-gray-600">
            2. Click the microphone button to start/stop recording your voice.
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
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
