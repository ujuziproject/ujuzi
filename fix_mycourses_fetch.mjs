import fs from 'fs';

let m = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');

const replacement = `
      const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
      const currentTrack = profile?.track || 'secondary';
      setTrack(currentTrack);

      let fetchedCourses: any[] = [];
      
      // Fetch all semesters
      const { data: sems } = await supabase.from('semesters').select('id, level_year, semester_number').eq('student_id', userId);
      if (sems && sems.length > 0) {
        const { data: cs } = await supabase.from('courses').select('*').in('semester_id', sems.map(s => s.id));
        if (cs) {
          fetchedCourses.push(...cs.map(c => ({
            id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id,
            desc: \`Semester \${sems.find(s=>s.id===c.semester_id)?.semester_number || ''}\`
          })));
        }
      }
      
      // Fetch all goals
      const { data: goals } = await supabase.from('learning_goals').select('id, goal_title').eq('student_id', userId);
      if (goals && goals.length > 0) {
        const { data: cs } = await supabase.from('courses').select('*').in('goal_id', goals.map(g => g.id));
        if (cs) {
          fetchedCourses.push(...cs.map(c => ({
            id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id,
            desc: \`Goal: \${goals.find(g=>g.id===c.goal_id)?.goal_title || ''}\`
          })));
        }
      }
      
      // Fetch standalone curricula
      const { data: currs } = await supabase.from('curricula').select('*').eq('student_id', userId);
      if (currs && currs.length > 0) {
        fetchedCourses.push(...currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id, desc: 'Subject' })));
      }
`;

m = m.replace(
  /const { data: profile }[\s\S]*?(?=\/\/ get topics for progress)/,
  replacement
);

fs.writeFileSync('src/components/MyCourses.tsx', m);
