import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

# Add cache map at the top for TopicView
cache_code = """
const cache = new Map<string, { topics: Topic[], stats: any, streak: number }>();
const topicCache = new Map<string, { notes: any, flashcards: any[], quizQuestions: any[] }>();
"""
content = content.replace("const cache = new Map<string, { topics: Topic[], stats: any, streak: number }>();", cache_code)

fetch_materials = """    async function fetchMaterials() {
      setLoading(true);
      // Fetch notes"""

fetch_materials_new = """    async function fetchMaterials() {
      const cacheKey = `${topic.id}-${userId}`;
      if (topicCache.has(cacheKey)) {
        const cached = topicCache.get(cacheKey)!;
        setNotes(cached.notes);
        setFlashcards(cached.flashcards);
        setQuizQuestions(cached.quizQuestions);
        setLoading(false);
        // fetch in background
        fetchData(cacheKey);
        return;
      }
      setLoading(true);
      await fetchData(cacheKey);
    }
    
    async function fetchData(cacheKey: string) {
      // Fetch notes"""

content = content.replace(fetch_materials, fetch_materials_new)

fetch_materials_end = """        setQuizQuestions(qData || []);
      }
      
      setLoading(false);
    }
    fetchMaterials();"""

fetch_materials_end_new = """        setQuizQuestions(qData || []);
        topicCache.set(cacheKey, { notes: nData, flashcards: fcData || [], quizQuestions: qData || [] });
      }
      
      setLoading(false);
    }
    fetchMaterials();"""

content = content.replace(fetch_materials_end, fetch_materials_end_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
