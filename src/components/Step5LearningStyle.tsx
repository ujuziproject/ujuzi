import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { learnerType, formatEffect, depthEffect } from '../lib/learnerType';

interface Step5Props {
  userId: string;
  onNext: () => void;
}

type Option = { id: string; emoji: string; text: string; hint?: string };
type Question = { key: 'format' | 'depth' | 'weekly'; text: string; options: Option[] };

// Three quick questions (down from eight). Each answer changes something real:
// how notes are written, how explanations are pitched, and the weekly study goal.
const QUESTIONS: Question[] = [
  {
    key: 'format',
    text: 'A friend is explaining how the heart pumps blood. What helps you most?',
    options: [
      { id: 'visual', emoji: '🎨', text: 'Sketch it out for me' },
      { id: 'text', emoji: '📖', text: 'Walk me through it in words' },
      { id: 'balanced', emoji: '🔀', text: 'A bit of both' },
    ],
  },
  {
    key: 'depth',
    text: 'Which explanation of photosynthesis would you rather read first?',
    options: [
      { id: 'simple', emoji: '🍳', text: '“Plants cook their own food using sunlight, like a solar-powered kitchen.”' },
      { id: 'advanced', emoji: '🔬', text: '“Chlorophyll absorbs light energy to turn carbon dioxide and water into glucose and oxygen.”' },
      { id: 'balanced', emoji: '🪜', text: 'Start with the kitchen, then give me the science.' },
    ],
  },
  {
    key: 'weekly',
    text: 'How much time can you give your studies each week?',
    options: [
      { id: '120', emoji: '🐢', text: 'About 2 hours', hint: 'A steady start' },
      { id: '300', emoji: '🚶', text: 'About 5 hours', hint: 'Recommended' },
      { id: '480', emoji: '🚀', text: '8 hours or more', hint: 'Exam mode' },
    ],
  },
];

export function Step5LearningStyle({ userId, onNext }: Step5Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const q = QUESTIONS[index];

  const choose = (optionId: string) => {
    const next = { ...answers, [q.key]: optionId };
    setAnswers(next);
    setTimeout(() => {
      if (index < QUESTIONS.length - 1) setIndex(index + 1);
      else setRevealed(true);
    }, 250);
  };

  const save = async (format: string, depth: string, weekly: number) => {
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('student_profiles').update({
      content_format_preference: format,
      explanation_complexity_preference: depth,
      weekly_goal_minutes: weekly,
    }).eq('id', userId);
    if (error) {
      setError('Failed to save preferences. Please try again.');
      setSubmitting(false);
      return;
    }
    onNext();
  };

  // Smart default for students who'd rather not answer
  const useRecommended = () => save('balanced', 'simple', 300);

  if (revealed) {
    const format = answers.format || 'balanced';
    const depth = answers.depth || 'balanced';
    const weekly = Number(answers.weekly || 300);
    const type = learnerType(format, depth);
    return (
      <div className="w-full max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2">Your learner type</div>
          <div className="text-6xl mb-3" aria-hidden="true">{type.emoji}</div>
          <h2 className="text-3xl font-black text-ink font-display mb-1">{type.name}</h2>
          <p className="text-slate-500 font-medium">{type.tagline}</p>
        </div>

        <div className="bg-surface-alt border border-border rounded-[2rem] p-6 shadow-sm mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">What this changes</div>
          <ul className="space-y-3 text-[15px] text-ink">
            <li className="flex gap-3"><span aria-hidden="true">📝</span><span>{formatEffect(format)}</span></li>
            <li className="flex gap-3"><span aria-hidden="true">💡</span><span>{depthEffect(depth)}</span></li>
            <li className="flex gap-3"><span aria-hidden="true">🎯</span><span>Your weekly goal is set to <strong>{Math.round(weekly / 60)} hours</strong>. You can change it any time in Settings.</span></li>
          </ul>
        </div>

        <div className="bg-[#FFF6D9] rounded-[1.5rem] p-5 mb-8 text-[14px] text-[#5C4A26] leading-relaxed">
          <span className="font-bold text-[#110B29]">Honest fact: </span>
          research hasn’t found that matching lessons to a “learning style” improves grades on its own. We use your preferences to make studying comfortable, and pair them with what is proven to work: testing yourself and spacing out your reviews.
        </div>

        <button
          onClick={() => save(format, depth, weekly)}
          disabled={submitting}
          className="w-full bg-accent text-white py-4 rounded-full font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>That’s me — continue <ArrowRight className="w-4 h-4" /></>}
        </button>
        <button
          onClick={() => { setRevealed(false); setIndex(0); setAnswers({}); }}
          disabled={submitting}
          className="w-full mt-3 text-sm font-semibold text-slate-500 hover:text-ink flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Retake (3 questions)
        </button>
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2">Quick quiz · 3 questions</div>
        <h2 className="text-3xl font-bold text-ink mb-4 font-display">How do you like to learn?</h2>
        <div className="flex justify-center gap-2" aria-label={`Question ${index + 1} of ${QUESTIONS.length}`}>
          {QUESTIONS.map((_, i) => (
            <span key={i} className={cn('h-2 rounded-full transition-all duration-300', i < index ? 'w-8 bg-accent' : i === index ? 'w-8 bg-[#F5A623]' : 'w-2 bg-slate-200')} />
          ))}
        </div>
      </div>

      <div key={index} className="bg-surface-alt p-6 md:p-8 rounded-[2rem] border border-border shadow-sm mb-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h3 className="text-xl font-bold text-ink mb-6 text-center">{q.text}</h3>
        <div className="space-y-3">
          {q.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={cn(
                'w-full p-4 rounded-2xl border text-left font-semibold transition-all flex items-center gap-4',
                answers[q.key] === opt.id
                  ? 'bg-accent/10 border-accent/50 text-accent ring-2 ring-accent/20'
                  : 'bg-surface border-border text-ink hover:border-accent hover:-translate-y-0.5 hover:shadow-sm'
              )}
            >
              <span className="text-2xl shrink-0" aria-hidden="true">{opt.emoji}</span>
              <span className="flex-1">{opt.text}</span>
              {opt.hint && <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">{opt.hint}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0 || submitting}
          className="text-sm font-semibold text-slate-500 hover:text-ink disabled:opacity-0 transition-colors"
        >
          ← Previous
        </button>
        <button onClick={useRecommended} disabled={submitting} className="text-sm font-semibold text-slate-500 hover:text-accent underline underline-offset-4 disabled:opacity-50">
          Skip — use recommended settings
        </button>
      </div>
      {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
    </div>
  );
}
