import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Add states
content = content.replace(
  'const [weeklyMinutes, setWeeklyMinutes] = useState(0);',
  'const [weeklyMinutes, setWeeklyMinutes] = useState(0);\n  const [daysLeft, setDaysLeft] = useState<number | null>(null);\n  const [topicsLeft, setTopicsLeft] = useState(0);'
);

// Add fetch logic in useEffect
const fetchLogic = `
        // Check pacing stats
        import('../lib/pacing').then(async (pacing) => {
           // We can simulate fetching pacing by just querying the target date
           let target = null;
           if (track === 'university') {
              const { data: sems } = await supabase.from('semesters').select('id, target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).limit(1);
              if (sems && sems.length > 0 && sems[0].target_end_date) target = new Date(sems[0].target_end_date);
           } else if (track === 'independent') {
              const { data: goals } = await supabase.from('learning_goals').select('id, target_date').eq('student_id', userId).order('created_at', { ascending: false }).limit(1);
              if (goals && goals.length > 0 && goals[0].target_date) target = new Date(goals[0].target_date);
           } else {
              const { data: profile } = await supabase.from('student_profiles').select('exam_date, exam_year').eq('id', userId).maybeSingle();
              if (profile?.exam_date) target = new Date(profile.exam_date);
              else if (profile?.exam_year) target = new Date(\`\${profile.exam_year}-06-30\`);
           }
           
           if (target) {
              const msPerDay = 1000 * 60 * 60 * 24;
              const daysRemaining = Math.max(0, Math.ceil((target.getTime() - new Date().getTime()) / msPerDay));
              setDaysLeft(daysRemaining);
              
              const { data: topics } = await supabase.from('planner_items').select('id', { count: 'exact' }).eq('student_id', userId).eq('completed', false).eq('item_type', 'notes');
              if (topics && topics.count !== null) {
                 setTopicsLeft(topics.count);
              }
           }
        });
`;

content = content.replace(
  "// Check if they have courses to update the checklist",
  fetchLogic + "\n        // Check if they have courses to update the checklist"
);

// Replace hero text
const heroTextRe = /\{6 - setupTasksCount > 0\s*\?\s*`You're \$\{6 - setupTasksCount\} step\$\{6 - setupTasksCount === 1 \? '' : 's'\} from your first AI-built study pack\. Finish setup and we'll turn your syllabus into notes, cards and quizzes\.`\s*:\s*`You're all set! We've turned your syllabus into notes, cards and quizzes\.`\}/;

const newHeroText = `{6 - setupTasksCount > 0
                   ? \`You're \${6 - setupTasksCount} step\${6 - setupTasksCount === 1 ? '' : 's'} from your first AI-built study pack. Finish setup and we'll turn your syllabus into notes, cards and quizzes.\`
                  : (daysLeft !== null && daysLeft > 0) ? \`\${daysLeft} days left — \${topicsLeft} topics still uncovered before your exam.\` : \`You're all set! We've turned your syllabus into notes, cards and quizzes.\`}`;

content = content.replace(heroTextRe, newHeroText);

// Replace Weekly Goal text
content = content.replace(
  '<span className="text-[13.5px] text-slate-400 font-semibold leading-tight">Let\'s get moving</span>',
  '<span className="text-[13.5px] text-slate-400 font-semibold leading-tight">{weeklyMinutes < 60 ? `${Math.round((weeklyMinutes/60)*100)}% of this week\'s goal — don\'t lose your pace` : `Goal crushed`}</span>'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
