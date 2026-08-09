import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldFetch = `    const currsList: any[] = [];
    if (track === 'university') {
      const { data: sems } = await supabase.from('semesters').select('id, level_year, semester_number').eq('student_id', userId);
      if (sems && sems.length > 0) {
        const { data: cs } = await supabase.from('courses').select('id, course_title, semester_id').in('semester_id', sems.map(s => s.id));
        if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id, desc: \`Semester \${sems.find(s=>s.id===c.semester_id)?.semester_number || ''}\` })));
      }
    } else if (track === 'independent') {
      const { data: goals } = await supabase.from('learning_goals').select('id, goal_title').eq('student_id', userId);
      if (goals && goals.length > 0) {
        const { data: cs } = await supabase.from('courses').select('id, course_title, goal_id').in('goal_id', goals.map(g => g.id));
        if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id, desc: \`Goal: \${goals.find(g=>g.id===c.goal_id)?.goal_title || ''}\` })));
      }
    } else {
      const { data: currs } = await supabase.from('curricula').select('id, title').eq('student_id', userId);
      if (currs) currsList.push(...currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id, desc: 'Subject' })));
    }`;

const newFetch = `    const currsList: any[] = [];
    // Fetch all semesters
    const { data: sems } = await supabase.from('semesters').select('id, level_year, semester_number').eq('student_id', userId);
    if (sems && sems.length > 0) {
      const { data: cs } = await supabase.from('courses').select('id, course_title, semester_id').in('semester_id', sems.map(s => s.id));
      if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id, desc: \`Semester \${sems.find(s=>s.id===c.semester_id)?.semester_number || ''}\` })));
    }
    
    // Fetch all goals
    const { data: goals } = await supabase.from('learning_goals').select('id, goal_title').eq('student_id', userId);
    if (goals && goals.length > 0) {
      const { data: cs } = await supabase.from('courses').select('id, course_title, goal_id').in('goal_id', goals.map(g => g.id));
      if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id, desc: \`Goal: \${goals.find(g=>g.id===c.goal_id)?.goal_title || ''}\` })));
    }
    
    // Fetch standalone curricula
    const { data: currs } = await supabase.from('curricula').select('id, title').eq('student_id', userId);
    if (currs && currs.length > 0) {
      currsList.push(...currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id, desc: 'Subject' })));
    }`;

m = m.replace(oldFetch, newFetch);
fs.writeFileSync('src/components/Dashboard.tsx', m);
