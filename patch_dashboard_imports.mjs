import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!content.includes('import CourseDetail')) {
  content = content.replace(
    "import CurriculumResults from './CurriculumResults';",
    "import CurriculumResults from './CurriculumResults';\nimport CourseDetail from './CourseDetail';"
  );
}

// Replace rendering of CurriculumResults in courseDetail and curriculum views
content = content.replace(
  /<CurriculumResults courseId=\{selectedCourseId\} userId=\{userId\} initialTopicId=\{initialTopicId\} \/>/g,
  '<CourseDetail userId={userId} onNavigate={onNavigate || setView} />'
);

content = content.replace(
  /<CurriculumResults curriculumId=\{selectedCurriculumId\} userId=\{userId\} initialTopicId=\{initialTopicId\} \/>/g,
  '<CourseDetail userId={userId} onNavigate={onNavigate || setView} />'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
