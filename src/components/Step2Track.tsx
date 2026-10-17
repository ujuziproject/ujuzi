import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Track } from '../types';

interface Step2Props {
  onNext: (track: Track) => void;
}

const PATHS: { track: Track; emoji: string; title: string; who: string; unlocks: string; tint: string }[] = [
  {
    track: 'secondary',
    emoji: '🎒',
    title: 'Exam Ace',
    who: 'Secondary school — preparing for WAEC, NECO or JAMB',
    unlocks: 'Questions written in your exam board’s style',
    tint: 'bg-[#FFF6D9]',
  },
  {
    track: 'university',
    emoji: '🎓',
    title: 'Campus Scholar',
    who: 'University student — courses and semesters',
    unlocks: 'Your course outlines turned into study packs',
    tint: 'bg-[#EAE4FF]',
  },
  {
    track: 'independent',
    emoji: '🧭',
    title: 'Self-Starter',
    who: 'Learning on my own — a certification, exam or new skill',
    unlocks: 'A plan paced to your own target date',
    tint: 'bg-[#E2F7EB]',
  },
];

export function Step2Track({ onNext }: Step2Props) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2">Quest 2 · Choose your path</div>
        <h2 className="text-3xl font-black tracking-tight text-ink mb-2 font-display">What kind of learner are you?</h2>
        <p className="text-slate-500">Pick one. You can still add semesters or goals later.</p>
      </div>

      <div className="space-y-4">
        {PATHS.map(p => (
          <button
            key={p.track}
            onClick={() => onNext(p.track)}
            className="w-full flex items-center gap-4 p-5 border border-border rounded-[1.5rem] bg-surface-alt hover:border-accent hover:-translate-y-0.5 hover:shadow-md transition-all group text-left"
          >
            <div className={`w-14 h-14 rounded-2xl ${p.tint} flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform`} aria-hidden="true">
              {p.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-ink text-lg font-display">{p.title}</h3>
              <p className="text-sm text-slate-500">{p.who}</p>
              <p className="text-[12px] font-bold text-accent mt-1.5">🔓 Unlocks: {p.unlocks}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
