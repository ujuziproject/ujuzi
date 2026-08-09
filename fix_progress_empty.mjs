import fs from 'fs';
let m = fs.readFileSync('src/components/Progress.tsx', 'utf-8');
m = m.replace(
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm text-slate-500">\n                    Take more quizzes to identify your strengths.\n                 </div>',
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm font-medium text-slate-500">\n                    Not enough quiz data yet to calculate strengths.\n                 </div>'
);
m = m.replace(
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm text-slate-500">\n                    No data available.\n                 </div>',
  '<div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm font-medium text-slate-500">\n                    Not enough quiz data yet to calculate weaknesses.\n                 </div>'
);
fs.writeFileSync('src/components/Progress.tsx', m);
