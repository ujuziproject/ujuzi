import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  '<span className={active ? "text-ink" : "text-white/70"}>{icon}</span>',
  '<span className={active ? "" : "opacity-70"}>{icon}</span>'
);

fs.writeFileSync('src/components/MainApp.tsx', c);
