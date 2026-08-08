#!/bin/bash
cat << 'INNER_EOF' > src/components/MainApp.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Dashboard } from './Dashboard';
import { MyCurricula } from './MyCurricula';
import { Progress } from './Progress';
import { Profile } from './Profile';
import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

interface MainAppProps {
  name: string;
  userId: string;
  onLogout: () => void;
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all w-full text-left font-display",
        active 
          ? "bg-accent-warm border border-ink text-ink shadow-[2px_2px_0px_#111]" 
          : "text-slate-500 hover:text-ink hover:bg-surface border border-transparent"
      )}
    >
      <span className={active ? "text-ink" : "text-slate-400"}>{icon}</span>
      {label}
    </button>
  );
}

export function MainApp({ name, userId, onLogout }: MainAppProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'curricula' | 'progress' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
  const [learnerBadge, setLearnerBadge] = useState('Fresh Start');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: streaks } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
      const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: flashcardCount } = await supabase.from('flashcard_reviews').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: interestCount } = await supabase.from('student_interests').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: currCount } = await supabase.from('curricula').select('*', { count: 'exact', head: true }).eq('student_id', userId);

      const streakDays = streaks?.current_streak || 0;
      const quizzes = quizCount || 0;
      const flashcards = flashcardCount || 0;
      const interests = interestCount || 0;
      const curricula = currCount || 0;

      if (streakDays >= 3) {
        setAiInsight(`You're on a ${streakDays}-day streak! Keep up the great work.`);
      } else if (quizzes > 0) {
        setAiInsight(`You've taken ${quizzes} quizzes. Review your weakest topics to boost your scores.`);
      } else if (flashcards > 0) {
        setAiInsight(`You've reviewed ${flashcards} flashcards. Staying on top of your spaced repetition is key!`);
      } else if (curricula > 0) {
        setAiInsight(`You have ${curricula} curriculum uploaded. Dive in and start generating materials to build your knowledge!`);
      } else {
        setAiInsight('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
      }

      if (streakDays >= 3) {
        setLearnerBadge('Consistency Champion');
      } else if (interests >= 5) {
        setLearnerBadge('Curious Explorer');
      } else if (flashcards > quizzes * 2 && flashcards > 0) {
        setLearnerBadge('Diligent Reviewer');
      } else if (quizzes > 2) {
        setLearnerBadge('Quick Thinker');
      } else {
        setLearnerBadge('Fresh Start');
      }

      setLoading(false);
    }
    loadData();
  }, [userId]);

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-ink">
      {/* Top Navbar Container */}
      <div className="p-4 md:p-6 pb-0 max-w-[1400px] mx-auto w-full">
        <div className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-sm border border-border">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-accent font-black text-3xl tracking-tighter leading-none italic">uJ</div>
            <span className="font-black text-2xl tracking-tight leading-none text-ink font-display">uJuzi</span>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-ink font-display">
            <button className="flex items-center gap-1 hover:text-accent transition-colors">Invest <ChevronRight className="w-4 h-4" /></button>
            <button className="hover:text-accent transition-colors">Learn</button>
            <button className="hover:text-accent transition-colors">Community</button>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden md:block text-ink hover:text-accent transition-colors"><Moon className="w-5 h-5" /></button>
            <div className="hidden md:flex items-center gap-3 bg-accent-warm px-4 py-1.5 rounded-full border border-ink shadow-[2px_2px_0px_#111]">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase text-ink leading-tight">{name}</span>
                <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{learnerBadge}</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg font-display shrink-0 border-2 border-white shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <button onClick={onLogout} className="text-ink hover:text-accent transition-colors md:ml-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1400px] mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Sidebar */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-border min-h-[500px] flex flex-col h-full sticky top-6">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 px-2 font-display">My Learning</h3>
            
            <nav className="flex flex-col gap-3">
              <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-5 h-5" />} label="Overview" onClick={() => setCurrentView('dashboard')} />
              <SidebarItem active={currentView === 'curricula'} icon={<Folder className="w-5 h-5" />} label="Curricula" onClick={() => setCurrentView('curricula')} />
              <SidebarItem active={currentView === 'progress'} icon={<TrendingUp className="w-5 h-5" />} label="Progress" onClick={() => setCurrentView('progress')} />
              <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => setCurrentView('profile')} />
            </nav>

            <div className="mt-auto pt-8">
              <div className="bg-surface rounded-2xl p-5 border border-border text-center md:text-left">
                <p className="text-sm font-semibold text-slate-500 mb-3">Need help with your portfolio?</p>
                <button className="text-accent font-bold text-sm hover:underline">Talk to an Advisor</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 pb-20">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} />}
          {currentView === 'curricula' && <MyCurricula userId={userId} />}
          {currentView === 'progress' && <Progress userId={userId} />}
          {currentView === 'profile' && <Profile userId={userId} />}
        </div>
      </div>
    </div>
  );
}
INNER_EOF
