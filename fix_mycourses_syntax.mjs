import fs from 'fs';
let c = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');

c = c.replace(
  \`        </div>
        </div>
          <button onClick={() => { onNavigate('dashboard'); setDashboardView('upload'); }} className="bg-white text-ink px-5 py-2.5 rounded-full font-semibold text-[14px] hover:bg-white/90 transition-colors shadow-sm hidden md:flex items-center gap-1.5 shrink-0 z-20 relative">
            {track === 'university' ? '+ Create Semester' : track === 'independent' ? '+ Create Goal' : '+ Add Subject'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B4FE8]/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </div>\`,
  \`        </div>
          <button onClick={() => { onNavigate('dashboard'); setDashboardView('upload'); }} className="bg-white text-ink px-5 py-2.5 rounded-full font-semibold text-[14px] hover:bg-white/90 transition-colors shadow-sm hidden md:flex items-center gap-1.5 shrink-0 z-20 relative">
            {track === 'university' ? '+ Create Semester' : track === 'independent' ? '+ Create Goal' : '+ Add Subject'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B4FE8]/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </div>\`
);

fs.writeFileSync('src/components/MyCourses.tsx', c);
