import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, BookOpen, Layers, CheckSquare, ArrowLeft, Edit2, Clock, CheckCircle2 } from 'lucide-react';
import { recordStudySession, endStudySession, saveSessionReflection } from '../lib/tracking';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { QuizTaker } from './QuizTaker';
import { FlashcardReviewer } from './FlashcardReviewer';
import { Topic, LectureNote, Flashcard, Quiz, QuizQuestion } from '../types';

interface CurriculumResultsProps {
  curriculumId?: string;
  courseId?: string;
  userId: string;
  initialTopicId?: string;
}



const cache = new Map<string, { topics: Topic[], stats: any, streak: number }>();
const topicCache = new Map<string, { notes: any, flashcards: any[], quizQuestions: any[] }>();


export function CurriculumResults({ curriculumId, courseId, userId, initialTopicId }: CurriculumResultsProps) {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [topicStats, setTopicStats] = useState<Record<string, { bestScore: number | null, totalQuestions: number, flashcardsDue: number }>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      const cacheKey = `${curriculumId || ''}-${courseId || ''}-${userId}`;
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        setTopics(cached.topics);
        setTopicStats(cached.stats);
        setStreak(cached.streak);
        if (refreshKey === 0) setLoading(false);
        // Fetch in background to update
        fetchData(cacheKey);
        return;
      }
      setLoading(true);
      await fetchData(cacheKey);
    }
    
    async function fetchData(cacheKey: string) {
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('student_id', userId)
        .maybeSingle();
      if (streakData) setStreak(streakData.current_streak);

      // Fetch topics
      let query = supabase.from('topics').select('*').order('order_index');
      if (courseId) {
        query = query.eq('course_id', courseId);
      } else if (curriculumId) {
        query = query.eq('curriculum_id', curriculumId);
      }
      const { data, error } = await query;
        
      if (!error && data) {
        setTopics(data);
        
        if (initialTopicId) {
          const initial = data.find(t => t.id === initialTopicId);
          if (initial) setSelectedTopic(initial);
        }
        
        // Fetch stats for these topics
        const stats: Record<string, { bestScore: number | null, totalQuestions: number, flashcardsDue: number }> = {};
        
        const topicIds = data.map(t => t.id);

        if (topicIds.length > 0) {
          // 1. Fetch all flashcards for these topics
          const { data: allFlashcards } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', topicIds);
          const flashcards = allFlashcards || [];
          
          // 2. Fetch all reviews for these flashcards
          const fcIds = flashcards.map(f => f.id);
          const { data: allReviews } = fcIds.length > 0 
            ? await supabase.from('flashcard_reviews').select('flashcard_id, next_review_date').eq('student_id', userId).in('flashcard_id', fcIds)
            : { data: [] };
          const reviewMap = new Map((allReviews || []).map(r => [r.flashcard_id, r.next_review_date]));
          const today = new Date().toISOString().split('T')[0];

          // 3. Fetch all quizzes
          const { data: allQuizzes } = await supabase.from('quizzes').select('id, topic_id').in('topic_id', topicIds);
          const quizzes = allQuizzes || [];
          const quizIds = quizzes.map(q => q.id);

          // 4. Fetch all quiz attempts
          const { data: allAttempts } = quizIds.length > 0
            ? await supabase.from('quiz_attempts').select('quiz_id, score, total_questions').eq('student_id', userId).in('quiz_id', quizIds)
            : { data: [] };
          const attemptsMap = new Map<string, any[]>();
          for (const a of (allAttempts || [])) {
            if (!attemptsMap.has(a.quiz_id)) attemptsMap.set(a.quiz_id, []);
            attemptsMap.get(a.quiz_id)!.push(a);
          }

          // Compute stats
          for (const t of data) {
            stats[t.id] = { bestScore: null, totalQuestions: 0, flashcardsDue: 0 };
            
            // Flashcards
            const tFlashcards = flashcards.filter(f => f.topic_id === t.id);
            if (tFlashcards.length > 0) {
              const dueCount = tFlashcards.filter(f => {
                const nextDate = reviewMap.get(f.id);
                return !nextDate || nextDate <= today;
              }).length;
              stats[t.id].flashcardsDue = dueCount;
            }

            // Quizzes
            const tQuiz = quizzes.find(q => q.topic_id === t.id);
            if (tQuiz) {
              const attempts = attemptsMap.get(tQuiz.id) || [];
              if (attempts.length > 0) {
                attempts.sort((a, b) => b.score - a.score);
                stats[t.id].bestScore = attempts[0].score;
                stats[t.id].totalQuestions = attempts[0].total_questions;
              }
            }
          }
        }
        
        setTopicStats(stats);
        cache.set(cacheKey, { topics: data || [], stats, streak: streakData?.current_streak || 0 });
      }
      setLoading(false);
    }
    loadData();
  }, [curriculumId, courseId, userId, refreshKey]);

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500 w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 w-96 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse h-[160px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <TopicView 
        topic={selectedTopic} 
        userId={userId}
        onBack={() => {
          setSelectedTopic(null);
          // Reload data to update stats in background without blocking UI
          setRefreshKey(prev => prev + 1);
        }} 
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Your Study Plan</h2>
          <p className="text-slate-500">We broke your curriculum down into {topics.length} topics. Tap one to start studying.</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 text-accent-warm px-4 py-2 rounded-full font-bold shadow-sm border border-orange-100">
            🔥 {streak} day streak
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic, i) => {
          const stats = topicStats[topic.id];
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="flex flex-col text-left p-6 bg-surface-alt rounded-2xl border border-border hover:border-accent/50 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Topic {i + 1}</span>
                {stats && (
                  <div className="flex gap-2">
                    {stats.flashcardsDue > 0 && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        {stats.flashcardsDue} cards due
                      </span>
                    )}
                    {stats.bestScore !== null && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Best: <span className="font-mono">{stats.bestScore}</span>/<span className="font-mono">{stats.totalQuestions}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-ink mb-1 flex items-center gap-2 group/h3">
                 {topic.title}
                 <div 
                    onClick={async (e) => {
                       e.stopPropagation();
                       const newTitle = prompt('Rename topic:', topic.title);
                       if (newTitle && newTitle.trim() !== '') {
                          await supabase.from('topics').update({ title: newTitle }).eq('id', topic.id);
                          topic.title = newTitle;
                          setRefreshKey(k => k + 1);
                       }
                    }}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink opacity-0 group-hover/h3:opacity-100 transition-opacity"
                 >
                    <Edit2 className="w-3.5 h-3.5" />
                 </div>
              </h3>
              {topic.description && (
                <p className="text-sm text-slate-500 line-clamp-2">{topic.description}</p>
              )}
              <div className="mt-4 flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center text-xs font-semibold text-slate-600"><BookOpen className="w-3.5 h-3.5 mr-1" /> Notes</span>
                <span className="flex items-center text-xs font-semibold text-slate-600"><Layers className="w-3.5 h-3.5 mr-1" /> Cards</span>
                <span className="flex items-center text-xs font-semibold text-slate-600"><CheckSquare className="w-3.5 h-3.5 mr-1" /> Quiz</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopicView({ topic, userId, onBack }: { topic: Topic, userId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<LectureNote | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
       setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let currentSessionId: string | null = null;
    
    async function startSession() {
      const id = await recordStudySession(userId, topic.id, activeTab);
      currentSessionId = id;
      setSessionId(id);
    }
    
    startSession();
    setElapsedSeconds(0);
    
    return () => {
      if (currentSessionId) {
        endStudySession(currentSessionId);
      }
    };
  }, [activeTab, topic.id, userId]);

  useEffect(() => {
    async function fetchMaterials() {
      const cacheKey = `${topic.id}-${userId}`;
      if (topicCache.has(cacheKey)) {
        const cached = topicCache.get(cacheKey)!;
        setNotes(cached.notes);
        setFlashcards(cached.flashcards);
        setQuizQuestions(cached.quizQuestions);
        setLoading(false);
        // fetch in background
        fetchData(cacheKey);
        return;
      }
      setLoading(true);
      await fetchData(cacheKey);
    }
    
    async function fetchData(cacheKey: string) {
      const [nRes, fcRes, qzRes] = await Promise.all([
        supabase.from('lecture_notes').select('*').eq('topic_id', topic.id).maybeSingle(),
        supabase.from('flashcards').select('*').eq('topic_id', topic.id),
        supabase.from('quizzes').select('*').eq('topic_id', topic.id).maybeSingle()
      ]);
      
      setNotes(nRes.data);
      setFlashcards(fcRes.data || []);
      
      let qData = null;
      if (qzRes.data) {
        const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', qzRes.data.id).order('order_index');
        qData = data;
        setQuizQuestions(data || []);
      }
      
      topicCache.set(cacheKey, { notes: nRes.data, flashcards: fcRes.data || [], quizQuestions: qData || [] });
      setLoading(false);
    }
    fetchMaterials();
  }, [topic.id]);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-surface-alt px-3 py-1.5 rounded-full border border-border shadow-sm">
            <Clock className="w-4 h-4 text-accent" />
            <span className="font-mono">{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <button 
            onClick={() => {
              if (sessionId) {
                endStudySession(sessionId);
                setCompletedSessionId(sessionId);
                setShowReflection(true);
              }
            }}
            className="text-sm font-bold bg-ink text-white px-4 py-1.5 rounded-full shadow-sm hover:bg-ink/90 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
      
      {showReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-alt rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-ink mb-2">Session Complete!</h3>
            <p className="text-sm text-slate-500 mb-6">Take a moment to jot down quick reflective notes about what you just studied.</p>
            <textarea
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="e.g. I struggled with the third formula, need to review it tomorrow..."
              className="w-full h-32 p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent text-sm resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowReflection(false);
                  setReflectionText('');
                  onBack();
                }}
                className="px-5 py-2.5 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
              >
                Skip
              </button>
              <button 
                onClick={async () => {
                  if (completedSessionId && reflectionText.trim()) {
                    await saveSessionReflection(completedSessionId, reflectionText.trim());
                  }
                  setShowReflection(false);
                  setReflectionText('');
                  onBack();
                }}
                className="px-5 py-2.5 rounded-full font-bold bg-accent text-white hover:bg-accent/90 shadow-md transition-colors text-sm"
              >
                Save Note & Close
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="bg-surface-alt rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-surface">
          <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">{topic.subject_name}</span>
          <h2 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2 group/title">
             {topic.title}
             <button 
                onClick={async () => {
                   const newTitle = prompt('Rename topic:', topic.title);
                   if (newTitle && newTitle.trim() !== '') {
                      await supabase.from('topics').update({ title: newTitle }).eq('id', topic.id);
                      topic.title = newTitle; // Update local state immediately
                      // Just let the DOM update naturally or we rely on parent update if needed.
                   }
                }}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-ink opacity-0 group-hover/title:opacity-100 transition-opacity"
             >
                <Edit2 className="w-4 h-4" />
             </button>
          </h2>
          <p className="text-slate-600">{topic.description}</p>
        </div>

        <div className="flex border-b border-border bg-surface-alt px-2">
          <button 
            onClick={() => setActiveTab('notes')}
            className={cn("px-6 py-4 text-sm font-semibold border-b-2 transition-colors", activeTab === 'notes' ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-ink/80")}
          >
            Lecture Notes
          </button>
          <button 
            onClick={() => setActiveTab('flashcards')}
            className={cn("px-6 py-4 text-sm font-semibold border-b-2 transition-colors", activeTab === 'flashcards' ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-ink/80")}
          >
            Flashcards
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={cn("px-6 py-4 text-sm font-semibold border-b-2 transition-colors", activeTab === 'quiz' ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-ink/80")}
          >
            Practice Quiz
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1 bg-surface-alt">
          {loading ? (
            <div className="animate-in fade-in duration-500">
              <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'notes' && (
                <div className="prose prose-slate prose-accent max-w-none">
                  {notes ? (
                    <Markdown>{notes.content}</Markdown>
                  ) : (
                    <p className="text-slate-500 italic">No notes generated for this topic yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="w-full">
                  {flashcards.length > 0 ? (
                    <FlashcardReviewer userId={userId} flashcards={flashcards} />
                  ) : (
                    <p className="text-slate-500 italic text-center py-12">No flashcards generated.</p>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="w-full">
                  {quizQuestions.length > 0 ? (
                    <QuizTaker userId={userId} quizId={quizQuestions[0].quiz_id} questions={quizQuestions} />
                  ) : (
                    <p className="text-slate-500 italic text-center py-12">No quiz questions generated.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

