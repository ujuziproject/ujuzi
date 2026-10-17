#!/bin/bash
cat << 'INNER_EOF' > src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CurriculumUpload } from './CurriculumUpload';
import { CurriculumResults } from './CurriculumResults';
import { Curriculum, Topic } from '../types';
import { Loader2, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder } from 'lucide-react';

interface DashboardProps {
  name: string;
  userId: string;
}

export function Dashboard({ name, userId }: DashboardProps) {
  const [view, setView] = useState<'loading' | 'home' | 'upload' | 'curriculum'>('loading');
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [initialTopicId, setInitialTopicId] = useState<string | undefined>(undefined);
  
  // Stats
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchDashboardData = async () => {
    setView('loading');
    
    // 1. Fetch curricula
    const { data: currs } = await supabase.from('curricula').select('id, title, status').eq('student_id', userId).order('created_at', { ascending: false });
    const currsList = currs || [];

    // Fetch topics count and progress for each
    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
      const { data: curriculumTopics } = await supabase.from('topics').select('id').eq('curriculum_id', c.id);
      const topics = curriculumTopics || [];
      const topicCount = topics.length;
      let progress = 0;

      if (topicCount > 0) {
        const topicIds = topics.map(t => t.id);
        const { count: attemptedQuizzesCount } = await supabase
          .from('quiz_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', userId)
          .in('quiz_id', (await supabase.from('quizzes').select('id').in('topic_id', topicIds)).data?.map(q => q.id) || []);
        progress = attemptedQuizzesCount ? Math.min(Math.round((attemptedQuizzesCount / topicCount) * 100), 100) : 0;
      }
      return { ...c, topic_count: topicCount, progress };
    }));

    setCurricula(enrichedCurricula as any);

    // Total topics
    const totalT = enrichedCurricula.reduce((sum, c) => sum + c.topic_count, 0);
    setTotalTopics(totalT);

    // Quizzes taken
    const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
    setTotalQuizzes(quizCount || 0);

    // Streak
    const { data: streakData } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
    setStreak(streakData?.current_streak || 0);

    if (currsList.length === 0) {
      setView('upload');
    } else {
      setView('home');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const openCurriculum = (curriculumId: string, topicId?: string) => {
    setSelectedCurriculumId(curriculumId);
    setInitialTopicId(topicId);
    setView('curriculum');
  };

  if (view === 'loading') {
    return <div className="py-20 flex justify-center w-full"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (view === 'upload') {
    return (
      <div className="w-full">
        {curricula.length > 0 && (
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">Upload Curriculum</h1>
          <p className="text-slate-500">Add a new subject or syllabus to generate study materials.</p>
        </div>
        <CurriculumUpload userId={userId} onUploadComplete={fetchDashboardData} />
      </div>
    );
  }

  if (view === 'curriculum' && selectedCurriculumId) {
    return (
      <div className="w-full">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
        <CurriculumResults curriculumId={selectedCurriculumId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }

  const firstName = name.split(' ')[0].toUpperCase();

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-[2.75rem] font-black uppercase tracking-tight text-ink font-display leading-[1.1]">
            WELCOME BACK, <span className="text-accent">{firstName}!</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's how your learning portfolio is performing today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button className="px-5 py-3 rounded-full border border-border text-sm font-bold bg-white text-ink hover:bg-surface flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Statement
          </button>
          <button 
            onClick={() => setView('upload')}
            className="px-6 py-3 rounded-full bg-ink text-white text-sm font-bold hover:bg-ink/90 flex items-center gap-2 transition-colors"
          >
            + Invest Now
          </button>
        </div>
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Black Card */}
        <div className="col-span-1 lg:col-span-2 bg-ink rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest font-display">Total Topics</span>
              <span className="bg-[#1A3B2B] text-success text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">+ {curricula.length > 0 ? '100' : '0.0'}% ALL TIME</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-6xl md:text-8xl font-black tracking-tighter font-display leading-none">{totalTopics}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-12 relative z-10">
            <div className="bg-[#1A1A1A] border border-[#222] rounded-2xl p-5 min-w-[150px] flex-1 md:flex-none">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 font-display">Quizzes Taken</span>
              <span className="text-2xl font-black font-display text-success">+ {totalQuizzes}</span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#222] rounded-2xl p-5 min-w-[150px] flex-1 md:flex-none">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 font-display">Day Streak</span>
              <span className="text-2xl font-black font-display text-white">{streak}</span>
            </div>
          </div>
        </div>

        {/* Allocation Card */}
        <div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 block font-display">Asset Allocation</span>
          <div className="flex gap-2 h-[4.5rem] mb-8 w-full">
            <div className="bg-[#FFF0F4] rounded-xl flex-1"></div>
            <div className="bg-[#EEF4D4] rounded-xl flex-1"></div>
          </div>
          <div className="space-y-5 flex-1">
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#FFE4EC]"></div> Halal Equity</div>
              <span className="text-slate-600 font-medium">50%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#EEF4D4]"></div> FIF (Fixed Income)</div>
              <span className="text-slate-600 font-medium">50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* MY CURRICULA Section */}
      <div className="mb-12">
        <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Funds</h2>

        {curricula.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {curricula.map(c => (
              <button
                key={c.id}
                onClick={() => openCurriculum(c.id)}
                className="flex flex-col text-left p-6 bg-white rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
              >
                <h3 className="text-lg font-bold text-ink mb-1 font-display">{c.title}</h3>
                <div className="flex items-center justify-between w-full mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-mono">{c.topic_count} Topics</span>
                  </div>
                  <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${c.progress}%` }}></div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px]">
            <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center mb-6">
              <Folder className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Active Funds</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md">You don't have any active investments yet. Add funds to start growing your wealth.</p>
            <button 
              onClick={() => setView('upload')}
              className="bg-ink text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-ink/90 transition-colors"
            >
              + Add Funds
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
INNER_EOF
