import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldRouter = /export function Dashboard\(props: DashboardProps\) \{[\s\S]*\}\n$/;
const newRouter = `export function Dashboard(props: DashboardProps) {
  const { 
    dashboardView, setDashboardView, 
    dashboardCurriculumId, dashboardSemesterId, 
    dashboardGoalId, dashboardCourseId,
    setDashboardCourseId,
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
               setDashboardCourseId(id);
               setDashboardView('courseDetail');
             }} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'goalDetail' && dashboardGoalId) {
    return <GoalDetail 
             goalId={dashboardGoalId} 
             userId={props.userId} 
             onOpenCourse={(id) => {
               setDashboardCourseId(id);
               setDashboardView('courseDetail');
             }} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'courseDetail') {
    return <CourseDetail userId={props.userId} onNavigate={setCurrentView} />;
  }

  return <DashboardHome {...props} />;
}`;

content = content.replace(oldRouter, newRouter);

// Fix the "Add your first course" button to use setDashboardView('upload') instead of setCurrentView('upload')
content = content.replace(/setCurrentView\('upload'\)/g, "setDashboardView('upload')");

fs.writeFileSync('src/components/Dashboard.tsx', content);
