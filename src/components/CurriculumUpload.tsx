import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { CurriculumResults } from './CurriculumResults';
import { recordActivity } from '../lib/activity';

interface CurriculumUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export function CurriculumUpload({ userId, onUploadComplete }: CurriculumUploadProps) {
  const [title, setTitle] = useState('');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [prefs, setPrefs] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  
  const [findingCurriculum, setFindingCurriculum] = useState(false);
  const [findingError, setFindingError] = useState('');
  const [findingSuccess, setFindingSuccess] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  
  const [completedCurriculumId, setCompletedCurriculumId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide a title for your curriculum.');
      return;
    }
    if (inputType === 'text' && !text.trim()) {
      setError('Please paste your curriculum text.');
      return;
    }
    if (inputType === 'file' && !file) {
      setError('Please upload a file.');
      return;
    }

    setLoading(true);
    setError('');
    setProgressMsg('Uploading curriculum...');

    try {
      let fileUrl = '';
      let signedUrl = '';
      let rawText = inputType === 'text' ? text : '';
      
      // 1. Upload File if needed
      if (inputType === 'file' && file) {
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('curricula')
          .upload(filePath, file);
          
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        
        fileUrl = filePath;
        
        // Get signed URL for backend processing
        const { data: signedData, error: signedError } = await supabase.storage
          .from('curricula')
          .createSignedUrl(filePath, 60 * 5); // 5 mins
          
        if (signedError) throw new Error(`Failed to get signed URL: ${signedError.message}`);
        signedUrl = signedData.signedUrl;
      }

      // 2. Create Curriculum Record
      const { data: currData, error: currError } = await supabase
        .from('curricula')
        .insert({
          student_id: userId,
          title,
          file_url: fileUrl || null,
          raw_text: rawText || null,
          status: 'parsing'
        })
        .select()
        .single();
        
      if (currError) throw currError;
      const curriculumId = currData.id;

      // 3. Extract Topics via Backend
      setProgressMsg('AI is analyzing your curriculum (this might take a moment)...');
      
      const extractRes = await fetch('/api/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          inputType === 'file' 
            ? { fileUrl: signedUrl, fileMimeType: file.type }
            : { text: rawText }
        )
      });
      
      if (!extractRes.ok) throw new Error('Failed to extract topics. Please try again.');
      
      const { result: topics } = await extractRes.json();
      
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        throw new Error('AI could not identify any topics in your curriculum.');
      }

      // 4. Insert Topics
      setProgressMsg(`Found ${topics.length} topics. Saving...`);
      const topicInserts = topics.map((t: any, index: number) => ({
        curriculum_id: curriculumId,
        subject_name: t.subject_name || 'General',
        title: t.title || 'Untitled Topic',
        description: t.description || '',
        order_index: index
      }));
      
      const { data: savedTopics, error: topicsError } = await supabase
        .from('topics')
        .insert(topicInserts)
        .select();
        
      if (topicsError) throw topicsError;

      // 5. Generate Materials per Topic
      // We process them sequentially or in small batches to avoid timeouts.
      let completedTopics = 0;
      for (const topic of savedTopics) {
        completedTopics++;
        setProgressMsg(`Generating materials for Topic ${completedTopics} of ${savedTopics.length}...`);
        
        try {
          const matRes = await fetch('/api/generate-materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: topic.title,
              description: topic.description,
              subject_name: topic.subject_name,
              content_format_preference: prefs.contentFormat,
              explanation_complexity_preference: prefs.explanationComplexity
            })
          });
          
          if (!matRes.ok) {
            console.warn(`Failed to generate materials for topic ${topic.id}`);
            continue; // Skip and continue
          }
          
          const { result: materials } = await matRes.json();
          
          // Insert Notes
          if (materials.lecture_notes) {
            await supabase.from('lecture_notes').insert({
              topic_id: topic.id,
              content: materials.lecture_notes
            });
          }
          
          // Insert Flashcards
          if (materials.flashcards && materials.flashcards.length > 0) {
            const fcInserts = materials.flashcards.map((fc: any) => ({
              topic_id: topic.id,
              question: fc.question,
              answer: fc.answer
            }));
            await supabase.from('flashcards').insert(fcInserts);
          }
          
          // Insert Quiz
          if (materials.quiz && materials.quiz.length > 0) {
            const { data: quizData, error: quizError } = await supabase
              .from('quizzes')
              .insert({
                topic_id: topic.id,
                title: `${topic.title} Quiz`
              })
              .select()
              .single();
              
            if (!quizError && quizData) {
              const qInserts = materials.quiz.map((q: any, i: number) => ({
                quiz_id: quizData.id,
                question_text: q.question_text,
                options: q.options || [],
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                order_index: i
              }));
              await supabase.from('quiz_questions').insert(qInserts);
            }
          }
        } catch (matErr) {
          console.warn(`Error generating for topic ${topic.id}:`, matErr);
          // continue to next topic
        }
      }

      // 6. Update Curriculum Status
      await supabase
        .from('curricula')
        .update({ status: 'parsed' })
        .eq('id', curriculumId);

      await recordActivity(userId, 'curriculum_uploaded', { curriculumId });

      if (onUploadComplete) {
        onUploadComplete();
      } else {
        setCompletedCurriculumId(curriculumId);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setProgressMsg('');
      
      // We could try to mark curriculum as 'failed' if we had an ID
    } finally {
      setLoading(false);
    }
  };

  if (completedCurriculumId) {
    return <CurriculumResults curriculumId={completedCurriculumId} userId={userId} />;
  }

  return (
    <div className="bg-surface-alt rounded-2xl border border-border shadow-sm p-6 md:p-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-accent" />
        Upload Curriculum
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
          <h3 className="text-lg font-semibold text-ink mb-2">Processing Curriculum</h3>
          <p className="text-slate-500 text-sm max-w-sm">{progressMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ink/80 mb-2">Curriculum Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. SS3 Mathematics or MTH201"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink/80 mb-2">Input Method</label>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setInputType('text')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  inputType === 'text' ? "bg-surface-alt text-accent shadow-sm" : "text-slate-500 hover:text-ink/80"
                )}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setInputType('file')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  inputType === 'file' ? "bg-surface-alt text-accent shadow-sm" : "text-slate-500 hover:text-ink/80"
                )}
              >
                Upload PDF / Image
              </button>
            </div>

            {inputType === 'text' ? (
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your syllabus or topics list here..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm resize-none"
              />
            ) : (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                  file ? "border-accent bg-surface-alt/50" : "border-slate-300 bg-surface hover:bg-slate-100"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept="application/pdf,image/jpeg,image/png"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-accent mb-3" />
                    <p className="font-semibold text-ink">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="font-semibold text-ink/80">Click to upload PDF or image</p>
                    <p className="text-xs text-slate-500 mt-1">Maximum file size: 50MB</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center gap-2"
            >
              Start Generating
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
