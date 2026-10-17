import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

const oldHeaderStart = `        <header className="h-[76px] px-8 flex items-center gap-4 sticky top-0 z-10 bg-surface-alt border-b border-border">`;
const oldHeaderEnd = `        {/* Content Area */}`;

const oldHeaderBlock = content.substring(content.indexOf(oldHeaderStart), content.indexOf(oldHeaderEnd));

const newHeaderBlock = `        <header className="h-[96px] px-8 md:px-10 flex items-center gap-5 sticky top-0 z-10 bg-white">
           <div className="flex-1 max-w-[800px] flex items-center gap-3 bg-[#F8F9FA] rounded-[18px] px-5 py-3.5 text-slate-400 text-[15px] font-medium border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <Search className="w-[18px] h-[18px] text-slate-400" /> 
              <input type="text" placeholder="Search topics, courses, flashcards..." className="bg-transparent border-none outline-none flex-1 placeholder:text-slate-400 text-ink" />
              <div className="ml-auto font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-sm">⌘K</div>
           </div>
           
           <div className="flex-1"></div>
           
           <button className="w-[44px] h-[44px] rounded-full bg-[#F8F9FA] border border-slate-100 flex items-center justify-center text-slate-500 relative cursor-pointer hover:bg-slate-100 transition-colors">
             <Bell className="w-5 h-5" />
             <span className="absolute top-[11px] right-[11px] w-2 h-2 bg-[#F5A623] rounded-full border-2 border-white"></span>
           </button>
           
           <div className="w-[44px] h-[44px] rounded-full bg-[#6C5CE7] flex items-center justify-center text-white font-bold text-[14px] cursor-pointer shadow-sm">
             A0
           </div>
        </header>

`;

content = content.replace(oldHeaderBlock, newHeaderBlock);
fs.writeFileSync('src/components/MainApp.tsx', content);

