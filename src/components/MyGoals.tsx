import React, { useState } from 'react';
import { GoalList } from './GoalList';
import { GoalDetail } from './GoalDetail';
import { CurriculumResults } from './CurriculumResults';
import { ArrowLeft } from 'lucide-react';

export function MyGoals({ userId }: { userId: string }) {
  const [view, setView] = useState<'list' | 'goalDetail' | 'courseDetail'>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  if (view === 'goalDetail' && selectedGoalId) {
    return (
      <GoalDetail 
        goalId={selectedGoalId} 
        userId={userId} 
        onOpenCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setView('courseDetail');
        }}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'courseDetail' && selectedCourseId) {
    return (
      <div className="w-full">
        <button onClick={() => setView('goalDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Goal
        </button>
        <CurriculumResults courseId={selectedCourseId} userId={userId} />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <GoalList 
        userId={userId} 
        onOpenGoal={(id) => {
          setSelectedGoalId(id);
          setView('goalDetail');
        }} 
      />
    </div>
  );
}
