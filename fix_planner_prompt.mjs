import fs from 'fs';

let content = fs.readFileSync('src/components/Planner.tsx', 'utf-8');

const newComponentStart = `export function Planner({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [showAdd, setShowAdd] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  
  const [track, setTrack] = useState<string>('');
  const [needsDatePrompt, setNeedsDatePrompt] = useState<{ type: string, id: string } | null>(null);
  const [targetDateInput, setTargetDateInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkPacingStatus();
  }, [userId]);

  const checkPacingStatus = async () => {
    const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
    if (!profile) return;
    setTrack(profile.track || 'secondary');
    
    // Check if we need a date
    if (profile.track === 'university') {
      const { data: sems } = await supabase.from('semesters').select('id, target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).limit(1);
      if (sems && sems.length > 0) {
         if (!sems[0].target_end_date) {
            setNeedsDatePrompt({ type: 'semester', id: sems[0].id });
         } else {
            // Also check if plan needs generating
            const { data: items } = await supabase.from('planner_items').select('id').eq('student_id', userId).limit(1);
            if (!items || items.length === 0) {
                // First time generate
                const { adjustStudyPlan } = await import('../lib/pacing');
                await adjustStudyPlan(userId, 'university');
            }
         }
      }
    } else if (profile.track === 'independent') {
      const { data: goals } = await supabase.from('learning_goals').select('id, target_date').eq('student_id', userId).order('created_at', { ascending: false }).limit(1);
      if (goals && goals.length > 0) {
         if (!goals[0].target_date) {
            setNeedsDatePrompt({ type: 'goal', id: goals[0].id });
         } else {
            const { data: items } = await supabase.from('planner_items').select('id').eq('student_id', userId).limit(1);
            if (!items || items.length === 0) {
                const { adjustStudyPlan } = await import('../lib/pacing');
                await adjustStudyPlan(userId, 'independent');
            }
         }
      }
    } else {
      // Secondary
      const { data: items } = await supabase.from('planner_items').select('id').eq('student_id', userId).limit(1);
      if (!items || items.length === 0) {
          const { adjustStudyPlan } = await import('../lib/pacing');
          await adjustStudyPlan(userId, 'secondary');
      }
    }
    
    fetchData();
  };
`;

content = content.replace(
  `export function Planner({ userId }: { userId: string }) {\n  const [currentDate, setCurrentDate] = useState(new Date());\n  const [items, setItems] = useState<PlannerItem[]>([]);\n  const [loading, setLoading] = useState(true);\n  const [view, setView] = useState<'week' | 'month'>('week');\n  const [showAdd, setShowAdd] = useState(false);\n  const [newItemTitle, setNewItemTitle] = useState('');`,
  newComponentStart
);

const fetchEffect = `  useEffect(() => {\n    fetchData();\n  }, [userId, currentDate, view]);`;
const newFetchEffect = `  useEffect(() => {\n    if (!needsDatePrompt) fetchData();\n  }, [currentDate, view, needsDatePrompt]);`;

content = content.replace(fetchEffect, newFetchEffect);

const renderLogic = `
  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDateInput || !needsDatePrompt) return;
    
    setIsGenerating(true);
    if (needsDatePrompt.type === 'semester') {
      await supabase.from('semesters').update({ target_end_date: targetDateInput }).eq('id', needsDatePrompt.id);
    } else {
      await supabase.from('learning_goals').update({ target_date: targetDateInput }).eq('id', needsDatePrompt.id);
    }
    
    const { adjustStudyPlan } = await import('../lib/pacing');
    await adjustStudyPlan(userId, track);
    
    setNeedsDatePrompt(null);
    setIsGenerating(false);
    fetchData();
  };

  if (needsDatePrompt) {
    return (
      <div className="w-full max-w-lg mx-auto py-12 animate-in fade-in">
        <div className="bg-surface-alt border border-border p-8 rounded-3xl text-center">
           <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-accent" />
           </div>
           <h2 className="text-2xl font-bold text-ink mb-3 font-display">When is your target date?</h2>
           <p className="text-slate-500 mb-8 text-[15px]">To build your study plan, we need to know when your {needsDatePrompt.type === 'semester' ? 'semester ends' : 'goal needs to be met'}.</p>
           
           <form onSubmit={handleSaveDate} className="space-y-4">
              <input 
                type="date" 
                required
                value={targetDateInput}
                onChange={e => setTargetDateInput(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent text-center font-bold"
              />
              <button disabled={isGenerating || !targetDateInput} type="submit" className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50">
                {isGenerating ? 'Building your plan...' : 'Generate Plan'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
`;

content = content.replace("  return (\n    <div className=\"w-full animate-in fade-in duration-500\">", renderLogic + "    <div className=\"w-full animate-in fade-in duration-500\">");

fs.writeFileSync('src/components/Planner.tsx', content);
