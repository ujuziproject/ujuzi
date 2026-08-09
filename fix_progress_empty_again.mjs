import fs from 'fs';
let p = fs.readFileSync('src/components/Progress.tsx', 'utf-8');

p = p.replace(
  'Start learning to see your focus areas.',
  'Take more quizzes to identify your focus areas.'
);

fs.writeFileSync('src/components/Progress.tsx', p);
