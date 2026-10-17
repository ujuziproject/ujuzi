import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """      {/* Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Black Card */}
        <div className="col-span-1 lg:col-span-2 bg-ink rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-sm">"""
replacement = """      {/* Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Black Card */}
        <div className="col-span-1 lg:col-span-2 bg-ink rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-sm">"""
content = content.replace(target, replacement)

target2 = """          </div>
        </div>
      </div>

      {/* Recent Activity List */}"""
replacement2 = """          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px] items-center justify-center text-center">
          <div className="flex justify-between items-center w-full mb-4">
             <span className="text-slate-500 text-xs font-bold uppercase tracking-widest font-display">Weekly Goal</span>
             <button onClick={() => setEditingGoal(!editingGoal)} className="text-xs text-accent font-bold hover:underline">
               {editingGoal ? 'Save' : 'Edit'}
             </button>
          </div>
          
          {editingGoal ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <label className="text-sm font-bold text-ink mb-2">Target Hours</label>
              <input 
                type="number" 
                value={tempGoal} 
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-24 text-center text-3xl font-black font-display p-2 border-b-2 border-ink focus:outline-none mb-4"
              />
              <button 
                onClick={() => {
                   const val = parseInt(tempGoal, 10);
                   if (!isNaN(val) && val > 0) {
                      setWeeklyGoal(val);
                      localStorage.setItem('weekly_goal', val.toString());
                   }
                   setEditingGoal(false);
                }}
                className="bg-ink text-white px-4 py-2 rounded-full text-sm font-bold w-full"
              >
                Save Goal
              </button>
            </div>
          ) : (
            <div className="relative flex items-center justify-center flex-1 w-full flex-col">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-accent transition-all duration-1000 ease-out"
                    strokeDasharray="251.2"
                    strokeDashoffset={Math.max(0, 251.2 - (251.2 * Math.min(weeklyMinutes, weeklyGoal * 60) / (weeklyGoal * 60)))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-display text-ink">{Math.round((weeklyMinutes / (weeklyGoal * 60)) * 100)}%</span>
                </div>
              </div>
              <div className="text-sm font-bold text-ink">
                {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}m <span className="text-slate-400 font-medium">/ {weeklyGoal}h</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity List */}"""
content = content.replace(target2, replacement2)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
