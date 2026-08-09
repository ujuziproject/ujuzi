import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
c = c.replace(
  /onClick=\{\(\) => \{\n                        onNavigate && onNavigate\('courses'\);\n                     \}\}/g,
  `onClick={() => {
                        setDashboardCurriculumId(c.id);
                        setDashboardCourseId(c.id);
                        setView('courseDetail');
                     }}`
);
fs.writeFileSync('src/components/Dashboard.tsx', c);
