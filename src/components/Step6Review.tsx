import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Track } from '../types';

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

 return (
 <div className="w-full max-w-2xl mx-auto ">
 <Confetti />
 <div className="text-center mb-10">
 <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-8 h-8 text-accent" />
 </div>
 <h1 className="text-2xl md:text-3xl font-black text-ink mb-3 uppercase tracking-tight font-display">Review Your Plan</h1>
 <p className="text-slate-500 font-medium">Here's a summary of your uJuzi learning profile.</p>
 </div>

 {error && (
 <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 mb-6">
 {error}
 </div>
 )}

 <div className="bg-surface-alt border border-border rounded-2xl p-6 md:p-8 space-y-8 mb-8 shadow-sm">
 
 {/* Track & Academic Info */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Academic Path</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Track</span>
 <span className="font-semibold text-ink capitalize">{profile?.track || 'Not set'}</span>
 </div>
 
 {profile?.track === 'secondary' && profile?.exam_type && (
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Exam</span>
 <span className="font-semibold text-ink uppercase">{profile.exam_type} {profile.exam_year ? `(${profile.exam_year})` : ''}</span>
 </div>
 )}

 {profile?.track === 'university' && (
 <>
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course of Study</span>
 <span className="font-semibold text-ink">{profile.course_of_study || 'Not set'}</span>
 </div>
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Institution</span>
 <span className="font-semibold text-ink">{profile.institution_name || 'Not set'}</span>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Interests */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Learning Interests</h3>
 <div className="flex flex-wrap gap-2">
 {interests.length > 0 ? (
 interests.map((interest, idx) => (
 <span key={idx} className="px-3 py-1.5 bg-accent/5 text-accent font-semibold rounded-lg text-sm border border-accent/10">
 {interest}
 </span>
 ))
 ) : (
 <span className="text-slate-500 text-sm">No interests selected.</span>
 )}
 </div>
 </div>

 {/* Learning Style */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Learning Preferences</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Content Format</span>
 <span className="font-semibold text-ink capitalize">{profile?.content_format_preference || 'Balanced'}</span>
 </div>
 <div className="p-4 bg-slate-50 rounded-xl">
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Explanation Depth</span>
 <span className="font-semibold text-ink capitalize">{profile?.explanation_complexity_preference || 'Balanced'}</span>
 </div>
 </div>
 </div>

 </div>

 <button
 onClick={handleFinalize}
 disabled={submitting}
 className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-accent/20 text-lg"
 >
 {submitting ? (
 <Loader2 className="w-6 h-6 animate-spin" />
 ) : (
 <>
 Complete Onboarding
 <ArrowRight className="w-5 h-5" />
 </>
 )}
 </button>
 </div>
 );
}
