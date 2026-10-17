import fs from 'fs';
let content = fs.readFileSync('src/components/Planner.tsx', 'utf-8');

// Add daysLeft/topicsLeft state
content = content.replace(
  'const [needsDatePrompt, setNeedsDatePrompt] = useState<{type: string, id: string} | null>(null);',
  'const [needsDatePrompt, setNeedsDatePrompt] = useState<{type: string, id: string} | null>(null);\n  const [daysLeft, setDaysLeft] = useState<number | null>(null);\n  const [topicsLeft, setTopicsLeft] = useState(0);'
);

// Add logic to calculate pacing after checking needsDatePrompt
const pacingLogic = `
        if (!needsDatePrompt) {
           let target = null;
           if (profile.track === 'university') {
              const { data: sems } = await supabase.from('semesters').select('target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).limit(1);
              if (sems && sems.length > 0 && sems[0].target_end_date) target = new Date(sems[0].target_end_date);
           } else if (profile.track === 'independent') {
              const { data: goals } = await supabase.from('learning_goals').select('target_date').eq('student_id', userId).order('created_at', { ascending: false }).limit(1);
              if (goals && goals.length > 0 && goals[0].target_date) target = new Date(goals[0].target_date);
           } else {
              if (profile?.exam_date) target = new Date(profile.exam_date);
              else if (profile?.exam_year) target = new Date(\`\${profile.exam_year}-06-30\`);
           }
           
           if (target) {
              const msPerDay = 1000 * 60 * 60 * 24;
              const dLeft = Math.max(0, Math.ceil((target.getTime() - new Date().getTime()) / msPerDay));
              setDaysLeft(dLeft);
              const { data: topics } = await supabase.from('planner_items').select('id', { count: 'exact' }).eq('student_id', userId).eq('completed', false).eq('item_type', 'notes');
              if (topics && topics.count !== null) setTopicsLeft(topics.count);
           }
        }
`;

content = content.replace(
  'fetchData();\n  };',
  pacingLogic + '\n    fetchData();\n  };'
);

// Update planner subtitle
content = content.replace(
  '<p className="text-[14px] text-ink/60">Schedule your study sessions and stay on track</p>',
  '<p className="text-[14px] text-ink/60">{(daysLeft !== null && daysLeft > 0) ? `${daysLeft} days left — ${topicsLeft} topics still uncovered before your exam.` : \'Schedule your study sessions and stay on track\'}</p>'
);

fs.writeFileSync('src/components/Planner.tsx', content);
