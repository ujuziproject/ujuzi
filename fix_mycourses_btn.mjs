import fs from 'fs';
let m = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
m = m.replace(/\{track === 'university' \? '\+ Create Semester' : track === 'independent' \? '\+ Create Goal' : '\+ Add Subject'\}/, "'+ Add Course'");
fs.writeFileSync('src/components/MyCourses.tsx', m);
