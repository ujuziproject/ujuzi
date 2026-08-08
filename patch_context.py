import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

context_code = """
export const NavigationContext = React.createContext<{
  dashboardView: 'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail';
  setDashboardView: (v: any) => void;
  dashboardCurriculumId: string | null;
  setDashboardCurriculumId: (id: string | null) => void;
  dashboardSemesterId: string | null;
  setDashboardSemesterId: (id: string | null) => void;
  dashboardCourseId: string | null;
  setDashboardCourseId: (id: string | null) => void;
  dashboardTopicId: string | undefined;
  setDashboardTopicId: (id: string | undefined) => void;
} | null>(null);

export function useNavigationStore() {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error('Missing NavigationContext');
  return ctx;
}
"""

content = content.replace("export function MainApp", context_code + "\nexport function MainApp")

mainapp_state = """  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('secondary');
"""

mainapp_state_new = """  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('secondary');
  const [dashboardView, setDashboardView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail'>('loading');
  const [dashboardCurriculumId, setDashboardCurriculumId] = useState<string | null>(null);
  const [dashboardSemesterId, setDashboardSemesterId] = useState<string | null>(null);
  const [dashboardCourseId, setDashboardCourseId] = useState<string | null>(null);
  const [dashboardTopicId, setDashboardTopicId] = useState<string | undefined>(undefined);
"""

content = content.replace(mainapp_state, mainapp_state_new)

provider_start = """  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-ink">"""

provider_start_new = """  return (
    <NavigationContext.Provider value={{
      dashboardView, setDashboardView,
      dashboardCurriculumId, setDashboardCurriculumId,
      dashboardSemesterId, setDashboardSemesterId,
      dashboardCourseId, setDashboardCourseId,
      dashboardTopicId, setDashboardTopicId
    }}>
    <div className="flex flex-col min-h-screen bg-surface font-sans text-ink">"""

content = content.replace(provider_start, provider_start_new)

provider_end = """    </div>
  );
}"""

provider_end_new = """    </div>
    </NavigationContext.Provider>
  );
}"""

content = content.replace(provider_end, provider_end_new)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

import_main = """import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder } from 'lucide-react';"""
import_main_new = """import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder } from 'lucide-react';\nimport { useNavigationStore } from './MainApp';"""

content = content.replace(import_main, import_main_new)

dashboard_state = """export function Dashboard({ name, userId, track, onNavigate }: DashboardProps & { track?: string, onNavigate?: (view: 'dashboard' | 'curricula' | 'progress' | 'profile') => void }) {
  const [view, setView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail'>('loading');
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [initialTopicId, setInitialTopicId] = useState<string | undefined>(undefined);"""

dashboard_state_new = """export function Dashboard({ name, userId, track, onNavigate }: DashboardProps & { track?: string, onNavigate?: (view: 'dashboard' | 'curricula' | 'progress' | 'profile') => void }) {
  const {
    dashboardView: view, setDashboardView: setView,
    dashboardCurriculumId: selectedCurriculumId, setDashboardCurriculumId: setSelectedCurriculumId,
    dashboardSemesterId: selectedSemesterId, setDashboardSemesterId: setSelectedSemesterId,
    dashboardCourseId: selectedCourseId, setDashboardCourseId: setSelectedCourseId,
    dashboardTopicId: initialTopicId, setDashboardTopicId: setInitialTopicId
  } = useNavigationStore();
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);"""

content = content.replace(dashboard_state, dashboard_state_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

