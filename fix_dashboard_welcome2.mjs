import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

m = m.replace(
  /if \(currsList\.length === 0\) \{\s*setView\('upload'\);\s*\} else \{\s*setView\('home'\);\s*\}/g,
  "setView('home');"
);

fs.writeFileSync('src/components/Dashboard.tsx', m);
