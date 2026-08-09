import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  "const totalTopicsMastery = notStarted + inProgress + mastered || 1;\\n    const newMastery = {\\n       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),\\n       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),\\n       mastered: Math.round((mastered / totalTopicsMastery) * 100)\\n    };\\n    setMasteryStats(newMastery);",
  \`const totalTopicsMastery = notStarted + inProgress + mastered || 1;
    const newMastery = {
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);
    
    // Calculate Cards Mastered
    let cMastered = 0;
    if (allTopicIds.length > 0) {
        const { data: fc } = await supabase.from('flashcards').select('id').in('topic_id', allTopicIds);
        if (fc && fc.length > 0) {
            const { count } = await supabase.from('flashcard_reviews').select('id', { count: 'exact', head: true })
                .eq('student_id', userId)
                .in('flashcard_id', fc.map(f => f.id))
                .gte('interval_days', 14);
            cMastered = count || 0;
        }
    }
    setCardsMastered(cMastered);
    
    // Calculate Quiz Average
    let qAvg = 0;
    const { data: qAttempts } = await supabase.from('quiz_attempts').select('score').eq('student_id', userId);
    if (qAttempts && qAttempts.length > 0) {
        const sum = qAttempts.reduce((acc, curr) => acc + curr.score, 0);
        qAvg = Math.round(sum / qAttempts.length);
    }
    setQuizAverage(qAvg);\`
);

// update cache setter
c = c.replace(
  "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });",
  "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs, cardsMastered: cMastered, quizAverage: qAvg, weeklyMinutes: Math.round(weekTotalSecs / 60) });"
);

// update UI renders
c = c.replace(
  '<div className="font-display font-bold text-[28px] tracking-tight">{masteryStats?.mastered || 0}</div>',
  '<div className="font-display font-bold text-[28px] tracking-tight">{cardsMastered}</div>'
);

c = c.replace(
  "<div className=\\"font-display font-bold text-[28px] tracking-tight\\">{totalQuizzes > 0 ? '81%' : '0%'}</div>",
  "<div className=\\"font-display font-bold text-[28px] tracking-tight\\">{quizAverage}%</div>"
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
