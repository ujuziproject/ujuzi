import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix double import
content = content.replace("import { supabase } from '../lib/supabase';\\nimport { CurriculumResults }", "import { CurriculumResults }")

# Update cache type
old_cache = "const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any }>;"
new_cache = "const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[] }>;"
content = content.replace("const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any }>();", "const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[] }>();")

# Add recent sessions state
state_old = "const [recommendations, setRecommendations] = useState<any[]>([]);"
state_new = "const [recommendations, setRecommendations] = useState<any[]>([]);\\n  const [recentSessions, setRecentSessions] = useState<any[]>([]);"
content = content.replace(state_old, state_new)

# Update fetch cache load
cache_load_old = """        setMasteryStats(cached.masteryStats);
        
        if (cached.curricula.length === 0) {"""
cache_load_new = """        setMasteryStats(cached.masteryStats);
        if (cached.recentSessions) setRecentSessions(cached.recentSessions);
        if (cached.recommendations) setRecommendations(cached.recommendations);
        
        if (cached.curricula.length === 0) {"""
content = content.replace(cache_load_old, cache_load_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
