import re

with open('src/components/Progress.tsx', 'r') as f:
    content = f.read()

target = """      if (bottomAttempted.length < 3) {
          const needed = 3 - bottomAttempted.length;
          const toAdd = unattempted.slice(0, needed);
          setWeaknesses([...bottomAttempted, ...toAdd]);
      } else {
          setWeaknesses(bottomAttempted);
      }

      setLoading(false);
    }
    loadProgress();
  }, [userId]);"""
replacement = """      if (bottomAttempted.length < 3) {
          const needed = 3 - bottomAttempted.length;
          const toAdd = unattempted.slice(0, needed);
          setWeaknesses([...bottomAttempted, ...toAdd]);
      } else {
          setWeaknesses(bottomAttempted);
      }

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
content = content.replace(target, replacement)

with open('src/components/Progress.tsx', 'w') as f:
    f.write(content)
