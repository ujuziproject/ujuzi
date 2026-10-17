import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

content = content.replace(
  'dashboardGoalId, dashboardCourseId,',
  'dashboardGoalId, dashboardCourseId, dashboardTopicId,'
);

content = content.replace(
  "if (dashboardView === 'curriculum' && dashboardCurriculumId) {\n    return <CurriculumResults curriculumId={dashboardCurriculumId} userId={props.userId} />;\n  }",
  "if (dashboardView === 'curriculum') {\n    return <CurriculumResults curriculumId={dashboardCurriculumId || undefined} courseId={dashboardCourseId || undefined} initialTopicId={dashboardTopicId || undefined} userId={props.userId} />;\n  }"
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
