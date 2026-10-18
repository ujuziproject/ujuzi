import React, { useEffect, useRef, useState } from 'react';
import { Search, BookOpen, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigationStore } from './MainApp';
import { openCourse, openTopic } from '../lib/navigation';

type CourseHit = { kind: 'course'; id: string; title: string; isCurriculum: boolean };
type TopicHit = { kind: 'topic'; id: string; title: string; course_id: string | null; curriculum_id: string | null; subject: string };

// Searches the student's own courses and topics (Row Level Security limits results to them).
export function GlobalSearch({ userId, onNavigated }: { userId: string; onNavigated?: () => void }) {
  const nav = useNavigationStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseHit[]>([]);
  const [topics, setTopics] = useState<TopicHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Ctrl/⌘+K focuses search; Escape closes it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setCourses([]); setTopics([]); setLoading(false); return; }
    setLoading(true);
    const pattern = `%${q.replace(/[%_]/g, '')}%`;
    const timer = setTimeout(async () => {
      const [cRes, curRes, tRes] = await Promise.all([
        supabase.from('courses').select('id, course_title').ilike('course_title', pattern).limit(5),
        supabase.from('curricula').select('id, title').eq('student_id', userId).ilike('title', pattern).limit(5),
        supabase.from('topics').select('id, title, subject_name, course_id, curriculum_id').ilike('title', pattern).limit(8),
      ]);
      setCourses([
        ...(cRes.data || []).map(c => ({ kind: 'course' as const, id: c.id, title: c.course_title, isCurriculum: false })),
        ...(curRes.data || []).map(c => ({ kind: 'course' as const, id: c.id, title: c.title, isCurriculum: true })),
      ]);
      setTopics((tRes.data || []).map(t => ({ kind: 'topic' as const, id: t.id, title: t.title, subject: t.subject_name, course_id: t.course_id, curriculum_id: t.curriculum_id })));
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, userId]);

  const done = () => { setOpen(false); setQuery(''); onNavigated?.(); };
  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="w-full flex items-center gap-3 bg-[#F8F9FA] rounded-[18px] px-4 md:px-5 py-3 md:py-3.5 text-slate-400 text-[15px] font-medium border border-slate-100 focus-within:border-accent/50 transition-colors">
        <Search className="w-[18px] h-[18px] text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search your courses and topics…"
          aria-label="Search your courses and topics"
          className="bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-slate-400 text-ink"
        />
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
          <div className="hidden md:block ml-auto font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-sm">Ctrl K</div>
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-[60vh] overflow-y-auto animate-in fade-in">
          {!loading && courses.length === 0 && topics.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">No courses or topics match “{query.trim()}”.</div>
          )}
          {courses.length > 0 && (
            <div className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Courses</div>
          )}
          {courses.map(c => (
            <button
              key={`c-${c.id}`}
              onClick={() => { openCourse(nav, c.isCurriculum ? { curriculumId: c.id } : { courseId: c.id }); done(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-accent shrink-0" />
              <span className="text-[14px] font-semibold text-ink truncate">{c.title}</span>
            </button>
          ))}
          {topics.length > 0 && (
            <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Topics</div>
          )}
          {topics.map(t => (
            <button
              key={`t-${t.id}`}
              onClick={() => { openTopic(nav, t); done(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#F5A623] shrink-0" />
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink truncate">{t.title}</span>
                {t.subject && <span className="block text-[12px] text-slate-500 truncate">{t.subject}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
