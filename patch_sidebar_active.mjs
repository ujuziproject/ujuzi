import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  '? "bg-white text-ink font-semibold"',
  '? "bg-white dark:bg-[#5B4FE8] text-[#0F0B2E] dark:text-white font-semibold"'
);

fs.writeFileSync('src/components/MainApp.tsx', c);
