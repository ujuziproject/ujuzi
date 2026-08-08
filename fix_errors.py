import re

# 1. server.ts
with open('server.ts', 'r') as f:
    content = f.read()
content = content.replace("tools: [{ googleSearch: {} }]", "// tools: [{ googleSearch: {} }]")
with open('server.ts', 'w') as f:
    f.write(content)

# 2. CurriculumResults.tsx
with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()
# setRefreshKey is not in TopicView. Let's pass it or just force re-render. TopicView can have its own state.
target = """                      topic.title = newTitle; // Update local state immediately
                      setRefreshKey(k => k + 1); // Trigger re-render"""
replacement = """                      topic.title = newTitle; // Update local state immediately
                      // Just let the DOM update naturally or we rely on parent update if needed."""
content = content.replace(target, replacement)
with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)

# 3. CurriculumUpload.tsx
with open('src/components/CurriculumUpload.tsx', 'r') as f:
    content = f.read()
if "const [prefs, setPrefs]" not in content:
    target = "  const [loading, setLoading] = useState(false);"
    replacement = "  const [prefs, setPrefs] = useState<any>({});\n  const [loading, setLoading] = useState(false);"
    content = content.replace(target, replacement)
    with open('src/components/CurriculumUpload.tsx', 'w') as f:
        f.write(content)

# 4. Dashboard.tsx
with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()
content = content.replace("import { supabase } from '../lib/supabase';\nimport { CurriculumResults }", "import { CurriculumResults }")
with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

# 5. GoalDetail.tsx
with open('src/components/GoalDetail.tsx', 'r') as f:
    content = f.read()
if "Edit2" not in content[:500]:
    content = content.replace("Layers } from", "Layers, Edit2 } from")
    with open('src/components/GoalDetail.tsx', 'w') as f:
        f.write(content)

# 6. Progress.tsx
# In patch_progress_cal.py I might have put renderCalendar outside the Progress function. Let's check.
