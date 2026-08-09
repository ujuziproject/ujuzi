import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

m = m.replace(
  '<div className="font-display font-bold text-lg">🔥 {streakDays} days</div>',
  '<div className="font-display font-bold text-lg">🔥 {streakDays} {streakDays === 1 ? \\'day\\' : \\'days\\'}</div>'
);

fs.writeFileSync('src/components/MainApp.tsx', m);
