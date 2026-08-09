import fs from 'fs';
let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

c = c.replace(
  'className="w-[236px] shrink-0 h-screen sticky top-0 bg-ink text-white flex flex-col p-4 md:p-6"',
  'className="w-[236px] shrink-0 h-screen sticky top-0 bg-[#0F0B2E] dark:bg-surface-alt text-white flex flex-col p-4 md:p-6"'
);

// We need to also add theme toggle button.
// The header currently has:
// <div className="flex-1"></div>
// <button className="w-10 h-10 rounded-full border border-border bg-surface-alt flex items-center justify-center text-slate-600 relative cursor-pointer">
// Let's add Sun/Moon toggle.

const headerSearch = `<div className="flex-1"></div>`;
const toggleBtn = `<div className="flex-1"></div>
           <button onClick={() => {
             document.documentElement.classList.toggle('dark');
             const isDark = document.documentElement.classList.contains('dark');
             localStorage.setItem('theme', isDark ? 'dark' : 'light');
             // We could dispatch an event or just let it be, the CSS handles it
           }} className="w-10 h-10 rounded-full border border-border bg-surface-alt flex items-center justify-center text-slate-600 dark:text-slate-300 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
             <svg className="w-[18px] h-[18px] block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             <svg className="w-[18px] h-[18px] hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
           </button>`;

c = c.replace(headerSearch, toggleBtn);

fs.writeFileSync('src/components/MainApp.tsx', c);
