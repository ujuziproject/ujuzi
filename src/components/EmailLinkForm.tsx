import React, { useEffect, useState } from 'react';
import { Loader2, Mail, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/errors';

// The main way to join or log in: we email a one-time sign-in link, no password needed.
// New accounts are created automatically; the name is saved with the account.
export function EmailLinkForm({ mode }: { mode: 'signup' | 'login' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim().toLowerCase();
    if (mode === 'signup' && cleanName.length < 2) { setError('Tell us your name so we know what to call you.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Enter a valid email address.'); return; }
    setSending(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
        data: cleanName ? { full_name: cleanName } : undefined,
      },
    });
    setSending(false);
    if (error) {
      // Supabase allows one link per minute per address
      const wait = /after (\d+) seconds?/i.exec(error.message);
      if (wait) { setCooldown(Number(wait[1])); setError(`Please wait ${wait[1]} seconds before asking for another link.`); return; }
      setError(friendlyAuthError(error, "We couldn't send the link. Please try again."));
      return;
    }
    setSentTo(cleanEmail);
    setCooldown(60);
  };

  if (sentTo) {
    return (
      <div className="text-center p-6 rounded-[1.5rem] border border-border bg-surface-alt" role="status">
        <div className="text-5xl mb-3" aria-hidden="true">📬</div>
        <h2 className="text-xl font-black text-ink font-display mb-1">Check your inbox</h2>
        <p className="text-slate-500 text-[15px] mb-5">
          We sent a sign-in link to <strong className="text-ink">{sentTo}</strong>. Tap it to {mode === 'signup' ? 'create your account' : 'log in'}. It can take a minute to arrive — check Spam or Promotions too.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => send()}
            disabled={cooldown > 0 || sending}
            className="w-full py-3 rounded-full border border-border bg-white font-semibold text-ink disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
          </button>
          <button type="button" onClick={() => { setSentTo(''); setError(''); }} className="text-sm font-semibold text-accent py-2">
            Use a different email
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4" noValidate>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100" role="alert">{error}</div>}
      {mode === 'signup' && (
        <div>
          <label htmlFor="link-name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
            <input
              id="link-name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              placeholder="e.g. Chidi Okeke"
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm"
            />
          </div>
        </div>
      )}
      <div>
        <label htmlFor="link-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
          <input
            id="link-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={sending || cooldown > 0}
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-accent/20"
      >
        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : cooldown > 0 ? `Wait ${cooldown}s` : mode === 'signup' ? 'Email me my sign-up link' : 'Email me a log-in link'}
      </button>
      <p className="text-center text-[13px] text-slate-500">No password to remember — we'll email you a secure link.</p>
    </form>
  );
}
