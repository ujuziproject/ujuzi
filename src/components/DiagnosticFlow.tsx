import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Topic } from '../types';
import { Loader2, Play, SkipForward, CheckCircle2 } from 'lucide-react';

interface DiagnosticFlowProps {
  userId: string;
  topics: Topic[];
  onComplete: (topicsWithDepth: Topic[]) => void;
}

export function DiagnosticFlow({ userId, topics, onComplete }: DiagnosticFlowProps) {
  const [step, setStep] = useState<'prompt' | 'quiz' | 'scoring'>('prompt');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const handleSkip = async () => {
    setLoading(true);
    setProgressMsg('Saving standard depth for all topics...');
    
    const updatedTopics = topics.map(t => ({ ...t, generation_depth: 'standard' as any }));
    
    // Update all topics to standard
    for (const t of topics) {
      await supabase.from('topics').update({ generation_depth: 'standard' }).eq('id', t.id);
    }
    
    setLoading(false);
    onComplete(updatedTopics);
  };

  const startDiagnostic = async () => {
    setLoading(true);
    setProgressMsg('Generating diagnostic questions...');
    try {
      const res = await fetch('/api/generate-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: topics.map(t => ({ id: t.id, title: t.title, description: t.description }))
        })
      });
      if (!res.ok) throw new Error('Failed to generate diagnostic');
      const { result } = await res.json();
      setQuestions(result);
      setStep('quiz');
    } catch (err) {
      console.error(err);
      // Fallback to skip
      handleSkip();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQIndex]: option });
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishDiagnostic({ ...answers, [currentQIndex]: option });
    }
  };

  const finishDiagnostic = async (finalAnswers: Record<number, string>) => {
    setStep('scoring');
    setLoading(true);
    setProgressMsg('Scoring your diagnostic...');
    
    // Calculate score per topic
    const topicScores: Record<string, { correct: number, total: number }> = {};
    topics.forEach(t => topicScores[t.id] = { correct: 0, total: 0 });
    
    questions.forEach((q, idx) => {
      const isCorrect = finalAnswers[idx] === q.correct_answer;
      if (topicScores[q.topic_id]) {
        topicScores[q.topic_id].total++;
        if (isCorrect) topicScores[q.topic_id].correct++;
      }
    });

    const updatedTopics = [...topics];

    for (let i = 0; i < updatedTopics.length; i++) {
      const t = updatedTopics[i];
      const stats = topicScores[t.id];
      let score = 0;
      if (stats && stats.total > 0) {
        score = Math.round((stats.correct / stats.total) * 100);
      }
      
      let depth: 'light' | 'standard' | 'deep' = 'standard';
      if (score >= 80) depth = 'light';
      else if (score < 40) depth = 'deep';
      
      updatedTopics[i].diagnostic_score = score;
      updatedTopics[i].generation_depth = depth;

      await supabase.from('topics').update({
        diagnostic_score: score,
        diagnostic_completed_at: new Date().toISOString(),
        generation_depth: depth
      }).eq('id', t.id);
    }
    
    setLoading(false);
    onComplete(updatedTopics);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
        <h3 className="text-lg font-semibold text-ink mb-2">Please wait</h3>
        <p className="text-slate-500 text-sm max-w-sm">{progressMsg}</p>
      </div>
    );
  }

  if (step === 'prompt') {
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-3 font-display">Diagnostic Pre-Test</h2>
        <p className="text-slate-500 mb-8">
          Want a quick 5-minute check to see what you already know? This helps us focus your study materials where you actually need them.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={startDiagnostic} className="w-full bg-accent text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Take the diagnostic
          </button>
          <button onClick={handleSkip} className="w-full bg-surface text-slate-500 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-border">
            <SkipForward className="w-5 h-5" /> Skip, generate everything at standard depth
          </button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQIndex];
    if (!q) return null;
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
           <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Question {currentQIndex + 1} of {questions.length}</span>
           <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-semibold">Diagnostic</span>
        </div>
        <h3 className="text-xl font-bold text-ink mb-8 leading-relaxed">{q.question_text}</h3>
        <div className="flex flex-col gap-3">
          {q.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleAnswer(opt)}
              className="p-4 text-left border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-ink font-medium"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
