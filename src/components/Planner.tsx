import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Circle, Plus, ListTodo } from 'lucide-react';
import { PlannerItem } from '../types';
import { localDateStr, parseLocalDate, daysUntil, weeksFromToday } from '../lib/dates';

export function Planner({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [showAdd, setShowAdd] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  
  const [track, setTrack] = useState<string>('');
  const [needsDatePrompt, setNeedsDatePrompt] = useState<{ type: string, id: string } | null>(null);
  const [targetDateInput, setTargetDateInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [topicsLeft, setTopicsLeft] = useState(0);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    checkPacingStatus();
  }, [userId]);

  const checkPacingStatus = async () => {
    const { data: profile } = await supabase.from('student_profiles').select('track, exam_date, exam_year').eq('id', userId).maybeSingle();
    if (!profile) return;
    const t = profile.track || 'secondary';
    setTrack(t);

    // Work out the target date, or ask for one if it's missing
    let target: Date | null = null;
    let prompt: { type: string, id: string } | null = null;
    if (t === 'university') {
      const { data: sems } = await supabase.from('semesters').select('id, target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).order('semester_number', { ascending: false }).limit(1);
      if (sems && sems.length > 0) {
        if (sems[0].target_end_date) target = parseLocalDate(sems[0].target_end_date);
        else prompt = { type: 'semester', id: sems[0].id };
      }
    } else if (t === 'independent') {
      const { data: goals } = await supabase.from('learning_goals').select('id, target_date').eq('student_id', userId).order('created_at', { ascending: false }).limit(1);
      if (goals && goals.length > 0) {
        if (goals[0].target_date) target = parseLocalDate(goals[0].target_date);
        else prompt = { type: 'goal', id: goals[0].id };
      }
    } else {
      if (profile.exam_date) target = parseLocalDate(profile.exam_date);
      else if (profile.exam_year) target = new Date(profile.exam_year, 5, 30);
    }

    if (prompt) {
      // Smart default: a typical semester has ~14 weeks left mid-way; a goal ~8 weeks
      setTargetDateInput(weeksFromToday(prompt.type === 'semester' ? 14 : 8));
      setNeedsDatePrompt(prompt);
      setLoading(false);
      return;
    }

    // First visit with a target date: build the plan once
    if (target) {
      const { count: existing } = await supabase.from('planner_items').select('id', { count: 'exact', head: true }).eq('student_id', userId);
      if (!existing) {
        const { adjustStudyPlan } = await import('../lib/pacing');
        const res = await adjustStudyPlan(userId, t);
        if (res && 'error' in res && res.error) setPlanError(res.error);
      }
      setDaysLeft(daysUntil(target));
      const { count: left } = await supabase.from('planner_items').select('id', { count: 'exact', head: true }).eq('student_id', userId).eq('completed', false).eq('item_type', 'notes');
      setTopicsLeft(left || 0);
    }

    fetchData();
  };


  useEffect(() => {
    if (!needsDatePrompt) fetchData();
  }, [currentDate, view, needsDatePrompt]);

  const fetchData = async () => {
    setLoading(true);
    
    // Determine date range based on view
    const start = new Date(currentDate);
    if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
    } else {
      start.setDate(1);
    }
    
    const end = new Date(start);
    if (view === 'week') {
      end.setDate(start.getDate() + 6);
    } else {
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
    }
    
    const startStr = localDateStr(start);
    const endStr = localDateStr(end);

    const { data } = await supabase
      .from('planner_items')
      .select('*')
      .eq('student_id', userId)
      .gte('scheduled_date', startStr)
      .lte('scheduled_date', endStr)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (data) setItems(data);
    
    setLoading(false);
  };

  const handleToggleComplete = async (item: PlannerItem) => {
    const newVal = !item.completed;
    const { error } = await supabase
      .from('planner_items')
      .update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null })
      .eq('id', item.id);
      
    if (!error) {
      setItems(items.map(i => i.id === item.id ? { ...i, completed: newVal } : i));
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    const dateStr = localDateStr(currentDate);
    const newItem = {
      student_id: userId,
      item_type: 'notes',
      title: newItemTitle,
      scheduled_date: dateStr,
      completed: false
    };
    
    const { data, error } = await supabase.from('planner_items').insert(newItem).select().single();
    if (!error && data) {
      setItems([...items, data]);
      setNewItemTitle('');
      setShowAdd(false);
    }
  };
  
  const generateWeekDays = () => {
    const days = [];
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const firstDay = new Date(curr.setDate(first));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  };
  
  const nextRange = () => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prevRange = () => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const weekDays = generateWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDateInput || !needsDatePrompt) return;
    
    setIsGenerating(true);
    if (needsDatePrompt.type === 'semester') {
      await supabase.from('semesters').update({ target_end_date: targetDateInput }).eq('id', needsDatePrompt.id);
    } else {
      await supabase.from('learning_goals').update({ target_date: targetDateInput }).eq('id', needsDatePrompt.id);
    }
    
    const { adjustStudyPlan } = await import('../lib/pacing');
    const res = await adjustStudyPlan(userId, track);
    if (res && 'error' in res && res.error) setPlanError(res.error);
    
    setNeedsDatePrompt(null);
    setIsGenerating(false);
    checkPacingStatus();
  };

  if (needsDatePrompt) {
    return (
      <div className="w-full max-w-lg mx-auto py-12 animate-in fade-in">
        <div className="bg-surface-alt border border-border p-8 rounded-3xl text-center">
           <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-accent" />
           </div>
           <h2 className="text-2xl font-bold text-ink mb-3 font-display">When is your target date?</h2>
           <p className="text-slate-500 mb-8 text-[15px]">To build your study plan, we need to know when your {needsDatePrompt.type === 'semester' ? 'semester ends' : 'goal needs to be met'}. We've suggested a date — adjust it if yours is different.</p>
           
           <form onSubmit={handleSaveDate} className="space-y-4">
              <input 
                type="date" 
                required
                value={targetDateInput}
                onChange={e => setTargetDateInput(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent text-center font-bold"
              />
              <button disabled={isGenerating || !targetDateInput} type="submit" className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50">
                {isGenerating ? 'Building your plan...' : 'Generate Plan'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-1.5 text-ink">Study Planner</h1>
          <p className="text-[14px] text-ink/60">{(daysLeft !== null && daysLeft > 0) ? `${daysLeft} days left — ${topicsLeft} topics still to cover before your target date.` : 'Schedule your study sessions and stay on track'}</p>
          {planError && <p className="text-[13px] text-amber-700 mt-2">{planError}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-surface-alt rounded-full p-1 border border-border flex mr-2">
            <button 
              onClick={() => setView('week')} 
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${view === 'week' ? 'bg-white shadow-sm text-ink' : 'text-slate-500 hover:text-ink'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setView('month')} 
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${view === 'month' ? 'bg-white shadow-sm text-ink' : 'text-slate-500 hover:text-ink'}`}
            >
              Month
            </button>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-accent text-white px-4 py-2 rounded-full font-bold text-[13px] hover:bg-accent/90 transition-colors flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>
      
      {showAdd && (
        <form onSubmit={handleAddItem} className="bg-surface-alt border border-border p-5 rounded-2xl mb-6 flex gap-3 items-center">
           <input 
             type="text" 
             autoFocus
             placeholder="What do you need to study?" 
             className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-[14px]"
             value={newItemTitle}
             onChange={e => setNewItemTitle(e.target.value)}
           />
           <button type="submit" disabled={!newItemTitle.trim()} className="bg-ink text-white px-5 py-2.5 rounded-xl font-bold text-[14px] disabled:opacity-50 transition-colors">
             Save
           </button>
        </form>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
           </h2>
           <div className="flex items-center gap-2">
             <button onClick={prevRange} className="p-2 bg-surface-alt hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
             <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 font-semibold text-[13px] bg-surface-alt hover:bg-slate-100 rounded-full transition-colors text-ink">Today</button>
             <button onClick={nextRange} className="p-2 bg-surface-alt hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
           </div>
        </div>

        {view === 'week' && (
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((d, i) => (
              <div key={i} className="text-center font-bold text-[12px] text-slate-400 uppercase tracking-wider">{dayNames[i]}</div>
            ))}
            {weekDays.map((d, i) => {
              const dayItems = items.filter(item => item.scheduled_date === localDateStr(d));
              const active = isToday(d);
              return (
                <div 
                  key={i} 
                  onClick={() => setCurrentDate(d)}
                  className={`min-h-[120px] p-2 md:p-3 border rounded-2xl cursor-pointer transition-colors ${active ? 'border-accent bg-accent/5' : 'border-slate-100 bg-surface-alt/30 hover:border-slate-200'}`}
                >
                  <div className={`text-[15px] font-bold text-center mb-3 ${active ? 'text-accent' : 'text-ink/60'}`}>{d.getDate()}</div>
                  <div className="flex flex-col gap-1.5">
                    {dayItems.map(item => (
                      <div key={item.id} className={`text-[11px] font-semibold px-2 py-1.5 rounded-md truncate ${item.completed ? 'bg-[#E2F7EB] text-[#2E7D32] line-through' : 'bg-white border border-slate-100 text-ink shadow-sm'}`}>
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface-alt rounded-3xl p-6 md:p-8 border border-border">
        <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-accent" />
          Agenda for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-16 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.filter(item => item.scheduled_date === localDateStr(currentDate)).length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-slate-500 font-medium">No tasks scheduled for this day</div>
                <button onClick={() => setShowAdd(true)} className="text-accent font-bold text-[13px] hover:underline mt-2">Add a task</button>
              </div>
            ) : (
              items.filter(item => item.scheduled_date === localDateStr(currentDate)).map(item => (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${item.completed ? 'bg-surface opacity-60' : 'bg-white shadow-sm border border-slate-100'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggleComplete(item)} className={`hover:scale-110 transition-transform ${item.completed ? 'text-[#34D399]' : 'text-slate-300 hover:text-accent'}`}>
                      {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div>
                      <h4 className={`font-bold text-[15px] ${item.completed ? 'line-through text-slate-500' : 'text-ink'}`}>{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full capitalize">{item.item_type}</span>
                        {item.scheduled_time && <span className="text-[12px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.scheduled_time}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
