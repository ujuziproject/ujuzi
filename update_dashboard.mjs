import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldButton = `<button className="bg-white/5 text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors">
                   Take a 60-second tour
                 </button>`;

const newButton = `<button 
                   onClick={async () => {
                     const { adjustStudyPlan } = await import('../lib/pacing');
                     await adjustStudyPlan(userId, track || 'secondary');
                     alert('Study plan updated!');
                   }}
                   className="bg-white/5 text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors">
                   Adjust plan
                 </button>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('src/components/Dashboard.tsx', content);
