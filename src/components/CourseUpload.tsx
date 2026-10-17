import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authFetch, apiError } from '../lib/api';
import { DiagnosticFlow } from './DiagnosticFlow';
import { GenerationIssues } from './GenerationIssues';
import { GenerationRunner } from './GenerationRunner';
import { loadTryItPlan, clearTryItPlan, tryItDraftText, applyHardTopics } from '../lib/tryItPlan';
import { Loader2, Search } from 'lucide-react';

export function CourseUpload({ userId, semesterId, goalId, bulk, onUploadComplete }: { userId: string, semesterId?: string, goalId?: string, bulk: boolean, onUploadComplete: () => void }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing' | 'diagnostic' | 'generating' | 'issues' | 'success'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [failedTopics, setFailedTopics] = useState<any[]>([]);
  const [failReason, setFailReason] = useState('');
  const [generatedTotal, setGeneratedTotal] = useState(0);
  const [savedTopics, setSavedTopics] = useState<any[]>([]);
  const [progressMsg, setProgressMsg] = useState('');
  const [prefs, setPrefs] = useState<{contentFormat?: string, explanationComplexity?: string}>({});
  const [findingCurriculum, setFindingCurriculum] = useState(false);

  // Pre-fill with the plan they built in "Try it" before signing up
  const [hardTitles, setHardTitles] = useState<string[]>([]);
  const [fromTryIt, setFromTryIt] = useState(false);
  useEffect(() => {
    const plan = loadTryItPlan();
    if (plan) {
      setText(tryItDraftText(plan));
      if (!bulk) setTitle(plan.name);
      setHardTitles(plan.hard);
      setFromTryIt(true);
    }
  }, []);

  const [findingError, setFindingError] = useState('');
  const [findingSuccess, setFindingSuccess] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    supabase.from('student_profiles').select('content_format_preference, explanation_complexity_preference, learning_style_set_at, track, institution_name, faculty, course_of_study').eq('id', userId).maybeSingle().then(({data}) => {
       if (data) {
          setProfileData(data);
          if (data.learning_style_set_at) {
            setPrefs({
               contentFormat: data.content_format_preference,
               explanationComplexity: data.explanation_complexity_preference
            });
          }
       }
    });
  }, [userId]);

  const handleUpload = async () => {
    if (!text.trim() || (!bulk && !title.trim())) return;
    if (!semesterId && !goalId) {
      setUploadError('Choose a semester or goal for this course first.');
      return;
    }
    setUploadError('');
    setStatus('parsing');
    
    let allSavedTopics: any[] = [];
    
    try {
      if (bulk) {
        setProgressMsg('Identifying courses...');
        const res = await authFetch('/api/extract-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!res.ok) throw await apiError(res, 'Bulk parse failed');
        const { result: parsedCourses } = await res.json();
        
        setProgressMsg(`Found ${parsedCourses.length} courses. Generating...`);
        let completedTopics = 0;

        for (const pc of parsedCourses) {
          const { data: course, error: courseError } = await supabase.from('courses').insert({
            semester_id: semesterId || null,
            goal_id: goalId || null,
            course_title: pc.course_title,
            course_code: pc.course_code || null,
            raw_text: text,
            status: 'parsing'
          }).select().single();
          
          if (course) {
            const topicInserts = pc.topics.map((t: any, idx: number) => ({
              course_id: course.id,
              subject_name: pc.course_title,
              title: t.title,
              description: t.description,
              order_index: idx
            }));
            const { data: topicsData, error: topicsError } = await supabase.from('topics').insert(topicInserts).select();
            if (topicsError) throw new Error(`Couldn't save topics for ${pc.course_title}: ${topicsError.message}`);
            if (topicsData) {
              allSavedTopics.push(...topicsData);
            }
          } else {
            throw new Error(`Couldn't save the course ${pc.course_title}: ${courseError?.message || 'unknown error'}`);
          }
        }
        
      } else {
        setProgressMsg('Extracting topics from course outline...');
        const extractRes = await authFetch('/api/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `Course: ${title}\n\n${text}` })
        });
        if (!extractRes.ok) throw await apiError(extractRes, 'Topic extraction failed');
        const { result: extractedTopics } = await extractRes.json();

        const { data: course, error: courseError } = await supabase.from('courses').insert({
          semester_id: semesterId || null,
          goal_id: goalId || null,
          course_title: title,
          course_code: code,
          raw_text: text,
          status: 'parsing'
        }).select().single();
        
        if (course) {
          const topicInserts = extractedTopics.map((t: any, idx: number) => ({
            course_id: course.id,
            subject_name: title,
            title: t.title,
            description: t.description,
            order_index: idx
          }));
          const { data: topicsData, error: topicsError } = await supabase.from('topics').insert(topicInserts).select();
          if (topicsError) throw new Error(`Couldn't save the topics: ${topicsError.message}`);
          if (topicsData) {
            allSavedTopics.push(...topicsData);
          }
        } else {
          throw new Error(`Couldn't save the course: ${courseError?.message || 'unknown error'}`);
        }
      }

      if (allSavedTopics.length === 0) throw new Error('No topics were found in that outline. Try pasting more detail.');
      if (fromTryIt) clearTryItPlan(); // it's now a real course
      setSavedTopics(allSavedTopics);
      setStatus('diagnostic');
      
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  // Generation runs inside <GenerationRunner>, which keeps the student engaged while it works
  const [toGenerate, setToGenerate] = useState<any[]>([]);
  const [runId, setRunId] = useState(0);

  const handleDiagnosticComplete = (topicsWithDepth: any[]) => {
    setToGenerate(applyHardTopics(topicsWithDepth, hardTitles));
    setRunId(r => r + 1);
    setStatus('generating');
  };

  const handleGenerationFinished = async ({ failed, firstError }: { failed: any[]; firstError: string }) => {
    // Mark courses as parsed and refresh the study plan for whatever succeeded
    const courseIds = [...new Set(toGenerate.map(t => t.course_id))];
    for (const cid of courseIds) {
      if (cid) await supabase.from('courses').update({ status: 'parsed' }).eq('id', cid);
    }
    try {
      const { adjustStudyPlan } = await import('../lib/pacing');
      await adjustStudyPlan(userId, profileData?.track || (goalId ? 'independent' : 'university'));
    } catch (e) {
      console.error('Error generating study plan', e);
    }

    if (failed.length > 0) {
      setFailedTopics(failed);
      setFailReason(firstError);
      setGeneratedTotal(toGenerate.length);
      setStatus('issues');
      return;
    }
    // Success: GenerationRunner shows "ready" and waits for the student to continue
  };

  const handleContinueAfterGeneration = () => {
    setStatus('success');
    onUploadComplete();
  };

  if (status === 'issues') {
    return (
      <GenerationIssues
        total={generatedTotal}
        failedCount={failedTopics.length}
        reason={failReason}
        onRetry={() => handleDiagnosticComplete(failedTopics)}
        onContinue={() => { setStatus('success'); onUploadComplete(); }}
      />
    );
  }

  if (status === 'parsing') {
    return (
      <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
        <h3 className="text-xl font-bold text-ink mb-2 font-display">{progressMsg}</h3>
        <p className="text-slate-500 max-w-md">This might take a minute or two as our AI processes the information and generates topics, study notes, flashcards, and quizzes.</p>
      </div>
    );
  }

  if (status === 'diagnostic') {
    return (
      <DiagnosticFlow 
        userId={userId} 
        topics={savedTopics} 
        onComplete={handleDiagnosticComplete} 
      />
    );
  }

  if (status === 'generating') {
    return (
      <GenerationRunner
        key={runId}
        topics={toGenerate}
        prefs={{ contentFormat: prefs.contentFormat, explanationComplexity: prefs.explanationComplexity }}
        onFinished={handleGenerationFinished}
        onContinue={handleContinueAfterGeneration}
      />
    );
  }

  return (
    <div className="bg-surface-alt rounded-[2rem] border border-border p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-ink mb-6 font-display">
        {bulk ? 'Upload Full Semester Outline' : 'Add Single Course'}
      </h2>
      {uploadError && (
        <p className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm" role="alert">{uploadError}</p>
      )}
      
      {!bulk && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Course Code (Optional)</label>
            <input 
              type="text" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              placeholder="e.g. MTH201"
              className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Course Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Calculus I"
              className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
            />
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-ink">
            {bulk ? 'Paste Course Outlines / Syllabus for multiple courses' : 'Paste Course Syllabus / Outline'}
            </label>
            <button 
                onClick={async () => {
                   if (!title && !bulk) {
                       setFindingError('Please enter a Course Title first.');
                       return;
                   }
                   const query = bulk ? prompt('What course or subjects are you looking for?') : title;
                   if (!query) return;
                   
                   setFindingCurriculum(true);
                   setFindingError('');
                   setFindingSuccess('');
                   
                   try {
                       const res = await authFetch('/api/find-curriculum', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({
                               courseName: query,
                               university: profileData?.track === 'university' ? profileData?.institution_name : undefined,
                               faculty: profileData?.track === 'university' ? profileData?.faculty : undefined,
                               courseOfStudy: profileData?.track === 'university' ? profileData?.course_of_study : undefined
                           })
                       });
                       if (!res.ok) throw await apiError(res, 'Failed to find curriculum');
                       const data = await res.json();
                       setText(data.text);
                       if (data.isReal) {
                           setFindingSuccess('Found what appears to be the official curriculum — please still verify against your department.');
                       } else {
                           setFindingSuccess('This is a general, AI-suggested curriculum, not your official one — please verify with your department before relying on it fully.');
                       }
                   } catch(e: any) {
                       setFindingError(e.message);
                   } finally {
                       setFindingCurriculum(false);
                   }
                }}
                disabled={findingCurriculum}
                className="text-sm font-bold text-accent hover:text-ink transition-colors flex items-center gap-1"
            >
                {findingCurriculum ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                I don't have it — help me find one
            </button>
        </div>
        
        {findingError && <div className="mb-3 text-xs text-red-600 bg-red-50 p-3 rounded-lg">{findingError}</div>}
        {findingSuccess && <div className="mb-3 text-xs text-ink bg-accent-warm/20 p-3 rounded-lg font-medium">{findingSuccess}</div>}
        
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste the raw text of the syllabus here..."
          className="w-full h-48 p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink resize-none"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!text.trim() || (!bulk && !title.trim())}
        className="w-full bg-ink text-white px-6 py-4 rounded-full font-bold hover:bg-ink/90 transition-colors shadow-sm disabled:opacity-50"
      >
        {bulk ? 'Process Semester' : 'Generate Course Materials'}
      </button>
    </div>
  );
}
