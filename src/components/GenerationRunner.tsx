import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Circle, Loader2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { generateForTopics, type GenerationPrefs, type PreviewCard, type TopicStatus } from '../lib/generation';
import { STUDY_TIPS } from '../lib/studyTips';
import { cn } from '../lib/utils';

interface Props {
  topics: any[];
  prefs: GenerationPrefs;
  // Called as soon as generation ends (save statuses, build the study plan, show issues).
  onFinished: (result: { failed: any[]; firstError: string }) => void | Promise<void>;
  // Called when the student clicks through after everything succeeded.
  onContinue: () => void;
  continueLabel?: string;
}

// Runs material generation and keeps the student busy while it happens:
// a live checklist, real flashcards from finished topics, and study-science tips.
export function GenerationRunner({ topics, prefs, onFinished, onContinue, continueLabel = 'Start studying' }: Props) {
  const [statuses, setStatuses] = useState<Record<string, TopicStatus>>(
    () => Object.fromEntries(topics.map(t => [t.id, 'queued' as TopicStatus]))
  );
  const [cards, setCards] = useState<PreviewCard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * STUDY_TIPS.length));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const started = useRef(false);
  const [complete, setComplete] = useState(false);

  // Start once (React StrictMode mounts components twice in development)
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    generateForTopics(topics, prefs, {
      onTopicStatus: (id, status) => setStatuses(prev => ({ ...prev, [id]: status })),
      onCards: newCards => setCards(prev => [...prev, ...newCards]),
    }).then(async result => {
      await onFinished(result);
      if (result.failed.length === 0) setComplete(true);
    });
  }, []);

  // Warn before closing the tab mid-generation
  useEffect(() => {
    if (complete) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [complete]);

  // Rotate tips and refresh the time estimate
  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex(i => (i + 1) % STUDY_TIPS.length), 9000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(tipTimer); clearInterval(clock); };
  }, []);

  const total = topics.length;
  const finished = useMemo(() => Object.values(statuses).filter(s => s === 'done' || s === 'failed').length, [statuses]);
  const done = useMemo(() => Object.values(statuses).filter(s => s === 'done').length, [statuses]);
  const percent = total ? Math.round((finished / total) * 100) : 0;

  // Estimate from how long finished topics took so far
  let eta = 'Estimating time…';
  if (finished > 0 && finished < total) {
    const perTopic = (now - startedAt) / finished;
    const secondsLeft = Math.max(5, Math.round((perTopic * (total - finished)) / 1000));
    eta = secondsLeft < 60 ? `About ${secondsLeft} seconds left` : `About ${Math.ceil(secondsLeft / 60)} min left`;
  } else if (finished === total) {
    eta = 'Finishing up…';
  }

  const card = cards.length ? cards[cardIndex % cards.length] : null;
  const tip = STUDY_TIPS[tipIndex];

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Progress header */}
      {complete ? (
        <div className="rounded-[2rem] p-6 md:p-8 shadow-sm mb-6 text-white bg-gradient-to-br from-[#1E1139] via-[#2D1F5B] to-[#43236C] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="text-5xl animate-pop" aria-hidden="true">🎉</div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">Your study pack is ready!</h2>
              <p className="text-white/70 text-sm mt-1">{total} topics with notes, flashcards and quizzes. Your Planner has been updated too.</p>
            </div>
          </div>
          <button onClick={onContinue} className="shrink-0 bg-white text-ink px-7 py-3.5 rounded-full font-bold hover:bg-slate-50 transition-colors">
            {continueLabel} →
          </button>
        </div>
      ) : (
      <div className="bg-surface-alt rounded-[2rem] border border-border p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl md:text-2xl font-bold text-ink font-display">Building your study pack</h2>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          {done} of {total} topics ready · {eta}
        </p>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-accent transition-all duration-700" style={{ width: `${Math.max(percent, 4)}%` }} />
        </div>
      </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Flashcard peek + tip */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-alt rounded-[2rem] border border-border p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              {card ? `Sneak peek · ${card.topicTitle}` : 'Sneak peek'}
            </div>
            {card ? (
              <>
                <button
                  type="button"
                  onClick={() => setFlipped(f => !f)}
                  className={cn(
                    'w-full min-h-[170px] rounded-2xl p-6 text-left transition-colors border',
                    flipped ? 'bg-[#E2F7EB] border-[#B9E9CD]' : 'bg-white border-border hover:border-accent/50'
                  )}
                  aria-label={flipped ? 'Show question' : 'Reveal answer'}
                >
                  <div className="text-[11px] font-bold uppercase tracking-widest mb-2 text-slate-400">{flipped ? 'Answer' : 'Question'}</div>
                  <div className="text-[17px] font-semibold text-ink leading-snug">{flipped ? card.answer : card.question}</div>
                  {!flipped && <div className="text-[13px] text-accent font-semibold mt-4">Think of your answer, then tap to check</div>}
                </button>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { setCardIndex(i => i + 1); setFlipped(false); }}
                    className="mt-3 text-sm font-semibold text-slate-500 hover:text-accent flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Next card ({cards.length} ready)
                  </button>
                )}
              </>
            ) : (
              <div className="min-h-[170px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-6 h-6 text-accent animate-spin mb-3" />
                <div className="font-semibold text-ink">Your first flashcards are being written…</div>
                <div className="text-sm text-slate-500 mt-1">You can start practising here as soon as one topic is ready.</div>
              </div>
            )}
          </div>

          <div key={tipIndex} className="bg-[#FFF6D9] rounded-[2rem] p-6 animate-in fade-in duration-500">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#A5824C] mb-2">Did you know?</div>
            <div className="font-bold text-[#110B29] text-[17px] mb-1">{tip.emoji} {tip.title}</div>
            <p className="text-[14px] text-[#5C4A26] leading-relaxed">{tip.body}</p>
          </div>
        </div>

        {/* Topic checklist */}
        <div className="md:col-span-2 bg-surface-alt rounded-[2rem] border border-border p-6 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Topics</div>
          <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {topics.map(t => {
              const s = statuses[t.id];
              return (
                <li key={t.id} className="flex items-start gap-2.5 text-[14px]">
                  <span className="mt-0.5 shrink-0">
                    {s === 'done' && <CheckCircle2 className="w-[18px] h-[18px] text-[#34A853]" />}
                    {s === 'working' && <Loader2 className="w-[18px] h-[18px] text-accent animate-spin" />}
                    {s === 'failed' && <XCircle className="w-[18px] h-[18px] text-red-500" />}
                    {s === 'queued' && <Circle className="w-[18px] h-[18px] text-slate-300" />}
                  </span>
                  <span className={cn('leading-snug', s === 'done' ? 'text-ink font-semibold' : s === 'queued' ? 'text-slate-400' : 'text-ink')}>
                    {t.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
