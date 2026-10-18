import React, { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/errors';

// Shown when a student opens the "reset your password" link from their email.
export function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Use at least 8 characters.'); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setSaving(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { setError(friendlyAuthError(error, "Couldn't update your password. Please try again.")); return; }
    onDone();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-ink mb-2 font-display">Choose a new password</h1>
        <p className="text-slate-500">Then you'll go straight back to your studies.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100" role="alert">{error}</div>}
        {[
          { label: 'New password', value: password, set: setPassword },
          { label: 'Confirm new password', value: confirm, set: setConfirm },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
              <input
                type="password"
                required
                minLength={8}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm"
              />
            </div>
          </div>
        ))}
        <button type="submit" disabled={saving} className="w-full mt-2 bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-full flex items-center justify-center disabled:opacity-70">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save new password'}
        </button>
      </form>
    </div>
  );
}
