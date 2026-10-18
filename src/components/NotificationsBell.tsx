import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, Flame, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigationStore } from './MainApp';
import { openTopic } from '../lib/navigation';
import { localDateStr } from '../lib/dates';

// Real reminders only: today's and overdue planner tasks, and a streak at risk.
// The dot only shows when there is something to act on.
export function NotificationsBell({ userId, streakAtRisk, streakDays }: { userId: string; streakAtRisk: boolean; streakDays: number }) {
  const nav = useNavigationStore();
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<any[]>([]);
  const [overdue, setOverdue] = useState(0);

  const load = async () => {
    const todayStr = localDateStr();
    const [dueRes, overdueRes] = await Promise.all([
      supabase.from('planner_items').select('id, title, item_type, topic_id, completed').eq('student_id', userId).eq('scheduled_date', todayStr).eq('completed', false).order('created_at').limit(10),
      supabase.from('planner_items').select('id', { count: 'exact', head: true }).eq('student_id', userId).lt('scheduled_date', todayStr).eq('completed', false),
    ]);
    setToday(dueRes.data || []);
    setOverdue(overdueRes.count || 0);
  };

  // Close on outside click or Escape (an overlay can't cover the sidebar, which sits above the header)
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => { load(); }, [userId]);
  useEffect(() => { if (open) load(); }, [open]);

  const openTask = async (item: any) => {
    if (!item.topic_id) { nav.setCurrentView('planner'); setOpen(false); return; }
    const { data: topic } = await supabase.from('topics').select('id, course_id, curriculum_id').eq('id', item.topic_id).maybeSingle();
    if (topic) openTopic(nav, topic);
    setOpen(false);
  };

  const count = today.length + (overdue > 0 ? 1 : 0) + (streakAtRisk ? 1 : 0);

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={count ? `${count} reminders` : 'No reminders'}
        className="w-[44px] h-[44px] rounded-full bg-[#F8F9FA] border border-slate-100 flex items-center justify-center text-slate-500 relative cursor-pointer hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && <span className="absolute top-[10px] right-[10px] w-2.5 h-2.5 bg-[#F5A623] rounded-full border-2 border-white" />}
      </button>

      {open && (
        <>
          <div className="absolute right-0 mt-2 w-[min(340px,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in">
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-ink text-[15px]">Reminders</div>
            <div className="max-h-[60vh] overflow-y-auto py-1">
              {streakAtRisk && (
                <div className="flex gap-3 px-4 py-3 bg-[#FFF6D9]">
                  <Flame className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                  <div className="text-[13.5px] text-ink"><strong>Your {streakDays}-day streak ends tonight.</strong> Study anything today to keep it.</div>
                </div>
              )}
              {overdue > 0 && (
                <button onClick={() => { nav.setCurrentView('planner'); setOpen(false); }} className="w-full flex gap-3 px-4 py-3 text-left hover:bg-slate-50">
                  <CalendarClock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[13.5px] text-ink">{overdue} planner {overdue === 1 ? 'task is' : 'tasks are'} overdue. <span className="text-accent font-semibold">Open Planner</span></div>
                </button>
              )}
              {today.length > 0 && <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Due today</div>}
              {today.map(item => (
                <button key={item.id} onClick={() => openTask(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                  <span className="text-[11px] font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">{item.item_type}</span>
                  <span className="text-[13.5px] font-semibold text-ink truncate">{item.title}</span>
                </button>
              ))}
              {count === 0 && (
                <div className="px-4 py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#34A853] mx-auto mb-2" />
                  <div className="text-sm font-semibold text-ink">You're all caught up</div>
                  <div className="text-[13px] text-slate-500">Nothing due today.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
