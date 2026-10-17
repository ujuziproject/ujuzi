import fs from 'fs';

let content = fs.readFileSync('src/components/Progress.tsx', 'utf-8');

// 1. Add Trophy to imports
if (!content.includes('Trophy')) {
  content = content.replace("import { Loader2, Calendar, BrainCircuit, Target, BookOpen, AlertCircle } from 'lucide-react';", "import { Loader2, Calendar, BrainCircuit, Target, BookOpen, AlertCircle, Trophy } from 'lucide-react';");
}

// 2. Add badge state
const stateInsertion = `  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [badgesEarnedDates, setBadgesEarnedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadBadges() {
      const [{ data: b }, { data: sb }] = await Promise.all([
         supabase.from('badges').select('*').order('threshold', { ascending: true }),
         supabase.from('student_badges').select('*').eq('student_id', userId)
      ]);
      if (b) setAllBadges(b);
      if (sb) {
         setEarnedBadgeIds(new Set(sb.map((s: any) => s.badge_id)));
         const dates: Record<string, string> = {};
         sb.forEach((s: any) => dates[s.badge_id] = s.earned_at);
         setBadgesEarnedDates(dates);
      }
    }
    loadBadges();
  }, [userId]);
`;
content = content.replace(`  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());\n  const [currentMonth, setCurrentMonth] = useState(new Date());`, stateInsertion);

// 3. Add Badges section at the end
const oldEnd = `      )}
    </div>
  );
}`;

const newEnd = `      )}

      {allBadges.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-ink mb-6 font-display flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" /> Achievements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {allBadges.map(badge => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                   <div key={badge.id} className={cn("p-5 rounded-3xl border flex flex-col items-center text-center transition-all", isEarned ? "bg-surface border-accent/20 shadow-sm" : "bg-surface-alt/50 border-border/50 opacity-60 grayscale")}>
                      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3", isEarned ? "bg-accent/10 border border-accent/20" : "bg-slate-100 border border-slate-200")}>
                         {badge.icon_url || '🏆'}
                      </div>
                      <div className="font-bold text-ink text-sm mb-1">{badge.name}</div>
                      <div className="text-xs text-slate-500 font-medium leading-tight mb-3 flex-1">{badge.description}</div>
                      {isEarned && badgesEarnedDates[badge.id] && (
                         <div className="text-[10px] uppercase tracking-widest font-bold text-accent">
                            Earned {new Date(badgesEarnedDates[badge.id]).toLocaleDateString()}
                         </div>
                      )}
                   </div>
                )
             })}
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync('src/components/Progress.tsx', content);
