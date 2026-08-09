import fs from 'fs';
let c = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');

c = c.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [track, setTrack] = useState<string>('secondary');"
);

c = c.replace(
  "const track = profile?.track || 'secondary';",
  "const track = profile?.track || 'secondary';\n      setTrack(track);"
);

c = c.replace(
  '            <h1 className="text-3xl font-bold font-display mb-2">My courses</h1>\\n            <p className="text-white/70">Pick up exactly where you left off — progress syncs across notes, flashcards and quizzes.</p>\\n        </div>',
  \`            <h1 className="text-3xl font-bold font-display mb-2">My courses</h1>
            <p className="text-white/70">Pick up exactly where you left off — progress syncs across notes, flashcards and quizzes.</p>
          </div>
          <button onClick={() => { onNavigate('dashboard'); setDashboardView('upload'); }} className="bg-white text-ink px-4 py-2.5 rounded-xl font-semibold text-[14.5px] hover:bg-white/90 transition-colors shadow-sm hidden md:block">
            {track === 'university' ? '+ Create Semester' : track === 'independent' ? '+ Create Goal' : '+ Add Subject'}
          </button>
        </div>\`
);

fs.writeFileSync('src/components/MyCourses.tsx', c);
