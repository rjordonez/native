import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MessageCircle, Heart, Plus, X, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure Firebase Firestore is set up

// Define the Interest type with the optional 'custom' property
type Interest = {
  name: string;
  selected: boolean;
  custom?: boolean; // 'custom' is optional
};

// Define the initial interests with default values (no 'custom' property initially)
const INTERESTS: Interest[] = [
  "Art & Design", "Basketball", "Cooking", "Computer Science", "Dancing", 
  "Fashion", "Fitness", "Gaming", "Gardening", "Hiking", "Music", 
  "Photography", "Reading", "Snowboarding", "Soccer", "Travel", 
  "Writing", "Yoga"
].map(interest => ({ name: interest, selected: false })); // No 'custom' initially

const LANGUAGE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Native"];
const REASONS = [
  "Make International Friends",
  "Academic Practice",
  "Career Development",
  "Cultural Exchange",
  "Travel Preparation",
  "Personal Growth"
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [newInterest, setNewInterest] = useState('');
  const [formData, setFormData] = useState({
    university: '',
    languageLevel: '',
    reason: '',
    interests: INTERESTS,
    loading: false
  });

  // Update selected interests
  const updateInterest = (interestName: string) => {
    const selectedCount = formData.interests.filter(i => i.selected).length;
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.map(interest => {
        if (interest.name === interestName) {
          if (!interest.selected && selectedCount >= 3) return interest;
          return { ...interest, selected: !interest.selected };
        }
        return interest;
      })
    }));
  };

  // Add custom interest
  const addCustomInterest = () => {
    if (!newInterest.trim()) return;
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, { name: newInterest.trim(), selected: true, custom: true }]
    }));
    setNewInterest('');
  };

  // Remove interest
  const removeInterest = (interestName: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest.name !== interestName)
    }));
  };

  // Handle form submission to Firebase
  const handleNext = async () => {
    if (step === 4) {
      setFormData(prev => ({ ...prev, loading: true }));
      
      try {
        // Save or update user onboarding data to Firestore
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            // Merge the onboarding data with the existing user data
            university: formData.university,
            languageLevel: formData.languageLevel,
            reason: formData.reason,
            interests: formData.interests.filter(i => i.selected).map(i => i.name)
          }, { merge: true }); // Use merge to avoid overwriting existing data like name and email
          console.log('Onboarding data submitted');
        }
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      } finally {
        setFormData(prev => ({ ...prev, loading: false }));
        navigate('/dashboard');  // Redirect to the dashboard
      }
  
      return;
    }
    setStep(prev => prev + 1);  // Move to the next step if not on the last step
  };
  

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.university.length > 0;
      case 2: return formData.languageLevel.length > 0;
      case 3: return formData.reason.length > 0;
      case 4: return formData.interests.filter(i => i.selected).length === 3;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 border border-gray-100">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num ? 'bg-orange-500 text-white' : 'bg-gray-100'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: University */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">What university do you attend?</h2>
            </div>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
              placeholder="Enter your university"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        )}

        {/* Step 2: Language Level */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">What's your speaking level?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {LANGUAGE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData(prev => ({ ...prev, languageLevel: level }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.languageLevel === level
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 hover:border-orange-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Reason */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Why are you using the app?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setFormData(prev => ({ ...prev, reason }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.reason === reason
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 hover:border-orange-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select 3 interests</h2>
              <p className="text-gray-600">
                {3 - formData.interests.filter(i => i.selected).length} selections remaining
              </p>
            </div>
            
            {/* Add custom interest */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add your own interest"
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <button
                onClick={addCustomInterest}
                disabled={!newInterest.trim()}
                className="p-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {formData.interests.map((interest) => (
                <button
                  key={interest.name}
                  onClick={() => updateInterest(interest.name)}
                  disabled={!interest.selected && formData.interests.filter(i => i.selected).length >= 3}
                  className={`group p-3 rounded-lg border-2 transition-all relative ${
                    interest.selected
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 hover:border-orange-200'
                  } ${
                    !interest.selected && formData.interests.filter(i => i.selected).length >= 3
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {interest.name}
                  {interest.custom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInterest(interest.name);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Loader2 className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || formData.loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ml-auto ${
              isStepValid() && !formData.loading
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 cursor-not-allowed'
            }`}
          >
            {formData.loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {step === 4 ? 'Complete' : 'Next'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
