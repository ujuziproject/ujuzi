import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

view_type = "dashboardView: 'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail';"
view_type_new = "dashboardView: 'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail' | 'goalDetail';"
content = content.replace(view_type, view_type_new)

view_state = "const [dashboardView, setDashboardView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail'>('loading');"
view_state_new = "const [dashboardView, setDashboardView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail' | 'goalDetail'>('loading');"
content = content.replace(view_state, view_state_new)

goal_id_state = "const [dashboardSemesterId, setDashboardSemesterId] = useState<string | null>(null);"
goal_id_state_new = "const [dashboardSemesterId, setDashboardSemesterId] = useState<string | null>(null);\n  const [dashboardGoalId, setDashboardGoalId] = useState<string | null>(null);"
content = content.replace(goal_id_state, goal_id_state_new)

provider_val = "dashboardSemesterId, setDashboardSemesterId,"
provider_val_new = "dashboardSemesterId, setDashboardSemesterId,\n      dashboardGoalId, setDashboardGoalId,"
content = content.replace(provider_val, provider_val_new)

ctx_val = "dashboardSemesterId: string | null;\n  setDashboardSemesterId: (id: string | null) => void;"
ctx_val_new = "dashboardSemesterId: string | null;\n  setDashboardSemesterId: (id: string | null) => void;\n  dashboardGoalId: string | null;\n  setDashboardGoalId: (id: string | null) => void;"
content = content.replace(ctx_val, ctx_val_new)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

import_line = "import { SemesterList } from './SemesterList';"
import_line_new = "import { SemesterList } from './SemesterList';\nimport { GoalList } from './GoalList';\nimport { GoalDetail } from './GoalDetail';"
content = content.replace(import_line, import_line_new)

store_vars = "dashboardSemesterId: selectedSemesterId, setDashboardSemesterId: setSelectedSemesterId,"
store_vars_new = "dashboardSemesterId: selectedSemesterId, setDashboardSemesterId: setSelectedSemesterId,\n    dashboardGoalId: selectedGoalId, setDashboardGoalId: setSelectedGoalId,"
content = content.replace(store_vars, store_vars_new)

track_render = """        {track === 'university' ? (
          <SemesterList 
            userId={userId} 
            onOpenSemester={(id) => {
              setSelectedSemesterId(id);
              setView('semesterDetail');
            }} 
          />
        ) : ("""

track_render_new = """        {track === 'university' ? (
          <SemesterList 
            userId={userId} 
            onOpenSemester={(id) => {
              setSelectedSemesterId(id);
              setView('semesterDetail');
            }} 
          />
        ) : track === 'independent' ? (
          <GoalList 
            userId={userId} 
            onOpenGoal={(id) => {
              setSelectedGoalId(id);
              setView('goalDetail');
            }} 
          />
        ) : ("""
content = content.replace(track_render, track_render_new)

course_back = """  if (view === 'courseDetail' && selectedCourseId) {
    return (
      <div className="w-full">
        <button onClick={() => setView('semesterDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Semester
        </button>
        <CurriculumResults courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }"""

course_back_new = """  if (view === 'courseDetail' && selectedCourseId) {
    return (
      <div className="w-full">
        <button onClick={() => setView(track === 'independent' ? 'goalDetail' : 'semesterDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to {track === 'independent' ? 'Goal' : 'Semester'}
        </button>
        <CurriculumResults courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }
  
  if (view === 'goalDetail' && selectedGoalId) {
    return (
      <GoalDetail 
        goalId={selectedGoalId} 
        userId={userId} 
        onOpenCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setView('courseDetail');
        }}
        onBack={() => setView('home')}
      />
    );
  }"""
content = content.replace(course_back, course_back_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

