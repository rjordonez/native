import React from 'react';
import { Users } from 'lucide-react';

export type Coach = {
  id: string;
  name: string;
  level: string;
  avatar: string;
  description: string;
};

const coaches: Coach[] = [
  {
    id: 'emma',
    name: 'Emma',
    level: 'Beginner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    description: 'Patient and supportive coach for beginners'
  },
  {
    id: 'james',
    name: 'James',
    level: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    description: 'Focuses on fluency and vocabulary expansion'
  },
  {
    id: 'native',
    name: 'Native',
    level: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    description: 'Advanced conversation and native expressions'
  }
];

interface CoachSelectorProps {
  selectedCoach: Coach;
  onSelectCoach: (coach: Coach) => void;
}

export function CoachSelector({ selectedCoach, onSelectCoach }: CoachSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        <Users className="w-5 h-5 text-orange-500" />
        <span className="text-gray-700">Change Coach</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg p-4 z-10 animate-fadeIn">
          <div className="space-y-3">
            {coaches.map((coach) => (
              <button
                key={coach.id}
                onClick={() => {
                  onSelectCoach(coach);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedCoach.id === coach.id
                    ? 'bg-orange-50 border-orange-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={coach.avatar}
                  alt={coach.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{coach.name}</div>
                  <div className="text-sm text-gray-500">{coach.level}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { coaches };