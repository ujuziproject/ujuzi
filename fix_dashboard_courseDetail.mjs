import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const regex = /if \(view === 'courseDetail' && \(selectedCourseId \|\| selectedCurriculumId\)\) \{[\s\S]*?return \([\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}/;
content = content.replace(regex, 
`if (view === 'courseDetail' && (selectedCourseId || selectedCurriculumId)) {
    return (
      <CourseDetail userId={userId} onNavigate={onNavigate || setView} />
    );
  }`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
