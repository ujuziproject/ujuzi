import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Search } from 'lucide-react';

export function CourseUpload({ userId, semesterId, goalId, bulk, onUploadComplete }: { userId: string, semesterId?: string, goalId?: string, bulk: boolean, onUploadComplete: () => void }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [prefs, setPrefs] = useState<{contentFormat?: string, explanationComplexity?: string}>({});
  const [findingCurriculum, setFindingCurriculum] = useState(false);
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

  const generateMaterialsForTopic = async (topic: any) => {
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
      
      if (matRes.ok) {
        const { result: materials } = await matRes.json();
        
        if (materials.lecture_notes) {
          await supabase.from('lecture_notes').insert({ topic_id: topic.id, content: materials.lecture_notes });
        }
        
        if (materials.flashcards && materials.flashcards.length > 0) {
          const fcInserts = materials.flashcards.map((fc: any) => ({ topic_id: topic.id, question: fc.question, answer: fc.answer }));
          await supabase.from('flashcards').insert(fcInserts);
        }
        
        if (materials.quiz && materials.quiz.length > 0) {
          const { data: quizData } = await supabase.from('quizzes').insert({ topic_id: topic.id, title: `${topic.title} Quiz` }).select().single();
          if (quizData) {
            const qInserts = materials.quiz.map((q: any, i: number) => ({
              quiz_id: quizData.id, question_text: q.question_text, options: q.options || [], correct_answer: q.correct_answer, explanation: q.explanation, order_index: i
            }));
            await supabase.from('quiz_questions').insert(qInserts);
          }
        }
      }
    } catch (err) {
      console.warn("Failed material generation for topic", topic.id, err);
    }
  };

  const handleUpload = async () => {
    if (!text.trim() || (!bulk && !title.trim())) return;
    setStatus('parsing');
    
    try {
      if (bulk) {
        setProgressMsg('Identifying courses...');
        const res = await fetch('/api/extract-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!res.ok) throw new Error('Bulk parse failed');
        const { result: parsedCourses } = await res.json();
        
        setProgressMsg(`Found ${parsedCourses.length} courses. Generating...`);
        let completedTopics = 0;

        for (const pc of parsedCourses) {
          const { data: course } = await supabase.from('courses').insert({
            semester_id: semesterId,
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
            const { data: savedTopics } = await supabase.from('topics').insert(topicInserts).select();
            
            if (savedTopics) {
              for (const topic of savedTopics) {
                completedTopics++;
                setProgressMsg(`Generating materials for topic ${completedTopics}...`);
                await generateMaterialsForTopic(topic);
              }
            }
            await supabase.from('courses').update({ status: 'parsed' }).eq('id', course.id);
          }
        }
        
      } else {
        setProgressMsg('Extracting topics from course outline...');
        const extractRes = await fetch('/api/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `Course: ${title}\n\n${text}` })
        });
        if (!extractRes.ok) throw new Error('Topic extraction failed');
        const { result: extractedTopics } = await extractRes.json();

        const { data: course } = await supabase.from('courses').insert({
          semester_id: semesterId,
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
          const { data: savedTopics } = await supabase.from('topics').insert(topicInserts).select();
          
          if (savedTopics) {
            for (let i = 0; i < savedTopics.length; i++) {
              setProgressMsg(`Generating materials for topic ${i + 1} of ${savedTopics.length}...`);
              await generateMaterialsForTopic(savedTopics[i]);
            }
          }
          await supabase.from('courses').update({ status: 'parsed' }).eq('id', course.id);
        }
      }
      
      onUploadComplete();
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  if (status === 'parsing') {
    return (
      <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
        <h3 className="text-xl font-bold text-ink mb-2 font-display">{progressMsg}</h3>
        <p className="text-slate-500 max-w-md">This might take a minute or two as our AI processes the information and generates topics, study notes, flashcards, and quizzes.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-alt rounded-[2rem] border border-border p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-ink mb-6 font-display">
        {bulk ? 'Upload Full Semester Outline' : 'Add Single Course'}
      </h2>
      
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
                       const res = await fetch('/api/find-curriculum', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({
                               courseName: query,
                               university: profileData?.track === 'university' ? profileData?.institution_name : undefined,
                               faculty: profileData?.track === 'university' ? profileData?.faculty : undefined,
                               courseOfStudy: profileData?.track === 'university' ? profileData?.course_of_study : undefined
                           })
                       });
                       if (!res.ok) throw new Error('Failed to find curriculum');
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
