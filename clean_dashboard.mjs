import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

m = m.replace(
  /if \(cached\.curricula\.length === 0\) \{\s*setView\('home'\);\s*\} else \{\s*setView\('home'\);\s*\}/g,
  "setView('home');"
);

m = m.replace(
  /if \(currsList\.length === 0\) \{\s*setView\('home'\);\s*\} else \{\s*setView\('home'\);\s*\}/g,
  "setView('home');"
);

fs.writeFileSync('src/components/Dashboard.tsx', m);
