import re
with open('src/components/Step5LearningStyle.tsx', 'r') as f:
    content = f.read()

target = """      const { error } = await supabase.from('student_profiles').update({
        content_format_preference,
        explanation_complexity_preference,
        learning_style_set_at: new Date().toISOString()
      }).eq('id', userId);"""

replacement = """      const { error } = await supabase.from('student_profiles').update({
        content_format_preference,
        explanation_complexity_preference
      }).eq('id', userId);"""

content = content.replace(target, replacement)

with open('src/components/Step5LearningStyle.tsx', 'w') as f:
    f.write(content)
