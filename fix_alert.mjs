import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Also import adjustStudyPlan
// But wait, the button is inside DashboardHome. Let's add a state.
const newComponentStart = `function DashboardHome({ name, userId, track, onNavigate }: DashboardProps) {
  const { setCurrentView, setDashboardView } = useNavigationStore();
  
  const [streak, setStreak] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjusted, setAdjusted] = useState(false);
`;

content = content.replace(
  `function DashboardHome({ name, userId, track, onNavigate }: DashboardProps) {\n  const { setCurrentView, setDashboardView } = useNavigationStore();\n  \n  const [streak, setStreak] = useState(0);`,
  newComponentStart
);

const newButton = `<button 
                   onClick={async () => {
                     setIsAdjusting(true);
                     const { adjustStudyPlan } = await import('../lib/pacing');
                     await adjustStudyPlan(userId, track || 'secondary');
                     setIsAdjusting(false);
                     setAdjusted(true);
                     setTimeout(() => setAdjusted(false), 3000);
                   }}
                   disabled={isAdjusting}
                   className="bg-white/5 text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50">
                   {isAdjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : (adjusted ? <CheckCircle2 className="w-4 h-4" /> : null)}
                   {isAdjusting ? 'Updating...' : (adjusted ? 'Plan Updated' : 'Adjust plan')}
                 </button>`;

content = content.replace(
  `<button \n                   onClick={async () => {\n                     const { adjustStudyPlan } = await import('../lib/pacing');\n                     await adjustStudyPlan(userId, track || 'secondary');\n                     alert('Study plan updated!');\n                   }}\n                   className="bg-white/5 text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors">\n                   Adjust plan\n                 </button>`,
  newButton
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
