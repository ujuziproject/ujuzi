import React from 'react';
import { BookOpen, GraduationCap, ChevronRight, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { Track } from '../types';

interface Step2Props {
 onNext: (track: Track) => void;
}

export function Step2Track({ onNext }: Step2Props) {
 return (
 <div className="w-full ">
 <div className="text-center mb-10"><h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Choose Your Path</h2></div>

 <div className="space-y-4">
 <button
 onClick={() => onNext('secondary')}
 className="w-full flex items-center p-5 border border-border rounded-xl hover:border-accent/50 bg-surface-alt hover:bg-surface shadow-sm transition-all group text-left"
 >
 <div className="bg-surface-alt/50 p-3 rounded-lg text-accent group-hover:bg-accent/10 transition-colors">
 <BookOpen className="w-6 h-6" />
 </div>
 <div className="ml-4 flex-1">
 <h3 className="font-bold text-ink">Secondary School</h3>
 <p className="text-sm text-slate-500">Preparing for WAEC, JAMB, NECO</p>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
 </button>

 <button
 onClick={() => onNext('university')}
 className="w-full flex items-center p-5 border border-border rounded-xl hover:border-accent/50 bg-surface-alt hover:bg-surface shadow-sm transition-all group text-left"
 >
 <div className="bg-surface-alt/50 p-3 rounded-lg text-accent group-hover:bg-accent/10 transition-colors">
 <GraduationCap className="w-6 h-6" />
 </div>
 <div className="ml-4 flex-1">
 <h3 className="font-bold text-ink">University Student</h3>
 <p className="text-sm text-slate-500">Undergraduate programs</p>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
 </button>
 <button
 onClick={() => onNext('independent')}
 className="w-full flex items-center p-5 border border-border rounded-xl hover:border-accent/50 bg-surface-alt hover:bg-surface shadow-sm transition-all group text-left"
 >
 <div className="bg-surface-alt/50 p-3 rounded-lg text-accent group-hover:bg-accent/10 transition-colors">
 <Briefcase className="w-6 h-6" />
 </div>
 <div className="ml-4 flex-1">
 <h3 className="font-bold text-ink">Independent Learner</h3>
 <p className="text-sm text-slate-500">Studying for a certification, exam, or skill on my own</p>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
 </button>
 </div>
 </div>
 );
}
