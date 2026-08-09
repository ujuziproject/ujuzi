import fs from 'fs';
let m = fs.readFileSync('src/components/Step6Review.tsx', 'utf-8');
const replacement = `
  const handleFinalize = async () => {
    setSubmitting(true);
    try {
      // If university, auto-create the first semester
      if (profile?.track === 'university' && profile?.level_year) {
        const { data: existingSems } = await supabase.from('semesters').select('id').eq('student_id', userId).limit(1);
        if (!existingSems || existingSems.length === 0) {
           await supabase.from('semesters').insert({
             student_id: userId,
             level_year: parseInt(profile.level_year, 10) || 1,
             semester_number: 1,
             is_current: true
           });
        }
      }

      const { error } = await supabase.from('student_profiles').update({ learning_style_set_at: new Date().toISOString() }).eq('id', userId);
`;
m = m.replace(/const handleFinalize = async \(\) => \{\s+setSubmitting\(true\);\s+try \{\s+const \{ error \} = await supabase\.from\('student_profiles'\)\.update\(\{ learning_style_set_at: new Date\(\)\.toISOString\(\) \}\)\.eq\('id', userId\);/, replacement);
fs.writeFileSync('src/components/Step6Review.tsx', m);
