import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

old_fetch = """    async function fetchData(cacheKey: string) {
      // Fetch notes
      const { data: nData } = await supabase.from('lecture_notes').select('*').eq('topic_id', topic.id).maybeSingle();
      setNotes(nData);
      
      // Fetch flashcards
      const { data: fcData } = await supabase.from('flashcards').select('*').eq('topic_id', topic.id);
      setFlashcards(fcData || []);
      
      // Fetch quiz questions
      const { data: qzData } = await supabase.from('quizzes').select('*').eq('topic_id', topic.id).maybeSingle();
      if (qzData) {
        const { data: qData } = await supabase.from('quiz_questions').select('*').eq('quiz_id', qzData.id).order('order_index');
        setQuizQuestions(qData || []);
        topicCache.set(cacheKey, { notes: nData, flashcards: fcData || [], quizQuestions: qData || [] });
      }
      
      setLoading(false);
    }"""

new_fetch = """    async function fetchData(cacheKey: string) {
      const [nRes, fcRes, qzRes] = await Promise.all([
        supabase.from('lecture_notes').select('*').eq('topic_id', topic.id).maybeSingle(),
        supabase.from('flashcards').select('*').eq('topic_id', topic.id),
        supabase.from('quizzes').select('*').eq('topic_id', topic.id).maybeSingle()
      ]);
      
      setNotes(nRes.data);
      setFlashcards(fcRes.data || []);
      
      let qData = null;
      if (qzRes.data) {
        const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', qzRes.data.id).order('order_index');
        qData = data;
        setQuizQuestions(data || []);
      }
      
      topicCache.set(cacheKey, { notes: nRes.data, flashcards: fcRes.data || [], quizQuestions: qData || [] });
      setLoading(false);
    }"""

content = content.replace(old_fetch, new_fetch)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
