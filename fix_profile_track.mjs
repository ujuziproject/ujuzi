import fs from 'fs';
let p = fs.readFileSync('src/components/Profile.tsx', 'utf-8');

p = p.replace(
  "case 'independent': return 'Post-Development Learner';",
  "case 'independent': return 'Independent Learner';"
);

fs.writeFileSync('src/components/Profile.tsx', p);
