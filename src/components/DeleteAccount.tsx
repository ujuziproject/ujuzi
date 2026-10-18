import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearTryItPlan } from '../lib/tryItPlan';

// Permanently deletes the student's account and everything in it.
// Files are removed through the Storage API first, then the database
// function delete_my_account() removes the login and cascades everything else.
export function DeleteAccount({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const removeFolder = async (bucket: string) => {
    const { data } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
    if (data && data.length) {
      await supabase.storage.from(bucket).remove(data.map(f => `${userId}/${f.name}`));
    }
  };

  const deleteAccount = async () => {
    setWorking(true);
    setError('');
    try {
      await Promise.all([removeFolder('curricula'), removeFolder('avatars')]).catch(() => undefined);
      const { error: rpcError } = await supabase.rpc('delete_my_account');
      if (rpcError) throw rpcError;
      clearTryItPlan();
      await supabase.auth.signOut().catch(() => undefined);
      window.location.href = '/';
    } catch (err: any) {
      setError(`We couldn't delete your account: ${err?.message || 'unknown error'}. Please try again or contact support.`);
      setWorking(false);
    }
  };

  return (
    <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50/50 p-6 md:p-8">
      <h3 className="text-lg font-bold text-red-700 mb-1">Delete account</h3>
      <p className="text-sm text-slate-600 mb-4">
        Permanently delete your account, courses, notes, flashcards, quizzes, progress and uploaded files. This can’t be undone.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="px-5 py-2.5 rounded-full border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors">
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 text-sm text-red-700"><AlertTriangle className="w-5 h-5 shrink-0" /> Type <strong>DELETE</strong> to confirm.</div>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="block w-full max-w-xs px-4 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 bg-white"
            aria-label="Type DELETE to confirm"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={deleteAccount}
              disabled={confirmText !== 'DELETE' || working}
              className="px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold text-sm disabled:opacity-40 flex items-center gap-2"
            >
              {working && <Loader2 className="w-4 h-4 animate-spin" />} Permanently delete
            </button>
            <button onClick={() => { setOpen(false); setConfirmText(''); }} disabled={working} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-white">
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
