import fs from 'fs';
let m = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
m = m.replace(/'Ready to start'/g, "'Not started yet'");
fs.writeFileSync('src/components/MyCourses.tsx', m);
