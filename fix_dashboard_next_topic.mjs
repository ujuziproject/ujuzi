import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldEnriched = `    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
        let topicQuery = supabase.from('topics').select('id');
        if (c.type === 'course') topicQuery = topicQuery.eq('course_id', c.id);
        else topicQuery = topicQuery.eq('curriculum_id', c.id);
        const { data: topics } = await topicQuery;
        
        let progress = 0;
        if (topics && topics.length > 0) {
            totalT += topics.length;
            const { data: fc } = await supabase.from('flashcards').select('id').in('topic_id', topics.map(t => t.id));
            if (fc && fc.length > 0) {
               const { data: revs } = await supabase.from('flashcard_reviews').select('flashcard_id').eq('student_id', userId).in('flashcard_id', fc.map(f => f.id)).gte('interval_days', 14);
               const masteredCardsCount = revs?.length || 0;
               progress = Math.round((masteredCardsCount / fc.length) * 100);
            }
        }
        return { ...c, progress, lastAccessed: 'Today' }; // Simple mock for last accessed
    }));`;

const newEnriched = `    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
        let topicQuery = supabase.from('topics').select('id, title').order('order_index', { ascending: true });
        if (c.type === 'course') topicQuery = topicQuery.eq('course_id', c.id);
        else topicQuery = topicQuery.eq('curriculum_id', c.id);
        const { data: topics } = await topicQuery;
        
        let progress = 0;
        let nextTopic = 'Not started yet';
        
        if (topics && topics.length > 0) {
            totalT += topics.length;
            nextTopic = topics[0].title;
            const { data: fc } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', topics.map(t => t.id));
            if (fc && fc.length > 0) {
               const { data: revs } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days').eq('student_id', userId).in('flashcard_id', fc.map(f => f.id));
               const masteredCards = new Set((revs || []).filter(r => r.interval_days >= 14).map(r => r.flashcard_id));
               const masteredCardsCount = masteredCards.size;
               progress = Math.round((masteredCardsCount / fc.length) * 100);
               
               let masteredTopics = 0;
               for (const t of topics) {
                 const tCards = fc.filter(f => f.topic_id === t.id);
                 if (tCards.length > 0 && tCards.every(f => masteredCards.has(f.id))) {
                   masteredTopics++;
                 } else if (nextTopic === topics[0].title && masteredTopics > 0) {
                   nextTopic = t.title;
                 }
               }
               if (progress < 100 && nextTopic === topics[0].title) nextTopic = topics[masteredTopics]?.title || nextTopic;
            }
        }
        return { ...c, progress, nextTopic };
    }));`;

m = m.replace(oldEnriched, newEnriched);
m = m.replace(/Next: Continue learning/g, "Next: {c.nextTopic}");
m = m.replace(/lastAccessed: 'Today'/g, ""); // removed
fs.writeFileSync('src/components/Dashboard.tsx', m);
