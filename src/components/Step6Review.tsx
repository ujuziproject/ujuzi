import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Track } from '../types';
import { learnerType } from '../lib/learnerType';
import { loadTryItPlan } from '../lib/tryItPlan';

interface Step6Props {
 userId: string;
 onNext: () => void;
}

const Confetti = () => {
 const [pieces, setPieces] = useState<any[]>([]);

 useEffect(() => {
 const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#5b4fe8'];
 const newPieces = Array.from({ length: 80 }).map((_, i) => ({
 id: i,
 left: `${Math.random() * 100}%`,
 animationDuration: `${Math.random() * 3 + 2.5}s`,
 animationDelay: `${Math.random() * 0.5}s`,
 backgroundColor: colors[Math.floor(Math.random() * colors.length)],
 isCircle: Math.random() > 0.5
 }));
 setPieces(newPieces);
 }, []);

 return (
 <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
 <style>
 {`
 @keyframes confetti-fall {
 0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
 100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 1; }
 }
 `}
 </style>
 {pieces.map((p) => (
 <div
 key={p.id}
 className="absolute -top-10 opacity-0"
 style={{
 left: p.left,
 width: p.isCircle ? '8px' : '10px',
 height: p.isCircle ? '8px' : '20px',
 borderRadius: p.isCircle ? '50%' : '2px',
 backgroundColor: p.backgroundColor,
 animation: `confetti-fall ${p.animationDuration} ease-in ${p.animationDelay} forwards`,
 }}
 />
 ))}
 </div>
 );
};

export function Step6Review({ userId, onNext }: Step6Props) {
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');
 
 const [profile, setProfile] = useState<any>(null);
 const [interests, setInterests] = useState<any[]>([]);
 const [fullName, setFullName] = useState('');
 const [pendingPlan] = useState(() => loadTryItPlan());

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 const { data: pData, error: pError } = await supabase
 .from('student_profiles')
 .select('*')
 .eq('id', userId)
 .single();
 
 if (pError) throw pError;
 setProfile(pData);
 const { data: base } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
 if (base?.full_name) setFullName(base.full_name);

 const { data: iData, error: iError } = await supabase
 .from('student_interests')
 .select(`
 interest_id,
 interests ( name )
 `)
 .eq('student_id', userId);
 
 if (iError) throw iError;
 
 // format interests
 const formattedInterests = iData.map((item: any) => item.interests?.name).filter(Boolean);
 setInterests(formattedInterests);
 
 } catch (err: any) {
 console.error(err);
 setError('Failed to load profile data.');
 } finally {
 setLoading(false);
 }
 };

 const handleFinalize = async () => {
 setSubmitting(true);
 try {
  if (profile?.track === 'university') {
    const { data: existingSems } = await supabase.from('semesters').select('id').eq('student_id', userId).limit(1);
    if (!existingSems || existingSems.length === 0) {
       const { error: semError } = await supabase.from('semesters').insert({
         student_id: userId,
         level_year: profile.level_year || 1,
         semester_number: 1
       });
       // A duplicate (23505) means the semester already exists, which is fine
       if (semError && semError.code !== '23505') throw semError;
    }
  }

 const { error } = await supabase.from('student_profiles').update({
 learning_style_set_at: new Date().toISOString()
 }).eq('id', userId);
 
 if (error) throw error;
 
 onNext();
 } catch (err: any) {
 console.error(err);
 setError('Failed to finalize setup.');
 setSubmitting(false);
 }
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20 ">
 <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
 <p className="text-slate-500 font-medium">Preparing your plan...</p>
 </div>
 );
 }

 const type = learnerType(profile?.content_format_preference, profile?.explanation_complexity_preference);
 const pathLabel = profile?.track === 'secondary' ? '🎒 Exam Ace' : profile?.track === 'university' ? '🎓 Campus Scholar' : '🧭 Self-Starter';
 const detail = profile?.track === 'secondary'
 ? `${(profile?.exam_type || '').toUpperCase()}${profile?.exam_year ? ` ${profile.exam_year}` : ''}`
 : profile?.track === 'university'
 ? [profile?.course_of_study, profile?.institution_name].filter(Boolean).join(' · ')
 : 'Learning on your own terms';
 const weeklyHours = Math.round((profile?.weekly_goal_minutes || 300) / 60);

 return (
 <div className="w-full max-w-xl mx-auto">
 <Confetti />
 <div className="text-center mb-6">
 <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2">All quests complete 🏆</div>
 <h1 className="text-3xl font-black text-ink tracking-tight font-display">Meet your learner card</h1>
 </div>

 {error && (
 <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 mb-6">
 {error}
 </div>
 )}

 <div className="relative rounded-[2rem] p-7 mb-6 text-white overflow-hidden shadow-xl bg-gradient-to-br from-[#1E1139] via-[#2D1F5B] to-[#43236C] animate-in fade-in zoom-in-95">
 <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#F5A623]/20 blur-3xl pointer-events-none" />
 <div className="flex items-start justify-between gap-4 mb-6 relative">
 <div>
 <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">uJuzi learner</div>
 <div className="text-2xl font-black font-display mt-1">{fullName || 'You'}</div>
 <div className="text-[13px] font-semibold text-[#F5A623] mt-1">{pathLabel}</div>
 </div>
 <div className="text-5xl animate-pop" aria-hidden="true">{type.emoji}</div>
 </div>

 <div className="grid grid-cols-2 gap-3 relative">
 <div className="rounded-2xl bg-white/10 p-3.5">
 <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Learner type</div>
 <div className="font-bold text-[14px] leading-snug">{type.name.replace(/^The /, '')}</div>
 </div>
 <div className="rounded-2xl bg-white/10 p-3.5">
 <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Weekly goal</div>
 <div className="font-bold text-[14px]">{weeklyHours} hours</div>
 </div>
 <div className="rounded-2xl bg-white/10 p-3.5 col-span-2">
 <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">{profile?.track === 'secondary' ? 'Target exam' : profile?.track === 'university' ? 'Studying' : 'Mode'}</div>
 <div className="font-bold text-[14px]">{detail || '—'}</div>
 </div>
 </div>

 {interests.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-4 relative">
 {interests.map((interest, idx) => (
 <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-[12px] font-semibold">{interest}</span>
 ))}
 </div>
 )}
 </div>

 <div className="bg-surface-alt border border-border rounded-[1.5rem] p-5 mb-6">
 <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Next quest</div>
 <div className="font-bold text-ink">{pendingPlan ? `📥 Save “${pendingPlan.name}” as your first course` : '📥 Add your first syllabus or course outline'}</div>
 <div className="text-sm text-slate-500 mt-1">We’ll turn it into notes, flashcards and quizzes in a few minutes.</div>
 </div>

 <button
 onClick={handleFinalize}
 disabled={submitting}
 className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-accent/20 text-lg"
 >
 {submitting ? (
 <Loader2 className="w-6 h-6 animate-spin" />
 ) : (
 <>
 Enter uJuzi
 <ArrowRight className="w-5 h-5" />
 </>
 )}
 </button>
 </div>
 );
}
