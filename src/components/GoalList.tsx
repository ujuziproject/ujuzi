import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LearningGoal } from '../types';
import { Target, Plus, ArrowLeft, BookOpen } from 'lucide-react';

export function GoalList({ userId, onOpenGoal }: { userId: string, onOpenGoal: (goalId: string) => void }) {
  const [goals, setGoals] = useState<(LearningGoal & { course_count: number })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    const { data: gs } = await supabase.from('learning_goals').select('*').eq('student_id', userId).order('created_at', { ascending: false });
    const gList = gs || [];
    
    const enriched = await Promise.all(gList.map(async (g) => {
      const { count } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('goal_id', g.id);
      return { ...g, course_count: count || 0 };
    }));
    
    setGoals(enriched);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from('learning_goals').insert({
      student_id: userId,
      goal_title: title.trim(),
      category: category.trim() || null,
      target_date: targetDate || null
    }).select().single();
    
    if (data) {
      setIsCreating(false);
      setTitle('');
      setCategory('');
      setTargetDate('');
      fetchGoals();
    }
  };

  if (isCreating) {
    return (
      <div className="w-full">
        <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-surface-alt p-8 rounded-[2rem] border border-border max-w-md">
          <h2 className="text-xl font-bold text-ink mb-6 font-display">Create Goal</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Goal Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                placeholder="e.g. PMP Certification"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Category (Optional)</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              >
                <option value="">Select Category...</option>
                <option value="Certification">Certification</option>
                <option value="Career Exam">Career Exam</option>
                <option value="Skill">Skill</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Target Date (Optional)</label>
              <input 
                type="date" 
                value={targetDate} 
                onChange={e => setTargetDate(e.target.value)} 
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              />
            </div>
          </div>
          <button onClick={handleCreate} disabled={!title.trim()} className="w-full bg-ink text-white px-6 py-4 rounded-full font-bold hover:bg-ink/90 transition-colors shadow-sm disabled:opacity-50">
            Create Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display">My Goals</h2>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-surface-alt border border-border text-ink hover:border-accent hover:text-accent px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => onOpenGoal(g.id)}
              className="flex flex-col text-left p-6 bg-surface-alt rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start w-full mb-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{g.category || 'Goal'}</span>
                {g.target_date && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                    By {new Date(g.target_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-ink mb-1 font-display">{g.goal_title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-4">
                <BookOpen className="w-4 h-4" />
                <span className="font-mono">{g.course_count} Courses</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Goals</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md">You haven't added any learning goals yet. Create one to organize your materials.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-ink text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-ink/90 transition-colors"
          >
            + Create Goal
          </button>
        </div>
      )}
    </div>
  );
}
