import re

with open('src/components/Progress.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, Clock, BrainCircuit, Target, BookOpen, AlertCircle } from 'lucide-react';"
import_new = "import { Loader2, Clock, BrainCircuit, Target, BookOpen, AlertCircle, Calendar } from 'lucide-react';"
content = content.replace(import_target, import_new)

state_target = "  const [weaknesses, setWeaknesses] = useState<any[]>([]);"
state_new = """  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());"""
content = content.replace(state_target, state_new)

fetch_target = """      const attempted = rankedTopics.filter(t => t.attempted).sort((a, b) => b.percent - a.percent);
      const unattempted = rankedTopics.filter(t => !t.attempted);
      
      setStrengths(attempted.slice(0, 3));
      setWeaknesses(attempted.slice().reverse().slice(0, 3));
      
      setLoading(false);
    }
    loadProgress();
  }, [userId]);"""
fetch_new = """      const attempted = rankedTopics.filter(t => t.attempted).sort((a, b) => b.percent - a.percent);
      const unattempted = rankedTopics.filter(t => !t.attempted);
      
      setStrengths(attempted.slice(0, 3));
      setWeaknesses(attempted.slice().reverse().slice(0, 3));
      
      // 5. Active Dates for Calendar
      const active = new Set<string>();
      sessions.forEach(s => {
         const date = new Date(s.started_at);
         active.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      });
      setActiveDates(active);

      setLoading(false);
    }
    loadProgress();
  }, [userId]);

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month}-${day}`;
      const isActive = activeDates.has(dateStr);
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      
      days.push(
        <div 
          key={day} 
          className={cn(
            "h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all",
            isActive ? "bg-accent text-white shadow-md shadow-accent/20" : "bg-surface text-slate-500",
            isToday && !isActive ? "border-2 border-accent text-accent" : "",
            "hover:scale-110 cursor-default"
          )}
        >
          {day}
        </div>
      );
    }
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-ink text-lg font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Study Consistency
          </h3>
          <div className="flex items-center gap-2">
             <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold">&lt;</button>
             <span className="text-sm font-bold text-ink">{monthNames[month]} {year}</span>
             <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };"""
content = content.replace(fetch_target, fetch_new)


with open('src/components/Progress.tsx', 'w') as f:
    f.write(content)
