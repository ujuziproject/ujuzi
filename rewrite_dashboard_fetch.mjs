import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  "const { data: currs } = await supabase.from('curricula').select('id, title, status, student_id').eq('student_id', userId).order('created_at', { ascending: false });",
  `// Fetch profile for track
    const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
    const track = profile?.track || 'secondary';

    let fetchedCourses: any[] = [];
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
    const currsList = fetchedCourses;`
);

// We also need to fix `enrichedCurricula` where it fetches topics:
c = c.replace(
  "const { data: curriculumTopics } = await supabase.from('topics').select('id').eq('curriculum_id', c.id);",
  `let topicQuery = supabase.from('topics').select('id').order('order_index', { ascending: true });
      if (c.type === 'course') topicQuery = topicQuery.eq('course_id', c.id);
      else topicQuery = topicQuery.eq('curriculum_id', c.id);
      const { data: curriculumTopics } = await topicQuery;`
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
