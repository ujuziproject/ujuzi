import re

with open('src/components/Step3ProfileForm.tsx', 'r') as f:
    content = f.read()

target = """      const { error: insertError } = await supabase
        .from('student_profiles')
        .insert(payload);"""

replacement = """      const { error: insertError } = await supabase
        .from('student_profiles')
        .upsert(payload);"""

content = content.replace(target, replacement)

with open('src/components/Step3ProfileForm.tsx', 'w') as f:
    f.write(content)
