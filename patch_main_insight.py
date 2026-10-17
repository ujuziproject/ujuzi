import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

old_logic = """      if (streakDays >= 3) {
        setAiInsight(`You're on a ${streakDays}-day streak! Keep up the great work.`);
      } else if (quizzes > 0) {
        setAiInsight(`You've taken ${quizzes} quizzes. Review your weakest topics to boost your scores.`);
      } else if (flashcards > 0) {
        setAiInsight(`You've reviewed ${flashcards} flashcards. Staying on top of your spaced repetition is key!`);
      } else if (curricula > 0) {
        setAiInsight(`You have ${curricula} curriculum uploaded. Dive in and start generating materials to build your knowledge!`);
      } else {
        setAiInsight('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
      }"""

new_logic = """      if (streakDays >= 3) {
        setAiInsight(`You're on a ${streakDays}-day streak! Keep up the great work.`);
      } else if (quizzes > 0) {
        const { data: allAttempts } = await supabase.from('quiz_attempts').select('quiz_id, score, total_questions').eq('student_id', userId);
        let weakestTopicStr = 'Review your weakest topics';
        if (allAttempts && allAttempts.length > 0) {
           const { data: quizzesList } = await supabase.from('quizzes').select('id, topic_id').in('id', allAttempts.map(a => a.quiz_id));
           if (quizzesList && quizzesList.length > 0) {
             const { data: topicsList } = await supabase.from('topics').select('id, title').in('id', quizzesList.map(q => q.topic_id));
             if (topicsList && topicsList.length > 0) {
                // Find weakest
                const topicScores: Record<string, {score: number, max: number}> = {};
                allAttempts.forEach(a => {
                   const q = quizzesList.find(qz => qz.id === a.quiz_id);
                   if (q) {
                     if (!topicScores[q.topic_id]) topicScores[q.topic_id] = {score: 0, max: 0};
                     topicScores[q.topic_id].score += a.score;
                     topicScores[q.topic_id].max += a.total_questions;
                   }
                });
                let weakestId = null;
                let lowestScore = 2; // 200%
                for (const tId in topicScores) {
                  const percent = topicScores[tId].score / Math.max(topicScores[tId].max, 1);
                  if (percent < lowestScore) {
                    lowestScore = percent;
                    weakestId = tId;
                  }
                }
                const weakestTopic = topicsList.find(t => t.id === weakestId);
                if (weakestTopic) {
                  weakestTopicStr = `Review '${weakestTopic.title}' — your lowest quiz score so far`;
                }
             }
           }
        }
        const quizText = quizzes === 1 ? '1 quiz' : `${quizzes} quizzes`;
        setAiInsight(`You've taken ${quizText}. ${weakestTopicStr}.`);
      } else if (flashcards > 0) {
        setAiInsight(`You've reviewed ${flashcards} flashcards. Staying on top of your spaced repetition is key!`);
      } else if (curricula > 0) {
        const curriculaText = curricula === 1 ? '1 curriculum' : `${curricula} curricula`;
        setAiInsight(`You have ${curriculaText} uploaded. Dive in and start generating materials to build your knowledge!`);
      } else {
        setAiInsight('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
      }"""

content = content.replace(old_logic, new_logic)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)

