import React, { useState } from 'react';
import { SemesterList } from './SemesterList';
import { SemesterDetail } from './SemesterDetail';
import { CurriculumResults } from './CurriculumResults';
import { ArrowLeft } from 'lucide-react';

export function MySemesters({ userId }: { userId: string }) {
  const [view, setView] = useState<'list' | 'semesterDetail' | 'courseDetail'>('list');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  if (view === 'semesterDetail' && selectedSemesterId) {
    return (
      <SemesterDetail 
        semesterId={selectedSemesterId} 
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
        <button onClick={() => setView('semesterDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Semester
        </button>
        <CurriculumResults courseId={selectedCourseId} userId={userId} />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <SemesterList 
        userId={userId} 
        onOpenSemester={(id) => {
          setSelectedSemesterId(id);
          setView('semesterDetail');
        }} 
      />
    </div>
  );
}
