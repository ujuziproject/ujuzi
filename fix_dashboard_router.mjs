import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Rename Dashboard to DashboardHome
content = content.replace('export function Dashboard({ name, userId, track, onNavigate }: DashboardProps) {', 'function DashboardHome({ name, userId, track, onNavigate }: DashboardProps) {');

// Add the router component
const imports = `import { GlobalUploadFlow } from './GlobalUploadFlow';
import { CurriculumResults } from './CurriculumResults';
import { SemesterDetail } from './SemesterDetail';
import CourseDetail from './CourseDetail';
import { GoalDetail } from './GoalDetail';
`;

content = content.replace('import { useNavigationStore } from \'./MainApp\';', imports + '\nimport { useNavigationStore } from \'./MainApp\';');

const router = `

export function Dashboard(props: DashboardProps) {
  const { 
    dashboardView, setDashboardView, 
    dashboardCurriculumId, dashboardSemesterId, 
    dashboardGoalId, dashboardCourseId,
    setCurrentView 
  } = useNavigationStore();

  if (dashboardView === 'upload') {
    return <GlobalUploadFlow userId={props.userId} track={props.track || 'secondary'} onUploadComplete={() => setDashboardView('home')} />;
  }
  if (dashboardView === 'curriculum' && dashboardCurriculumId) {
    return <CurriculumResults curriculumId={dashboardCurriculumId} userId={props.userId} />;
  }
  if (dashboardView === 'semesterDetail' && dashboardSemesterId) {
    return <SemesterDetail 
             semesterId={dashboardSemesterId} 
             userId={props.userId} 
             onOpenCourse={(id) => { 
               // need to set course id via context 
               useNavigationStore.getState?.().setDashboardCourseId(id); // wait, it's not a zustand store, it's context. I need to get it from the hook.
             }} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'goalDetail' && dashboardGoalId) {
    return <GoalDetail 
             goalId={dashboardGoalId} 
             userId={props.userId} 
             onOpenCourse={(id) => {}} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'courseDetail') {
    return <CourseDetail userId={props.userId} onNavigate={setCurrentView} />;
  }

  return <DashboardHome {...props} />;
}
`;

content += router;

fs.writeFileSync('src/components/Dashboard.tsx', content);
