import re
with open('src/components/Step6Review.tsx', 'r') as f:
    m = f.read()

replacement = """const handleFinalize = async () => {
 setSubmitting(true);
 try {
  if (profile?.track === 'university') {
    const { data: existingSems } = await supabase.from('semesters').select('id').eq('student_id', userId).limit(1);
    if (!existingSems || existingSems.length === 0) {
       await supabase.from('semesters').insert({
         student_id: userId,
         level_year: profile.level_year || 1,
         semester_number: 1,
         is_current: true
       });
    }
  }

 const { error } = await supabase.from('student_profiles').update({"""

m = m.replace("""const handleFinalize = async () => {
 setSubmitting(true);
 try {
 const { error } = await supabase.from('student_profiles').update({""", replacement)

with open('src/components/Step6Review.tsx', 'w') as f:
    f.write(m)
