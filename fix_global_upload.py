import re

with open('src/components/GlobalUploadFlow.tsx', 'r') as f:
    content = f.read()

# We need to replace the "You need to create a Goal first..." block with an inline goal creation form for independent learners.
# For secondary track, they should just go straight to uploadType selection.

replacement = """
  const handleCreateInlineGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('learning_goals').insert({
      student_id: userId,
      goal_title: newGoalTitle,
      category: newGoalCategory,
      target_date: newGoalDate || null
    }).select('*').single();
    if (data) {
       setGoals([data]);
       setSelectedContainer(data.id);
    }
    setLoading(false);
  };

  if (!selectedContainer && track === 'independent' && goals.length === 0) {
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-lg mx-auto">
         <div className="text-center mb-6">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-ink">Set your first goal</h2>
            <p className="text-sm text-slate-500 mt-2">Before adding study materials, tell us what you're working towards.</p>
         </div>
         <form onSubmit={handleCreateInlineGoal} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Title</label>
              <input type="text" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} required className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" placeholder="e.g. Pass AWS Solutions Architect" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category (Optional)</label>
              <input type="text" value={newGoalCategory} onChange={e => setNewGoalCategory(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" placeholder="e.g. Cloud Certification" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Date (Optional)</label>
              <input type="date" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent/90 transition-colors mt-6 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Goal & Continue'}
            </button>
         </form>
      </div>
    );
  }

  // Secondary track or University (though university should have one created automatically, fallback if none)
  if (!selectedContainer && track !== 'secondary' && track !== 'independent') {
      return (
          <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in text-center">
              <p className="text-slate-500 mb-4 font-medium">You need to create a {track === 'university' ? 'Semester' : 'Goal'} first before adding materials.</p>
              <button 
                onClick={() => {
                  setCurrentView('courses');
                  setDashboardView('home');
                }}
                className="bg-accent text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                Go to Courses <ArrowUpRight className="w-4 h-4" />
              </button>
          </div>
      );
  }
"""

content = content.replace("  const [uploadType, setUploadType] = useState<'single' | 'bulk' | null>(null);", "  const [uploadType, setUploadType] = useState<'single' | 'bulk' | null>(null);\n  const [newGoalTitle, setNewGoalTitle] = useState('');\n  const [newGoalCategory, setNewGoalCategory] = useState('');\n  const [newGoalDate, setNewGoalDate] = useState('');")

old_block = r"""  if \(!selectedContainer && track !== 'secondary'\) \{[\s\S]*?return \([\s\S]*?\}\);[\s\S]*?\}"""
content = re.sub(old_block, replacement, content)

with open('src/components/GlobalUploadFlow.tsx', 'w') as f:
    f.write(content)

