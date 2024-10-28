import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowLeft } from 'lucide-react';
import { auth, googleProvider } from '../firebase'; // Import Firebase and Google provider
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null); // For error handling

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Log in the user in Firebase with email and password
    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        // Navigate to a different page after successful login
        navigate('/dashboard');
      })
      .catch((error) => {
        console.error('Error logging in user:', error);
        setError(error.message); // Set error message
      });
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        console.log('Google sign-in successful:', result.user);
        // Navigate to the dashboard after Google sign-in
        navigate('/dashboard');
      })
      .catch((error) => {
        console.error('Error with Google sign-in:', error);
        setError(error.message); // Set error message
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white">
      <nav className="p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>
      </nav>

      <div className="max-w-md mx-auto pt-8 px-4">
        <div className="flex items-center gap-2 justify-center mb-8">
   
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Log in to your account</h1>
            <p className="text-gray-600">Continue your journey</p>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* Error message */}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg
            hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3
            border border-gray-200 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg
                hover:bg-orange-600 transition-all duration-300 transform hover:scale-[1.02]
                shadow-lg shadow-orange-500/20"
            >
              Log In
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
