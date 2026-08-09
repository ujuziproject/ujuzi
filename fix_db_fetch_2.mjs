import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldBlock = `    let fetchedCourses: any[] = [];
    if (track === 'university') {
        const { data: sems } = await supabase.from('semesters').select('id').eq('student_id', userId);
        if (sems && sems.length > 0) {
            const { data: cs } = await supabase.from('courses').select('id, course_title, semester_id').in('semester_id', sems.map(s => s.id));
            if (cs) {
                fetchedCourses = cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id }));
            }
        }
    } else if (track === 'independent') {
        const { data: goals } = await supabase.from('learning_goals').select('id').eq('student_id', userId);
        if (goals && goals.length > 0) {
            const { data: cs } = await supabase.from('courses').select('id, course_title, goal_id').in('goal_id', goals.map(g => g.id));
            if (cs) {
                fetchedCourses = cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id }));
            }
        }
    } else {
        const { data: currs } = await supabase.from('curricula').select('id, title, status, student_id').eq('student_id', userId).order('created_at', { ascending: false });
        if (currs) {
            fetchedCourses = currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id }));
        }
    }
    const currsList = fetchedCourses;`;

const newBlock = `    const currsList: any[] = [];
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

m = m.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/Dashboard.tsx', m);
