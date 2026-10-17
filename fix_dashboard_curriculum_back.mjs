import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldReturn = "return <CurriculumResults curriculumId={dashboardCurriculumId || undefined} courseId={dashboardCourseId || undefined} initialTopicId={dashboardTopicId || undefined} userId={props.userId} />;";
const newReturn = "return <CurriculumResults \n      curriculumId={dashboardCurriculumId || undefined} \n      courseId={dashboardCourseId || undefined} \n      initialTopicId={dashboardTopicId || undefined} \n      userId={props.userId} \n      onBack={() => setDashboardView('courseDetail')}\n    />;";

content = content.replace(oldReturn, newReturn);

fs.writeFileSync('src/components/Dashboard.tsx', content);
