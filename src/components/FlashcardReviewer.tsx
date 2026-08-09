import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Flashcard, FlashcardReview } from '../types';
import { recordActivity } from '../lib/activity';
import { cn } from '../lib/utils';
import { Check, X } from 'lucide-react';

interface FlashcardReviewerProps {
  userId: string;
  flashcards: Flashcard[];
}

export function FlashcardReviewer({ userId, flashcards }: FlashcardReviewerProps) {
  const [internalCards, setInternalCards] = useState<Flashcard[]>(flashcards);
  
  useEffect(() => {
    if (flashcards.length === 0) {
      // fetch all flashcards for this user
      async function fetchUserFlashcards() {
        // Need to get all topics for this user's curricula/courses
        const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
        const track = profile?.track || 'secondary';
        
        let allTopicIds = [];
        if (track === 'university') {
            const { data: sems } = await supabase.from('semesters').select('id').eq('student_id', userId);
            if (sems && sems.length > 0) {
                const { data: cs } = await supabase.from('courses').select('id').in('semester_id', sems.map(s => s.id));
                if (cs && cs.length > 0) {
                    const { data: ts } = await supabase.from('topics').select('id').in('course_id', cs.map(c => c.id));
                    if (ts) allTopicIds = ts.map(t => t.id);
                }
            }
        } else if (track === 'independent') {
            const { data: goals } = await supabase.from('learning_goals').select('id').eq('student_id', userId);
            if (goals && goals.length > 0) {
                const { data: cs } = await supabase.from('courses').select('id').in('goal_id', goals.map(g => g.id));
                if (cs && cs.length > 0) {
                    const { data: ts } = await supabase.from('topics').select('id').in('course_id', cs.map(c => c.id));
                    if (ts) allTopicIds = ts.map(t => t.id);
                }
            }
        } else {
            const { data: currs } = await supabase.from('curricula').select('id').eq('student_id', userId);
            if (currs && currs.length > 0) {
                const { data: ts } = await supabase.from('topics').select('id').in('curriculum_id', currs.map(c => c.id));
                if (ts) allTopicIds = ts.map(t => t.id);
            }
        }
        
        if (allTopicIds.length > 0) {
            const { data: fcs } = await supabase.from('flashcards').select('*').in('topic_id', allTopicIds);
            if (fcs) setInternalCards(fcs);
        }
      }
      fetchUserFlashcards();
    }
  }, [userId, flashcards]);
  const [reviews, setReviews] = useState<Record<string, FlashcardReview>>({});
  const [loading, setLoading] = useState(true);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('flashcard_reviews')
        .select('*')
        .eq('student_id', userId);

      const reviewMap: Record<string, FlashcardReview> = {};
      if (data) {
        data.forEach(r => {
          reviewMap[r.flashcard_id] = r;
        });
      }
      setReviews(reviewMap);

      const today = new Date().toISOString().split('T')[0];
      const due = internalCards.filter(fc => {
        const review = reviewMap[fc.id];
        if (!review) return true; // never reviewed
        return review.next_review_date <= today;
      });

      setDueCards(due);
      setLoading(false);
    }
    fetchReviews();
  }, [userId, internalCards]);

  const handleRate = async (rating: 'got_it' | 'still_learning') => {
    const fc = dueCards[currentIndex];
    const existing = reviews[fc.id];

    let easeFactor = existing ? existing.ease_factor : 2.5;
    let intervalDays = existing ? existing.interval_days : 1;

    if (rating === 'got_it') {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
      easeFactor = Math.min(2.5, easeFactor + 0.1);
    } else {
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const nextReviewDate = nextDate.toISOString().split('T')[0];

    const newReview = {
      student_id: userId,
      flashcard_id: fc.id,
      ease_factor: easeFactor,
      interval_days: intervalDays,
      next_review_date: nextReviewDate,
      last_reviewed_at: new Date().toISOString()
    };

    try {
      if (existing) {
        await supabase.from('flashcard_reviews').update({
          ease_factor: easeFactor,
          interval_days: intervalDays,
          next_review_date: nextReviewDate,
          last_reviewed_at: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await supabase.from('flashcard_reviews').insert(newReview);
      }

      await recordActivity(userId, 'flashcard_reviewed', { flashcardId: fc.id, rating });
    } catch (err) {
      console.error('Failed to save flashcard review:', err);
    }

    setFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading cards...</div>;
  }

  if (dueCards.length === 0 || currentIndex >= dueCards.length) {
    return (
      <div className="text-center py-16 bg-surface rounded-2xl border border-border">
        <h3 className="text-2xl font-bold text-ink mb-2">You're all caught up!</h3>
        <p className="text-slate-500">No more cards due for review today in this topic.</p>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="mb-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Card {currentIndex + 1} of {dueCards.length}
      </div>

      <div 
        onClick={() => !flipped && setFlipped(true)}
        className={cn(
          "relative w-full h-80 cursor-pointer group perspective-1000 mb-8 transition-transform",
          !flipped && "hover:scale-[1.02]"
        )}
      >
        <div className={cn("w-full h-full transition-all duration-500 preserve-3d relative", flipped && "rotate-y-180")}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden w-full h-full bg-surface-alt border-2 border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-xl md:text-2xl font-bold text-ink mb-6">{currentCard.question}</p>
            {!flipped && (
              <p className="text-sm text-slate-400 font-medium animate-pulse mt-auto">Tap to reveal answer</p>
            )}
          </div>
          {/* Back */}
          <div className="absolute inset-0 backface-hidden w-full h-full bg-accent rounded-3xl p-8 flex items-center justify-center text-center shadow-lg rotate-y-180">
            <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentCard.answer}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={() => handleRate('still_learning')}
            className="flex-1 bg-surface-alt border-2 border-border hover:border-red-400 hover:bg-red-50 text-ink/80 font-bold py-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
          >
            <X className="w-6 h-6 text-red-500 mb-1" />
            Still Learning
          </button>
          <button
            onClick={() => handleRate('got_it')}
            className="flex-1 bg-surface-alt border-2 border-border hover:border-green-400 hover:bg-green-50 text-ink/80 font-bold py-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
          >
            <Check className="w-6 h-6 text-green-500 mb-1" />
            Got It
          </button>
        </div>
      )}
    </div>
  );
}
