import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Subheading
content = content.replace(
    "Here's how your learning portfolio is performing today.",
    "Here's how your learning is going today."
)

# 2. Buttons
content = content.replace(
    '<Download className="w-4 h-4" /> Statement',
    '<TrendingUp className="w-4 h-4" /> Progress Report'
)
content = content.replace(
    '+ Invest Now',
    '+ Upload Curriculum'
)

# 3. Hero Badges
# Remove: <span className="bg-[#1A3B2B] text-success text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">+ {curricula.length > 0 ? '100' : '0.0'}% ALL TIME</span>
content = re.sub(
    r'<span className="bg-\[#1A3B2B\][^>]*>\+ \{curricula\.length > 0 \? \'100\' : \'0\.0\'\}% ALL TIME</span>',
    '',
    content
)

# Remove '+' in Quizzes Taken
content = content.replace(
    '<span className="text-2xl font-black font-display text-success">+ {totalQuizzes}</span>',
    '<span className="text-2xl font-black font-display text-success">{totalQuizzes}</span>'
)

# 4. Asset Allocation -> Topic Mastery
old_allocation = """<div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 block font-display">Asset Allocation</span>
          <div className="flex gap-2 h-[4.5rem] mb-8 w-full">
            <div className="bg-[#FFF0F4] rounded-xl flex-1"></div>
            <div className="bg-[#EEF4D4] rounded-xl flex-1"></div>
          </div>
          <div className="space-y-5 flex-1">
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#FFE4EC]"></div> Halal Equity</div>
              <span className="text-slate-600 font-medium">50%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#EEF4D4]"></div> FIF (Fixed Income)</div>
              <span className="text-slate-600 font-medium">50%</span>
            </div>
          </div>
        </div>"""

new_allocation = """<div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 block font-display">Topic Mastery</span>
          <div className="flex gap-2 h-[4.5rem] mb-8 w-full overflow-hidden">
            {masteryStats.mastered > 0 && <div className="bg-success rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.mastered}%` }}></div>}
            {masteryStats.inProgress > 0 && <div className="bg-accent-warm rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.inProgress}%` }}></div>}
            {masteryStats.notStarted > 0 && <div className="bg-slate-100 rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.notStarted}%` }}></div>}
            {masteryStats.mastered === 0 && masteryStats.inProgress === 0 && masteryStats.notStarted === 0 && <div className="bg-slate-100 rounded-xl flex-1"></div>}
          </div>
          <div className="space-y-5 flex-1">
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-success"></div> Mastered</div>
              <span className="text-slate-600 font-medium">{masteryStats.mastered}%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-accent-warm"></div> In Progress</div>
              <span className="text-slate-600 font-medium">{masteryStats.inProgress}%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Not Started</div>
              <span className="text-slate-600 font-medium">{masteryStats.notStarted}%</span>
            </div>
          </div>
        </div>"""

if old_allocation in content:
    content = content.replace(old_allocation, new_allocation)
else:
    print("Could not find old allocation snippet")

# 5. My Funds -> My Curricula
content = content.replace(
    '<h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Funds</h2>',
    '<h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Curricula</h2>'
)
content = content.replace(
    '<h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Active Funds</h3>',
    '<h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Active Curricula</h3>'
)
content = content.replace(
    "You don't have any active investments yet. Add funds to start growing your wealth.",
    "You haven't uploaded any curricula yet. Add your first syllabus to get started."
)
content = content.replace(
    '+ Add Funds',
    '+ Add Curriculum'
)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
