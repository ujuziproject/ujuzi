import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  'className="bg-[#FDF1DC] rounded-2xl p-4 mt-4 text-ink"',
  'className="bg-[#FDF1DC] dark:bg-[#F5A623]/15 rounded-2xl p-4 mt-4 text-ink"'
);

// I should also restart the dev server to make sure everything applies correctly in preview.
fs.writeFileSync('src/components/MainApp.tsx', c);
