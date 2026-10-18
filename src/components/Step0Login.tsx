import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/errors';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { recordActivity } from '../lib/activity';
import { AuthAlternatives } from './AuthAlternatives';

interface Step0Props {
 onNext: (userId: string, name: string) => void;
 onSignUpClick: () => void;
}

export function Step0Login({ onNext, onSignUpClick }: Step0Props) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [resetMode, setResetMode] = useState(false);
 const [resetSent, setResetSent] = useState(false);

 const sendReset = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
 setLoading(false);
 if (error) setError(friendlyAuthError(error, "We couldn't send the reset email. Please try again."));
 else setResetSent(true);
 };

 if (resetMode) {
 return (
 <div className="w-full max-w-md mx-auto">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-black text-ink mb-2 font-display">Forgot your password?</h1>
 <p className="text-slate-500">Enter your email and we'll send you a link to choose a new one.</p>
 </div>
 {resetSent ? (
 <div className="p-4 rounded-2xl bg-[#E2F7EB] text-[14px] text-ink mb-6" role="status">
 <strong>Check your inbox.</strong> If an account exists for {email}, a reset link is on its way. Open it on this device.
 </div>
 ) : (
 <form onSubmit={sendReset} className="space-y-4">
 {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
 <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm" />
 </div>
 <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 rounded-full flex items-center justify-center disabled:opacity-70">
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
 </button>
 </form>
 )}
 <button type="button" onClick={() => { setResetMode(false); setResetSent(false); setError(''); }} className="w-full mt-6 text-sm font-medium text-accent">
 ← Back to log in
 </button>
 </div>
 );
 }

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
 setError(friendlyAuthError(err, 'An error occurred during login.'));
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full max-w-md mx-auto ">
 <div className="text-center mb-10">
 <h1 className="text-3xl font-black text-ink mb-2 font-display">Welcome back 👋</h1>
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
 <div className="flex items-center justify-between mb-1">
 <label className="block text-sm font-medium text-gray-700">Password</label>
 <button type="button" onClick={() => { setResetMode(true); setError(''); }} className="text-[13px] font-semibold text-accent hover:underline">Forgot password?</button>
 </div>
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

 <AuthAlternatives mode="login" />

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
