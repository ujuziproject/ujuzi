import React, { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/errors';

// Other ways to sign in: Google (only shown once it's switched on in Supabase)
// and a one-time sign-in link sent by email (no password needed).
export function AuthAlternatives({ mode }: { mode: 'login' | 'signup' }) {
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showEmailLink, setShowEmailLink] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Ask Supabase which providers are switched on, so we never show a broken button
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then(r => (r.ok ? r.json() : null))
      .then(settings => setGoogleEnabled(!!settings?.external?.google))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const withGoogle = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(friendlyAuthError(error, 'Google sign-in failed. Please try again.'));
  };

  // Not a <form>: this component sits inside the login/sign-up forms, and nested forms break submission
  const sendLink = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setSending(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });
    setSending(false);
    if (error) setError(friendlyAuthError(error, "We couldn't send the link. Please try again."));
    else setSent(true);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        {googleEnabled && (
          <button
            type="button"
            onClick={withGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-border bg-white text-ink font-semibold text-[15px] hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
          </button>
        )}

        {!showEmailLink ? (
          <button
            type="button"
            onClick={() => setShowEmailLink(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-border bg-white text-ink font-semibold text-[15px] hover:bg-slate-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-slate-500" />
            Email me a sign-in link
          </button>
        ) : sent ? (
          <div className="p-4 rounded-2xl bg-[#E2F7EB] text-[14px] text-ink" role="status">
            <strong>Check your inbox.</strong> We sent a sign-in link to {email}. Open it on this device to continue.
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-border bg-surface-alt space-y-3">
            <label className="block text-sm font-medium text-gray-700">Your email — no password needed</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendLink(); } }}
              placeholder="you@example.com"
              className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm"
            />
            <button type="button" onClick={sendLink} disabled={sending} className="w-full bg-ink text-white font-semibold py-3 rounded-full disabled:opacity-60 flex items-center justify-center">
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send me the link'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600 text-center" role="alert">{error}</p>}
    </div>
  );
}
