import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  'bg-[#0F0B2E] dark:bg-surface-alt',
  'bg-ink dark:bg-surface-alt'
);

fs.writeFileSync('src/components/MainApp.tsx', c);
