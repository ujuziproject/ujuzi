import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  "onNavigate?: (view: 'dashboard' | 'curricula' | 'progress' | 'profile') => void;",
  "onNavigate?: (view: 'dashboard' | 'courses' | 'flashcards' | 'quizzes' | 'planner' | 'curricula' | 'progress' | 'profile') => void;"
);

// Check if CourseDetail is imported
if (!c.includes('import CourseDetail')) {
  c = c.replace(
    "import CurriculumResults from './CurriculumResults';",
    "import CurriculumResults from './CurriculumResults';\nimport CourseDetail from './CourseDetail';"
  );
}

// Add setDashboardTopicId etc to useNavigationStore destruct
c = c.replace(
  "dashboardTopicId: initialTopicId, setDashboardTopicId: setInitialTopicId",
  "dashboardTopicId: initialTopicId, setDashboardTopicId, setDashboardCourseId, setDashboardCurriculumId"
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
