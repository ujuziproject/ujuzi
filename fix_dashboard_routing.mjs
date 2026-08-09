import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// I will re-add CurriculumResults for 'curriculum' view
const currReturn = `<div className="w-full">
        <button onClick={() => setView('courseDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </button>
        <CurriculumResults curriculumId={selectedCurriculumId} courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />
      </div>`;

content = content.replace(
  /if \(view === 'curriculum' && selectedCurriculumId\) \{[\s\S]*?return \([\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}/,
  `if (view === 'curriculum' && (selectedCurriculumId || selectedCourseId)) {
    return (
      ${currReturn}
    );
  }`
);

// CourseDetail should trigger when view === 'courseDetail'
// Wait, currently 'courseDetail' requires 'selectedCourseId' in Dashboard
content = content.replace(
  /if \(view === 'courseDetail' && selectedCourseId\) \{/,
  "if (view === 'courseDetail' && (selectedCourseId || selectedCurriculumId)) {"
);

fs.writeFileSync('src/components/Dashboard.tsx', content);

// And in MyCourses.tsx, change handleOpenCourse to always go to courseDetail
let mc = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
mc = mc.replace("setDashboardView('curriculum'); // or courseDetail equivalent for curricula", "setDashboardView('courseDetail');");
fs.writeFileSync('src/components/MyCourses.tsx', mc);
