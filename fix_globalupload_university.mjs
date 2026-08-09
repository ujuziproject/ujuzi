import fs from 'fs';
let m = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

m = m.replace(
    "const [newGoalDate, setNewGoalDate] = useState('');",
    "const [newGoalDate, setNewGoalDate] = useState('');\n  const [newLevelYear, setNewLevelYear] = useState('1');\n  const [newSemesterNumber, setNewSemesterNumber] = useState('1');"
);

const oldUniversityFallback = `  // Secondary track or University (though university should have one created automatically, fallback if none)
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
  }`;

const newUniversityFallback = `  const handleCreateInlineSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('semesters').insert({
      student_id: userId,
      level_year: parseInt(newLevelYear, 10) || 1,
      semester_number: parseInt(newSemesterNumber, 10) || 1,
      is_current: true
    }).select('*').single();
    if (data) {
       setSemesters([data]);
       setSelectedContainer(data.id);
    }
    setLoading(false);
  };

  if (!selectedContainer && track === 'university' && semesters.length === 0) {
      return (
        <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-lg mx-auto">
           <div className="text-center mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-ink">Set your first semester</h2>
              <p className="text-sm text-slate-500 mt-2">Before adding study materials, tell us what semester you are in.</p>
           </div>
           <form onSubmit={handleCreateInlineSemester} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Level / Year</label>
                <select value={newLevelYear} onChange={e => setNewLevelYear(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent">
                   <option value="1">100 Level / 1st Year</option>
                   <option value="2">200 Level / 2nd Year</option>
                   <option value="3">300 Level / 3rd Year</option>
                   <option value="4">400 Level / 4th Year</option>
                   <option value="5">500 Level / 5th Year</option>
                   <option value="6">600 Level / 6th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                <select value={newSemesterNumber} onChange={e => setNewSemesterNumber(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent">
                   <option value="1">First Semester</option>
                   <option value="2">Second Semester</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent/90 transition-colors mt-6 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Semester & Continue'}
              </button>
           </form>
        </div>
      );
  }`;

m = m.replace(oldUniversityFallback, newUniversityFallback);
fs.writeFileSync('src/components/GlobalUploadFlow.tsx', m);
