import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  'active \n          ? "bg-white text-[#0F0B2E] shadow-sm" \n          : "text-white/60 hover:text-white hover:bg-white/5"',
  'active \n          ? "bg-white dark:bg-[#5B4FE8] text-[#0F0B2E] dark:text-white shadow-sm" \n          : "text-white/60 hover:text-white hover:bg-white/5"'
);

fs.writeFileSync('src/components/MainApp.tsx', c);
