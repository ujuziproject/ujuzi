import fs from 'fs';
let content = fs.readFileSync('src/lib/badges.ts', 'utf-8');

const oldScoreCheck = `    // 2. Quiz Score
    if (criteriaNeeded.has('quiz_score_90')) {
      const { data: attempts } = await supabase.from('quiz_attempts').select('score').eq('student_id', userId).gte('score', 90).limit(1);
      if (attempts && attempts.length > 0) {
        for (const b of unearnedBadges.filter(b => b.criteria_type === 'quiz_score_90')) {
           newEarned.push(b); // threshold could be ignored if we just assume 90% is the goal, or check attempts[0].score >= threshold
        }
      }
    }`;

const newScoreCheck = `    // 2. Quiz Score
    if (criteriaNeeded.has('quiz_score_90')) {
      const { data: attempts } = await supabase.from('quiz_attempts').select('score, total_questions').eq('student_id', userId);
      if (attempts && attempts.length > 0) {
        const has90 = attempts.some(a => (a.score / a.total_questions) * 100 >= 90);
        if (has90) {
           for (const b of unearnedBadges.filter(b => b.criteria_type === 'quiz_score_90')) {
              newEarned.push(b);
           }
        }
      }
    }`;

content = content.replace(oldScoreCheck, newScoreCheck);
fs.writeFileSync('src/lib/badges.ts', content);
