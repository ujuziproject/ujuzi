import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

# Add cache map at the top
cache_code = """
const cache = new Map<string, { topics: Topic[], stats: any, streak: number }>();
"""

content = content.replace("export function CurriculumResults", cache_code + "\nexport function CurriculumResults")

# In loadData, check cache first
load_start = """    async function loadData() {
      // Fetch streak"""

load_start_new = """    async function loadData() {
      const cacheKey = `${curriculumId || ''}-${courseId || ''}-${userId}`;
      if (cache.has(cacheKey) && refreshKey === 0) {
        const cached = cache.get(cacheKey)!;
        setTopics(cached.topics);
        setTopicStats(cached.stats);
        setStreak(cached.streak);
        setLoading(false);
        // Fetch in background to update
        fetchData(cacheKey);
        return;
      }
      await fetchData(cacheKey);
    }
    
    async function fetchData(cacheKey: string) {"""

content = content.replace(load_start, load_start_new)

# Save to cache at the end of fetchData
load_end = """        setTopicStats(stats);
      }
      setLoading(false);"""

load_end_new = """        setTopicStats(stats);
        cache.set(cacheKey, { topics: data || [], stats, streak: streakData?.current_streak || 0 });
      }
      setLoading(false);"""

content = content.replace(load_end, load_end_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
