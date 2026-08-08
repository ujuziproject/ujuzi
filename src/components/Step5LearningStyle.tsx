import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step5Props {
 userId: string;
 onNext: () => void;
}

export function Step5LearningStyle({ userId, onNext }: Step5Props) {
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const [answers, setAnswers] = useState<string[]>(Array(8).fill(''));
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');

 const questions = [
 {
 text: "When learning something new, I prefer...",
 options: [
 { id: 'visual', text: "Diagrams and visual breakdowns" },
 { id: 'text', text: "Reading detailed written explanations" }
 ],
 type: 'format' // Q1
 },
 {
 text: "I understand best when a topic is explained...",
 options: [
 { id: 'simple', text: "With simple, everyday examples" },
 { id: 'advanced', text: "With precise technical detail" }
 ],
 type: 'complexity' // Q2
 },
 {
 text: "When studying, I like to...",
 options: [
 { id: 'visual', text: "Look at charts, maps, or images" },
 { id: 'text', text: "Take detailed written notes" }
 ],
 type: 'format' // Q3
 },
 {
 text: "If someone explained photosynthesis to me, I'd prefer...",
 options: [
 { id: 'simple', text: "'Plants eating sunlight like a snack'" },
 { id: 'advanced', text: "'The biochemical process converting light energy to chemical energy'" }
 ],
 type: 'complexity' // Q4
 },
 {
 text: "I remember things better when I...",
 options: [
 { id: 'visual', text: "Picture them in my mind" },
 { id: 'text', text: "Read about them in words" }
 ],
 type: 'format' // Q5
 },
 {
 text: "I prefer study materials that...",
 options: [
 { id: 'simple', text: "Start simple and build up gradually" },
 { id: 'advanced', text: "Go straight into technical depth" }
 ],
 type: 'complexity' // Q6
 },
 {
 text: "When solving a problem, I like to...",
 options: [
 { id: 'visual', text: "Sketch it out or visualize it" },
 { id: 'text', text: "Write out the steps in words" }
 ],
 type: 'format' // Q7
 },
 {
 text: "New concepts click for me best when explained...",
 options: [
 { id: 'simple', text: "Like I'm five years old first, then more detail" },
 { id: 'advanced', text: "At full technical level right away" }
 ],
 type: 'complexity' // Q8
 }
 ];

 const handleSelect = (optionId: string) => {
 const newAnswers = [...answers];
 newAnswers[currentQuestionIndex] = optionId;
 setAnswers(newAnswers);

 if (currentQuestionIndex < 7) {
 setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
 }
 };

 const calculateAndSubmit = async () => {
 setSubmitting(true);
 setError('');

 try {
 let visualCount = 0;
 let textCount = 0;
 let simpleCount = 0;
 let advancedCount = 0;

 answers.forEach((ans, idx) => {
 const type = questions[idx].type;
 if (type === 'format') {
 if (ans === 'visual') visualCount++;
 if (ans === 'text') textCount++;
 } else if (type === 'complexity') {
 if (ans === 'simple') simpleCount++;
 if (ans === 'advanced') advancedCount++;
 }
 });

 const content_format_preference = visualCount > textCount ? 'visual' : textCount > visualCount ? 'text' : 'balanced';
 const explanation_complexity_preference = simpleCount > advancedCount ? 'simple' : advancedCount > simpleCount ? 'advanced' : 'balanced';

 const { error } = await supabase.from('student_profiles').update({
 content_format_preference,
 explanation_complexity_preference
 }).eq('id', userId);

 if (error) throw error;

 onNext();
 } catch (err: any) {
 console.error(err);
 setError('Failed to save preferences. Please try again.');
 setSubmitting(false);
 }
 };

 const isComplete = answers.filter(a => a !== '').length === 8;

 return (
 <div className="w-full max-w-xl mx-auto ">
 <div className="mb-8 text-center">
 <h2 className="text-3xl font-bold text-ink mb-2 font-display">How do you learn best?</h2>
 <p className="text-slate-500">Let's personalize your study experience. ({currentQuestionIndex + 1}/8)</p>
 </div>

 <div className="bg-surface-alt p-8 rounded-[2rem] border border-border shadow-sm mb-8 min-h-[250px] flex flex-col justify-center">
 <h3 className="text-xl font-bold text-ink mb-6 text-center">{questions[currentQuestionIndex].text}</h3>
 <div className="space-y-4">
 {questions[currentQuestionIndex].options.map((opt) => (
 <button
 key={opt.id}
 onClick={() => handleSelect(opt.id)}
 className={cn(
 "w-full p-4 rounded-xl border text-left font-semibold transition-all",
 answers[currentQuestionIndex] === opt.id 
 ? "bg-accent/10 border-accent/50 text-accent ring-2 ring-accent/20" 
 : "bg-surface border-border text-ink hover:border-accent hover:shadow-sm"
 )}
 >
 {opt.text}
 </button>
 ))}
 </div>
 </div>

 <div className="flex justify-between items-center">
 <button
 onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
 disabled={currentQuestionIndex === 0 || submitting}
 className="text-sm font-semibold text-slate-500 hover:text-ink disabled:opacity-50 transition-colors"
 >
 Previous
 </button>

 {isComplete && currentQuestionIndex === 7 ? (
 <button
 onClick={calculateAndSubmit}
 disabled={submitting}
 className="bg-accent text-white px-8 py-3 rounded-full font-bold shadow-sm hover:bg-accent/90 transition-all flex items-center gap-2 disabled:opacity-70"
 >
 {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
 {!submitting && <ArrowRight className="w-4 h-4" />}
 </button>
 ) : (
 <button
 onClick={() => setCurrentQuestionIndex(Math.min(7, currentQuestionIndex + 1))}
 disabled={!answers[currentQuestionIndex] || submitting}
 className="bg-ink text-white px-6 py-3 rounded-full font-bold hover:bg-ink/90 transition-colors disabled:opacity-50"
 >
 Next
 </button>
 )}
 </div>
 {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
 </div>
 );
}
