import React, { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSignupDisabled, setIsSignupDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const getErrorMessage = (error: any) => {
    if (error.message === 'Invalid login credentials') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.message?.toLowerCase().includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (error.message?.toLowerCase().includes('password')) {
      return 'Password must be at least 6 characters long.';
    }
    return error.message || 'An error occurred. Please try again.';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        if (isSignupDisabled) {
          setError(`Please wait ${countdown} seconds before trying again`);
          return;
        }

        if (!fullName.trim()) {
          setError('Please enter your full name');
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        
        if (signUpError) {
          if (signUpError.status === 429) {
            setIsSignupDisabled(true);
            let timeLeft = 60;
            setCountdown(timeLeft);

            const timer = setInterval(() => {
              timeLeft -= 1;
              setCountdown(timeLeft);
              
              if (timeLeft <= 0) {
                clearInterval(timer);
                setIsSignupDisabled(false);
                setCountdown(0);
              }
            }, 1000);
          }
          throw signUpError;
        }
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isLogin}
                minLength={2}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Please enter a valid email address"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
              title="Password must be at least 6 characters long"
            />
          </div>

          <button
            type="submit"
            disabled={!isLogin && isSignupDisabled}
            className={`w-full py-2 rounded-lg transition-colors ${
              !isLogin && isSignupDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
            {!isLogin && isSignupDisabled && countdown > 0 && ` (${countdown}s)`}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setFullName('');
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}