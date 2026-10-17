step0 = """import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { recordActivity } from '../lib/activity';

interface Step0Props {
  onNext: (userId: string, name: string) => void;
  onSignUpClick: () => void;
}

export function Step0Login({ onNext, onSignUpClick }: Step0Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      const user = data.user;
      if (!user) throw new Error('Login failed');

      // Record login activity
      await recordActivity(user.id, 'login');

      // Fetch profile to get name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      const fullName = profile?.full_name || email.split('@')[0];

      onNext(user.id, fullName);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ink mb-2">Welcome Back</h1>
        <p className="text-slate-500">Log in to your uJuzi student account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-accent/20"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Log In'
          )}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={onSignUpClick}
            className="font-medium text-accent hover:text-accent transition-colors"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
"""

step1 = """import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step1Props {
  onNext: (userId: string, name: string) => void;
  onLoginClick: () => void;
}

export function Step1SignUp({ onNext, onLoginClick }: Step1Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      
      const user = data.user;
      if (!user) throw new Error('User creation failed');

      // Create profile row
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          role: 'student'
        });
        
      if (profileError) {
        console.error('Profile creation error', profileError);
      }

      onNext(user.id, fullName);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ink mb-2">Join uJuzi</h1>
        <p className="text-slate-500">Create your student account to get started.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
              placeholder="e.g. Chidi Okeke"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-accent/20"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onLoginClick}
            className="font-medium text-accent hover:text-accent transition-colors"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}
"""

with open('src/components/Step0Login.tsx', 'w') as f:
    f.write(step0)

with open('src/components/Step1SignUp.tsx', 'w') as f:
    f.write(step1)
