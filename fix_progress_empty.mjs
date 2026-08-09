import fs from 'fs';
let p = fs.readFileSync('src/components/Progress.tsx', 'utf-8');

p = p.replace(
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm text-slate-500">\\n                    Start learning to see your focus areas.\\n                 </div>',
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm text-slate-500">\\n                    Take more quizzes to identify your focus areas.\\n                 </div>'
);

fs.writeFileSync('src/components/Progress.tsx', p);
