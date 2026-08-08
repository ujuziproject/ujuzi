#!/bin/bash
cat << 'INNEREOF' > repl_cr.txt
      let query = supabase.from('topics').select('*').order('order_index');
      if (courseId) {
        query = query.eq('course_id', courseId);
      } else if (curriculumId) {
        query = query.eq('curriculum_id', curriculumId);
      }
      const { data, error } = await query;
INNEREOF

python3 -c '
with open("src/components/CurriculumResults.tsx", "r") as f:
    text = f.read()

bad = """      const { data, error } = await supabase
        .from('"'"'topics'"'"')
        .select('"'"'*'"'"')
        .eq('"'"'curriculum_id'"'"', curriculumId)
        .order('"'"'order_index'"'"');"""

with open("repl_cr.txt", "r") as f:
    good = f.read()

text = text.replace(bad, good.rstrip())

with open("src/components/CurriculumResults.tsx", "w") as f:
    f.write(text)
'
