import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  '<div className="font-display font-bold text-[28px] tracking-tight">{masteryStats?.mastered || 0}</div>',
  '<div className="font-display font-bold text-[28px] tracking-tight">{cardsMastered || 0}</div>'
);

c = c.replace(
  "<div className=\\"font-display font-bold text-[28px] tracking-tight\\">{totalQuizzes > 0 ? '81%' : '0%'}</div>",
  '<div className="font-display font-bold text-[28px] tracking-tight">{quizAverage || 0}%</div>'
);

c = c.replace(
  "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });",
  "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs, cardsMastered: cMastered, quizAverage: qAvg, weeklyMinutes: Math.round(weekTotalSecs / 60) });"
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
