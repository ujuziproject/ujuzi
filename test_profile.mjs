import fs from 'fs';
let p = fs.readFileSync('src/components/Profile.tsx', 'utf-8');
console.log(p.substring(0, 1000));
