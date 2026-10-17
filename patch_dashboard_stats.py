import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder } from 'lucide-react';"
import_new = "import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder, Target } from 'lucide-react';"
content = content.replace(import_target, import_new)

state_target = """  const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);"""
state_new = """  const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  
  // Weekly Goal
  const [weeklyGoal, setWeeklyGoal] = useState(() => parseInt(localStorage.getItem('weekly_goal') || '5', 10));
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(weeklyGoal.toString());"""
content = content.replace(state_target, state_new)

fetch_target = """    // Quizzes taken
    const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
    setTotalQuizzes(quizCount || 0);"""
fetch_new = """    // Quizzes taken
    const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
    setTotalQuizzes(quizCount || 0);
    
    // Weekly Study Minutes
    const startOfWeek = new Date();
    startOfWeek.setHours(0,0,0,0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    
    const { data: weekSessions } = await supabase.from('study_sessions')
      .select('duration_seconds')
      .eq('student_id', userId)
      .gte('started_at', startOfWeek.toISOString());
      
    let weekTotalSecs = 0;
    if (weekSessions) {
      weekSessions.forEach(s => {
        let dur = s.duration_seconds || 1800; // cap active at 30m approx
        weekTotalSecs += dur;
      });
    }
    setWeeklyMinutes(Math.round(weekTotalSecs / 60));"""
content = content.replace(fetch_target, fetch_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
