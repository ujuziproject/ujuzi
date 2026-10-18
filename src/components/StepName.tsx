import React, { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Shown once to students who signed in without giving a name (e.g. an email link),
// so the app never greets them by their email address.
export function StepName({ userId, onDone }: { userId: string; onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = name.trim().replace(/\s+/g, ' ');
    if (fullName.length < 2) { setError('Please enter your name.'); return; }
    setSaving(true);
    setError('');
    const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
    // Also store it on the login itself, so we don't ask again on another device
    await supabase.auth.updateUser({ data: { full_name: fullName } }).catch(() => undefined);
    setSaving(false);
    if (profileError) { setError(`Couldn't save your name: ${profileError.message}`); return; }
    onDone(fullName);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4" aria-hidden="true">👋</div>
        <h1 className="text-3xl font-black text-ink mb-2 font-display">What should we call you?</h1>
        <p className="text-slate-500">Your name appears on your learner card and dashboard.</p>
      </div>
      <form onSubmit={save} className="space-y-4">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100" role="alert">{error}</div>}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            placeholder="e.g. Chidi Okeke"
            aria-label="Your full name"
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-full flex items-center justify-center disabled:opacity-70">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
