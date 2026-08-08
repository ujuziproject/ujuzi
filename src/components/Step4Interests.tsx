import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Interest } from '../types';
import { Loader2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step4Props {
 userId: string;
 onNext: () => void;
}

export function Step4Interests({ userId, onNext }: Step4Props) {
 const [interests, setInterests] = useState<Interest[]>([]);
 const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 async function fetchInterests() {
 try {
 const { data, error } = await supabase
 .from('interests')
 .select('*')
 .order('name');
 
 if (error) throw error;
 setInterests(data || []);
 } catch (err: any) {
 setError('Failed to load interests. Please try again later.');
 } finally {
 setLoading(false);
 }
 }
 
 fetchInterests();
 }, []);

 const toggleInterest = (id: string) => {
 const next = new Set(selectedIds);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 setSelectedIds(next);
 };

 const handleSubmit = async () => {
 if (selectedIds.size === 0) {
 setError('Please select at least one interest.');
 return;
 }

 setSubmitting(true);
 setError('');

 try {
 const inserts = Array.from(selectedIds).map(interestId => ({
 student_id: userId,
 interest_id: interestId
 }));

 const { error: insertError } = await supabase
 .from('student_interests')
 .insert(inserts);

 if (insertError) throw insertError;
 
 onNext();
 } catch (err: any) {
 setError(err.message || 'Failed to save interests.');
 setSubmitting(false);
 }
 };

 return (
 <div className="w-full max-w-xl mx-auto slide-in-from-right-4 ">
 <div className="mb-10 text-center">
 <h1 className="text-3xl font-bold text-ink mb-2">What interests you?</h1>
 <p className="text-slate-500">Select at least three areas you are passionate about to personalize your learning dashboard.</p>
 </div>

 {error && (
 <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center">
 {error}
 </div>
 )}

 {loading ? (
 <div className="flex justify-center py-12">
 <Loader2 className="w-8 h-8 animate-spin text-accent" />
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
 {interests.map((interest) => {
 const isSelected = selectedIds.has(interest.id);
 return (
 <button
 key={interest.id}
 onClick={() => toggleInterest(interest.id)}
 className={cn(
 "py-3 px-4 border rounded-xl text-sm font-semibold text-center transition-all flex justify-center items-center gap-1.5",
 isSelected 
 ? "border-accent bg-surface-alt/50 text-accent"
 : "border-border hover:border-accent/50 bg-surface-alt text-ink/80 hover:bg-surface"
 )}
 >
 {isSelected && <Check className="w-4 h-4" />}
 {interest.name}
 </button>
 );
 })}
 </div>
 )}

 <button
 onClick={handleSubmit}
 disabled={submitting || loading}
 className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-accent/20 transition-all flex items-center justify-center disabled:opacity-70"
 >
 {submitting ? (
 <Loader2 className="w-6 h-6 animate-spin" />
 ) : (
 'Complete Profiling'
 )}
 </button>
 </div>
 );
}
