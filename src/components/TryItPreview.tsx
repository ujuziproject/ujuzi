import React, { useState, useRef, useEffect } from 'react';
import { Loader2, UploadCloud, FileText, ArrowRight, BookOpen, Flame, Check } from 'lucide-react';
import { loadTryItPlan, saveTryItPlan, clearTryItPlan } from '../lib/tryItPlan';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function TryItPreview({ onSignUpClick }: { onSignUpClick: () => void }) {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'parsing' | 'results' | 'error'>('idle');
  const [topics, setTopics] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [planName, setPlanName] = useState('');
  const [hard, setHard] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore a plan they started earlier in this browser
  useEffect(() => {
    const plan = loadTryItPlan();
    if (plan) {
      setText(plan.text || '');
      setTopics(plan.topics);
      setPlanName(plan.name);
      setHard(new Set(plan.hard));
      setStatus('results');
    }
  }, []);

  // Keep the plan saved as they shape it, so it carries over into sign-up
  useEffect(() => {
    if (status !== 'results' || topics.length === 0) return;
    saveTryItPlan({ name: planName.trim() || 'My study plan', text: inputType === 'text' ? text : '', topics, hard: [...hard] });
  }, [status, topics, planName, hard]);

  const toggleHard = (title: string) => {
    const next = new Set(hard);
    if (next.has(title)) next.delete(title); else next.add(title);
    setHard(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (inputType === 'text' && !text.trim()) {
      setErrorMsg('Please paste your curriculum text.');
      return;
    }
    if (inputType === 'file' && !file) {
      setErrorMsg('Please select a file.');
      return;
    }
    if (inputType === 'file' && file && file.size > 10 * 1024 * 1024) {
      setErrorMsg('Please choose a file under 10MB.');
      return;
    }
    
    setErrorMsg('');
    setStatus('parsing');

    try {
      let response: Response;
      if (inputType === 'text') {
        response = await fetch('/api/public/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
      } else {
        // Send the file as-is (no base64), with its own content type
        response = await fetch('/api/public/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': file!.type || 'application/octet-stream' },
          body: file
        });
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract topics');
      }

      const found = Array.isArray(data.result) ? data.result : [];
      if (found.length === 0) throw new Error("We couldn't find any topics in that. Try pasting more of your syllabus.");
      setTopics(found);
      // Smart default: name the plan after the subject we found
      const subject = found[0]?.subject_name?.trim();
      setPlanName(subject ? `${subject} study plan` : 'My study plan');
      setStatus('results');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'parsing') {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center justify-center text-center animate-in fade-in">
         <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
         <h2 className="text-2xl font-bold text-ink mb-3 font-display">Reading your curriculum...</h2>
         <p className="text-slate-500 font-medium">Extracting topics and structure using AI.</p>
      </div>
    );
  }

  if (status === 'results') {
    return (
       <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-500">
          <div className="text-center mb-8">
             <div className="inline-block px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-success/20">Free preview</div>
             <h2 className="text-3xl font-black font-display text-ink tracking-tight mb-3">We found {topics.length} {topics.length === 1 ? 'topic' : 'topics'}.</h2>
             <p className="text-slate-500 text-[15px] font-medium max-w-md mx-auto">Make this plan yours: give it a name and tap any topic you find hard. We'll go deeper on those.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm mb-4">
             <label htmlFor="plan-name" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your plan name</label>
             <input
               id="plan-name"
               value={planName}
               onChange={e => setPlanName(e.target.value)}
               maxLength={80}
               className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink font-bold focus:outline-none focus:border-accent"
             />
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
             <span className="text-[13px] font-semibold text-slate-500">Tap a topic to mark it as hard</span>
             {hard.size > 0 && <span className="text-[13px] font-bold text-accent">{hard.size} marked hard — we'll go deeper</span>}
          </div>

          <div className="space-y-3 mb-8 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
             {topics.map((t, i) => {
                const isHard = hard.has(t.title);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleHard(t.title)}
                    aria-pressed={isHard}
                    className={cn(
                      "w-full text-left bg-white p-5 rounded-2xl border shadow-sm flex items-start gap-4 transition-colors",
                      isHard ? "border-accent ring-2 ring-accent/15" : "border-border hover:border-accent/50"
                    )}
                  >
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1", isHard ? "bg-accent text-white" : "bg-accent/10 text-accent")}>
                        {isHard ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                     </div>
                     <div className="flex-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.subject_name}</div>
                        <h3 className="font-bold text-ink text-[16px] mb-1">{t.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{t.description}</p>
                     </div>
                     {isHard && <span className="text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1"><Check className="w-3 h-3" /> Hard</span>}
                  </button>
                );
             })}
          </div>

          <div className="bg-gradient-to-br from-ink to-[#2A2440] p-8 rounded-3xl text-center text-white relative overflow-hidden shadow-xl">
             <h3 className="text-2xl font-black font-display mb-3 relative z-10 text-white">Save “{planName.trim() || 'My study plan'}”</h3>
             <p className="text-white/70 mb-2 max-w-lg mx-auto relative z-10 text-[15px]">Create a free account and we'll turn {topics.length === 1 ? 'this topic' : `all ${topics.length} topics`} into notes, flashcards and quizzes{hard.size > 0 ? `, with extra depth on your ${hard.size} hard topic${hard.size === 1 ? '' : 's'}` : ''}.</p>
             <p className="text-[#F5A623] text-[13px] font-semibold mb-7 relative z-10">This plan isn't saved to an account yet. If you clear your browser, you'll lose it.</p>
             <button onClick={onSignUpClick} className="bg-white text-ink px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-slate-50 transition-colors shadow-lg shadow-white/10 relative z-10">
                Save my plan — it's free <ArrowRight className="w-4 h-4" />
             </button>
          </div>
          <div className="text-center mt-5">
             <button
               type="button"
               onClick={() => { clearTryItPlan(); setTopics([]); setHard(new Set()); setPlanName(''); setText(''); setFile(null); setStatus('idle'); }}
               className="text-[13px] font-semibold text-slate-500 hover:text-ink underline underline-offset-4"
             >
               Start over with a different syllabus
             </button>
          </div>
       </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] md:text-5xl font-black text-ink tracking-tight mb-4 font-display">See your study plan first.</h1>
        <p className="text-slate-500 text-[16px] font-medium">Paste your syllabus or upload a photo of it. We'll map out every topic for free — no account needed.</p>
      </div>

      <div className="bg-surface-alt border border-border rounded-[2rem] p-8 shadow-sm">
        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setInputType('text')}
            className={cn("flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all", inputType === 'text' ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink')}
          >
            Paste Text
          </button>
          <button
            onClick={() => setInputType('file')}
            className={cn("flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all", inputType === 'file' ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink')}
          >
            Upload Document
          </button>
        </div>

        {inputType === 'text' ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your syllabus, course outline, or topics here..."
              className="w-full h-48 bg-white border border-border rounded-2xl p-5 text-ink focus:outline-none focus:border-accent resize-none font-medium mb-4"
            />
          </div>
        ) : (
          <div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,image/png,image/jpeg,image/webp" />
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={cn(
                 "w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors mb-4",
                 file ? "border-accent bg-accent/5" : "border-slate-300 hover:border-accent hover:bg-slate-50"
               )}
             >
               {file ? (
                 <>
                   <FileText className="w-8 h-8 text-accent mb-3" />
                   <span className="font-bold text-ink">{file.name}</span>
                   <span className="text-xs text-slate-500 mt-1">Click to change</span>
                 </>
               ) : (
                 <>
                   <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
                   <span className="font-bold text-ink mb-1">Click to upload document</span>
                   <span className="text-xs text-slate-500 font-medium">PDF or image, up to 10MB</span>
                 </>
               )}
             </div>
          </div>
        )}

        {errorMsg && <div className="text-sm font-bold text-accent-warm mb-4 text-center">{errorMsg}</div>}

        <button 
          onClick={handleExtract}
          className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          See my topics <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
