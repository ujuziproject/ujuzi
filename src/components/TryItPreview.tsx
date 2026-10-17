import React, { useState, useRef, useEffect } from 'react';
import { Loader2, UploadCloud, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function TryItPreview({ onSignUpClick }: { onSignUpClick: () => void }) {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'parsing' | 'results' | 'error'>('idle');
  const [topics, setTopics] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore saved draft if it exists
  useEffect(() => {
     const draft = sessionStorage.getItem('curriculumDraftText');
     if (draft) {
        setText(draft);
     }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result as string;
        encoded = encoded.replace(/^data:(.*,)?/, '');
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
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
    
    setErrorMsg('');
    setStatus('parsing');

    try {
      let payload: any = {};
      if (inputType === 'text') {
        payload.text = text;
        sessionStorage.setItem('curriculumDraftText', text); // save for later signup
      } else if (file) {
        const base64Data = await fileToBase64(file);
        payload.fileData = {
          mimeType: file.type,
          data: base64Data
        };
      }

      const response = await fetch('/api/public/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract topics');
      }

      setTopics(data.result);
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
          <div className="text-center mb-10">
             <div className="inline-block px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-success/20">Success</div>
             <h2 className="text-3xl font-black font-display text-ink tracking-tight mb-4">We found {topics.length} topics.</h2>
             <p className="text-slate-500 text-[15px] font-medium max-w-md mx-auto">This is just the outline. We can turn each of these topics into smart flashcards, comprehensive lecture notes, and quizzes.</p>
          </div>

          <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {topics.map((t, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-1">
                      <BookOpen className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.subject_name}</div>
                      <h3 className="font-bold text-ink text-[16px] mb-1">{t.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{t.description}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="bg-gradient-to-br from-ink to-[#2A2440] p-8 rounded-3xl text-center text-white relative overflow-hidden shadow-xl">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
             <h3 className="text-2xl font-black font-display mb-3 relative z-10">Unlock Your Study Plan</h3>
             <p className="text-white/70 mb-8 max-w-lg mx-auto relative z-10 text-[15px]">Sign up free to generate full lecture notes, spaced-repetition flashcards, and diagnostic quizzes for every topic above.</p>
             <button onClick={onSignUpClick} className="bg-white text-ink px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-slate-50 transition-colors shadow-lg shadow-white/10 relative z-10">
                Sign up free to unlock <ArrowRight className="w-4 h-4" />
             </button>
          </div>
       </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] md:text-5xl font-black text-ink tracking-tight mb-4 font-display">Try the AI parser.</h1>
        <p className="text-slate-500 text-[16px] font-medium">Paste your curriculum or syllabus below. We'll extract the topics for free to show you how it works.</p>
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
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,image/*" />
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
                   <span className="text-xs text-slate-500 font-medium">PDF, Word, or Image</span>
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
