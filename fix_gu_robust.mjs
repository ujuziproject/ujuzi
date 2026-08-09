import fs from 'fs';
let m = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

// replace the loadContainers to fetch goals if track !== university
const oldLoadContainers = `    async function loadContainers() {
      if (track === 'university') {
        const { data } = await supabase.from('semesters').select('*').eq('student_id', userId).order('level_year', { ascending: false });
        if (data && data.length > 0) {
          setSemesters(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else if (track === 'independent') {
        const { data } = await supabase.from('learning_goals').select('*').eq('student_id', userId).order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setGoals(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else {
        // secondary track or fallback, we might not have containers, but let's just show single/bulk
      }
      setLoading(false);
    }`;

const newLoadContainers = `    async function loadContainers() {
      if (track === 'university') {
        const { data } = await supabase.from('semesters').select('*').eq('student_id', userId).order('level_year', { ascending: false });
        if (data) {
          setSemesters(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else {
        const { data } = await supabase.from('learning_goals').select('*').eq('student_id', userId).order('created_at', { ascending: false });
        if (data) {
          setGoals(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      }
      setLoading(false);
    }`;
m = m.replace(oldLoadContainers, newLoadContainers);

// replace track === 'independent' && goals.length === 0 with track !== 'university' && goals.length === 0
m = m.replace("if (!selectedContainer && track === 'independent' && goals.length === 0)", "if (!selectedContainer && track !== 'university' && goals.length === 0)");

fs.writeFileSync('src/components/GlobalUploadFlow.tsx', m);
