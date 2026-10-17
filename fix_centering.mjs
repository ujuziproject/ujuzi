import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
content = content.replace(
  '<main className="flex-1 p-8 max-w-[1240px] w-full">',
  '<main className="flex-1 p-8 max-w-[1240px] w-full mx-auto">'
);

fs.writeFileSync('src/components/MainApp.tsx', content);
