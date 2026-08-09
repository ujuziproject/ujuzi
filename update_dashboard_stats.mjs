import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  'const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });',
  `const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });
  const [cardsMastered, setCardsMastered] = useState(0);
  const [quizAverage, setQuizAverage] = useState(0);`
);

c = c.replace(
  'const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[] }>();',
  'const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[], cardsMastered?: number, quizAverage?: number, weeklyMinutes?: number }>();'
);

// update cache getter
c = c.replace(
  '        if (cached.recommendations) setRecommendations(cached.recommendations);',
  `        if (cached.recommendations) setRecommendations(cached.recommendations);
        if (cached.cardsMastered !== undefined) setCardsMastered(cached.cardsMastered);
        if (cached.quizAverage !== undefined) setQuizAverage(cached.quizAverage);
        if (cached.weeklyMinutes !== undefined) setWeeklyMinutes(cached.weeklyMinutes);`
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
