import re

with open('src/lib/tracking.ts', 'r') as f:
    content = f.read()

new_func = """
export async function saveSessionReflection(sessionId: string, reflection: string): Promise<void> {
  try {
    await supabase.from('study_sessions').update({ reflection }).eq('id', sessionId);
  } catch (err) {
    console.error('Failed to save reflection', err);
  }
}
"""
content += new_func

with open('src/lib/tracking.ts', 'w') as f:
    f.write(content)
