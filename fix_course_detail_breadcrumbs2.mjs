import fs from 'fs';

let content = fs.readFileSync('src/components/CourseDetail.tsx', 'utf-8');

content = content.replace(
  "onClick={() => onNavigate('courses')}",
  "onClick={() => { onNavigate('courses'); setDashboardView('home'); }}"
);

fs.writeFileSync('src/components/CourseDetail.tsx', content);
