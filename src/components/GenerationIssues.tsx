import React from 'react';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

// Shown after generation when some or all topics failed, instead of silently
// sending the student back to the dashboard.
export function GenerationIssues({
  total,
  failedCount,
  reason,
  onRetry,
  onContinue,
}: {
  total: number;
  failedCount: number;
  reason: string;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const allFailed = failedCount >= total;
  return (
    <div className="bg-surface-alt rounded-[2rem] border border-border p-8 md:p-10 shadow-sm max-w-xl mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2 font-display">
        {allFailed ? "We couldn't generate your study materials" : `${total - failedCount} of ${total} topics are ready`}
      </h2>
      <p className="text-slate-500 mb-4">
        {allFailed
          ? 'Your topics are saved, but the notes, flashcards and quizzes failed to generate.'
          : `${failedCount} topic${failedCount === 1 ? '' : 's'} failed. You can retry them now or later.`}
      </p>
      {reason && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 mb-6 text-left break-words" role="alert">
          <span className="font-semibold">Reason: </span>{reason}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onRetry} className="bg-accent text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
          <RotateCcw className="w-4 h-4" /> Retry {allFailed ? '' : 'failed topics'}
        </button>
        <button onClick={onContinue} className="bg-surface border border-border text-ink px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:border-accent transition-colors">
          {allFailed ? 'Back to dashboard' : 'Continue'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
