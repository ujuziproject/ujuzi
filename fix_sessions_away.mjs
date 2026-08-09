import fs from 'fs';
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

d = d.replace(
  'const nextUpText = mostActiveCourse ? `You\\'re 3 sessions away from finishing ${mostActiveCourse.title} this week.` : "Let\\'s keep the momentum going!";',
  'const nextUpText = mostActiveCourse ? `Keep up the momentum in ${mostActiveCourse.title}!` : "Let\\'s keep the momentum going!";'
);
fs.writeFileSync('src/components/Dashboard.tsx', d);
