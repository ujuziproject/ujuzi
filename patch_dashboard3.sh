#!/bin/bash
sed -i -e '/if (view === '"'"'curriculum'"'"' && selectedCurriculumId) {/i \
  if (view === '"'"'semesterDetail'"'"' && selectedSemesterId) {\
    return (\
      <SemesterDetail \
        semesterId={selectedSemesterId} \
        userId={userId} \
        onOpenCourse={(courseId) => {\
          setSelectedCourseId(courseId);\
          setView('"'"'courseDetail'"'"');\
        }}\
        onBack={() => setView('"'"'home'"'"')}\
      />\
    );\
  }\
  if (view === '"'"'courseDetail'"'"' && selectedCourseId) {\
    return (\
      <div className="w-full">\
        <button onClick={() => setView('"'"'semesterDetail'"'"')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">\
          <ArrowLeft className="w-4 h-4" /> Back to Semester\
        </button>\
        <CurriculumResults courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />\
      </div>\
    );\
  }\
' src/components/Dashboard.tsx
