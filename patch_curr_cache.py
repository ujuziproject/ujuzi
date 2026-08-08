import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

load_start_old = """    async function loadData() {
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
    }"""

load_start_new = """    async function loadData() {
      const cacheKey = `${curriculumId || ''}-${courseId || ''}-${userId}`;
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        setTopics(cached.topics);
        setTopicStats(cached.stats);
        setStreak(cached.streak);
        if (refreshKey === 0) setLoading(false);
        // Fetch in background to update
        fetchData(cacheKey);
        return;
      }
      setLoading(true);
      await fetchData(cacheKey);
    }"""

content = content.replace(load_start_old, load_start_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
