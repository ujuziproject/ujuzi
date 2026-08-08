import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """      <div className="hidden lg:flex w-1/3 bg-ink text-white flex-col">
        <div className="p-8 md:p-12 pb-0 shrink-0">
          <div className="flex items-center gap-2 mb-16">
            <div className="bg-accent text-white p-2 rounded-xl flex items-center justify-center font-black text-xl w-10 h-10 shrink-0 shadow-lg shadow-accent/20">uJ</div>
            <span className="text-2xl font-black tracking-tight font-display">uJuzi</span>
          </div>
        </div>"""

replacement = """      {/* Floating Header */}
      <div className="absolute top-4 left-64 right-4 md:left-[35%] lg:left-[35%] bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex items-center justify-between z-10 hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="bg-accent text-white p-1 rounded-lg flex items-center justify-center font-black text-sm w-8 h-8 shrink-0">uJ</div>
          <span className="text-xl font-black tracking-tight font-display text-ink">uJuzi</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-bold text-ink">
          <a href="#" className="flex items-center gap-1 hover:text-accent transition-colors">Invest <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></a>
          <a href="#" className="hover:text-accent transition-colors">Learn</a>
          <a href="#" className="hover:text-accent transition-colors">Community</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-ink"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></button>
          <div className="hidden xl:flex flex-col items-end">
            <span className="text-[10px] font-bold text-ink">New Student</span>
            <span className="text-[9px] font-bold text-white bg-accent px-2 py-0.5 rounded-sm uppercase tracking-wider">uJuzi Profile</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">S</div>
          <button className="text-slate-400 hover:text-ink"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
        </div>
      </div>

      <div className="hidden lg:flex w-[35%] bg-[#000000] text-white flex-col">
        <div className="p-8 md:p-12 pb-0 shrink-0">
          <div className="h-16"></div> {/* Spacer for header */}
        </div>"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
