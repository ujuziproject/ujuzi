import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  "const curriculumIds = currsList.map(c => c.id);\\n    if (curriculumIds.length > 0) {\\n      const { data: allTopics } = await supabase.from('topics').select('id, curriculum_id').in('curriculum_id', curriculumIds);",
  \`// Fetch all topics for the courses
    const allTopicIds: string[] = [];
    for (const curr of currsList) {
        let q = supabase.from('topics').select('id, title');
        if (curr.type === 'course') q = q.eq('course_id', curr.id);
        else q = q.eq('curriculum_id', curr.id);
        const { data: ts } = await q;
        if (ts) ts.forEach(t => allTopicIds.push(t.id));
    }
    
    if (allTopicIds.length > 0) {
      const allTopics = allTopicIds.map(id => ({ id }));\`
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
