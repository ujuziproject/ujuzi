import fs from 'fs';
let m = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

m = m.replace(
  '<div className="inline-flex items-center gap-2 bg-accent-warm/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold mb-4 backdrop-blur-sm">',
  '<div className="mb-4"><span className="inline-flex items-center gap-2 bg-accent-warm/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold backdrop-blur-sm">'
);

m = m.replace(
  /\{\s*totalTopics > 0 \|\| curricula\.length > 0\s*\?\s*\(isPlanUpToDate \? "✦ Your plan is up to date" : "✦ You have tasks pending today"\)\s*:\s*"✦ Ready to start"\s*\}/,
  '{totalTopics > 0 || curricula.length > 0 ? (isPlanUpToDate ? "✦ Your plan is up to date" : "✦ You have tasks pending today") : "✦ Ready to start"}</span>'
);

m = m.replace(
  '"Your dashboard is looking a little empty. Follow these simple steps to start turning your study materials into interactive, AI-powered learning experiences."',
  '"Your dashboard is looking a little empty. Add your first study materials to get started."'
);

fs.writeFileSync('src/components/Dashboard.tsx', m);
