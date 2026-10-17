import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

const imports = `import { GlobalUploadFlow } from './GlobalUploadFlow';
import { CurriculumResults } from './CurriculumResults';
import { SemesterDetail } from './SemesterDetail';
import CourseDetail from './CourseDetail';
import { GoalDetail } from './GoalDetail';
`;

content = content.replace("import MyCourses from './MyCourses';", imports + "import MyCourses from './MyCourses';");

const oldMain = `<main className="flex-1 p-8 max-w-[1240px] w-full">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
          {currentView === 'courses' && <MyCourses userId={userId} onNavigate={setCurrentView} />}
          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
          
          {currentView === 'progress' && <Progress userId={userId} />}
          {currentView === 'profile' && <Profile userId={userId} />}
        </main>`;

const newMain = `<main className="flex-1 p-8 max-w-[1240px] w-full">
          {dashboardView === 'upload' && <GlobalUploadFlow userId={userId} track={track || 'secondary'} onUploadComplete={() => setDashboardView('home')} />}
          
          {dashboardView === 'curriculum' && (
            <CurriculumResults 
              curriculumId={dashboardCurriculumId || undefined} 
              courseId={dashboardCourseId || undefined} 
              initialTopicId={dashboardTopicId || undefined} 
              userId={userId} 
              onBack={() => setDashboardView('courseDetail')}
            />
          )}
          
          {dashboardView === 'semesterDetail' && dashboardSemesterId && (
            <SemesterDetail 
              semesterId={dashboardSemesterId} 
              userId={userId} 
              onOpenCourse={(id) => { 
                setDashboardCourseId(id); 
                setDashboardView('courseDetail'); 
              }} 
              onBack={() => setDashboardView('home')} 
            />
          )}
          
          {dashboardView === 'goalDetail' && dashboardGoalId && (
             <GoalDetail 
              goalId={dashboardGoalId} 
              userId={userId} 
              onOpenCourse={(id) => { 
                setDashboardCourseId(id); 
                setDashboardView('courseDetail'); 
              }} 
              onBack={() => setDashboardView('home')} 
            />
          )}
          
          {dashboardView === 'courseDetail' && <CourseDetail userId={userId} onNavigate={setCurrentView} />}

          {(dashboardView === 'home' || dashboardView === 'loading') && (
            <>
              {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
              {currentView === 'courses' && <MyCourses userId={userId} onNavigate={setCurrentView} />}
              {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
              {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
              {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
              {currentView === 'progress' && <Progress userId={userId} />}
              {currentView === 'profile' && <Profile userId={userId} />}
            </>
          )}
        </main>`;

content = content.replace(oldMain, newMain);

fs.writeFileSync('src/components/MainApp.tsx', content);

let dashboardContent = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
const dashboardRouterRegex = /export function Dashboard\(props: DashboardProps\) \{[\s\S]*\}\n$/;
dashboardContent = dashboardContent.replace(dashboardRouterRegex, 'export function Dashboard(props: DashboardProps) {\n  return <DashboardHome {...props} />;\n}\n');
fs.writeFileSync('src/components/Dashboard.tsx', dashboardContent);

let myCoursesContent = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
myCoursesContent = myCoursesContent.replace("onNavigate('dashboard');", "");
fs.writeFileSync('src/components/MyCourses.tsx', myCoursesContent);

