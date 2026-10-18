import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/errors';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { loadTryItPlan } from '../lib/tryItPlan';
import { EmailLinkForm } from './EmailLinkForm';
import { GoogleSignInButton } from './GoogleSignInButton';

interface Step1Props {
 onNext: (userId: string, name: string) => void;
 onLoginClick: () => void;
}

export function Step1SignUp({ onNext, onLoginClick }: Step1Props) {
 const [plan] = useState(() => loadTryItPlan());
 const [usePassword, setUsePassword] = useState(false);
 const [fullName, setFullName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [checkEmail, setCheckEmail] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (password !== confirmPassword) {
 setError("The two passwords don't match.");
 return;
 }
 setLoading(true);
 setError('');

 try {
 const { data, error: signUpError } = await supabase.auth.signUp({
 email,
 password,
 // Keep the name with the account so the profile can be created after email confirmation
 options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
 });

 if (signUpError) throw signUpError;
 
 const user = data.user;
 if (!user) throw new Error('User creation failed');

 // With email confirmation on, there is no session until they click the link
 if (!data.session) {
 setCheckEmail(true);
 return;
 }

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
 setError(friendlyAuthError(err, 'An error occurred during sign up.'));
 } finally {
 setLoading(false);
 }
 };

 if (checkEmail) {
 return (
 <div className="w-full max-w-md mx-auto text-center">
 <div className="text-5xl mb-4" aria-hidden="true">📬</div>
 <h1 className="text-3xl font-black text-ink mb-2 font-display">Check your email</h1>
 <p className="text-slate-500 mb-6">We sent a confirmation link to <strong className="text-ink">{email}</strong>. Open it to finish creating your account{plan ? ' and save your plan' : ''}.</p>
 <button type="button" onClick={onLoginClick} className="text-sm font-semibold text-accent">Already confirmed? Log in</button>
 </div>
 );
 }

 return (
 <div className="w-full max-w-md mx-auto ">
 <div className="text-center mb-10">
 <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2">Quest 1 · Create your account</div>
 <h1 className="text-3xl font-black text-ink mb-2 font-display">{plan ? 'Save your study plan' : 'Join uJuzi 👋'}</h1>
 <p className="text-slate-500">{plan ? "One quick step and it's yours to keep." : 'Create your student account to get started.'}</p>
 </div>

 {plan && (
 <div className="mb-6 p-4 rounded-2xl border border-accent/30 bg-accent/5 text-sm text-ink">
 <div className="font-bold mb-0.5">“{plan.name}” · {plan.topics.length} {plan.topics.length === 1 ? 'topic' : 'topics'}{plan.hard.length ? ` · ${plan.hard.length} marked hard` : ''}</div>
 <div className="text-slate-500">Create your account and we'll build notes, flashcards and quizzes for it right after setup.</div>
 </div>
 )}

 {!usePassword ? (
 <>
 <EmailLinkForm mode="signup" />
 <div className="flex items-center gap-3 my-6">
 <div className="h-px flex-1 bg-border" />
 <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">or</span>
 <div className="h-px flex-1 bg-border" />
 </div>
 <div className="space-y-3">
 <GoogleSignInButton label="Sign up with Google" />
 <button type="button" onClick={() => setUsePassword(true)} className="w-full py-3 px-4 rounded-full border border-border bg-white text-ink font-semibold text-[15px] hover:bg-slate-50 transition-colors">
 Sign up with a password instead
 </button>
 </div>
 <div className="mt-6 text-center text-sm text-slate-500">
 Already have an account?{' '}
 <button type="button" onClick={onLoginClick} className="font-medium text-accent">Log in</button>
 </div>
 </>
 ) : (
 <>
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
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-slate-400" />
 </div>
 <input
 type="password"
 required
 minLength={6}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className={cn("block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors", confirmPassword && confirmPassword !== password ? 'border-red-300' : 'border-border')}
 placeholder="Type it again"
 />
 </div>
 {confirmPassword && confirmPassword !== password && <p className="text-xs text-red-600 mt-1">Passwords don't match yet.</p>}
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
 <button type="button" onClick={() => setUsePassword(false)} className="w-full mt-4 text-sm font-semibold text-accent">
 ← Use an email link instead (recommended)
 </button>
 </>
 )}
 </div>
 );
}
