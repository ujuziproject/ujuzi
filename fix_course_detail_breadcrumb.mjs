import fs from 'fs';

let content = fs.readFileSync('src/components/CourseDetail.tsx', 'utf-8');

content = content.replace(
  "onClick={() => onNavigate('dashboard')}",
  "onClick={() => { onNavigate('dashboard'); setDashboardView('home'); }}"
);

fs.writeFileSync('src/components/CourseDetail.tsx', content);
