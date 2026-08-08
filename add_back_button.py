import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """            <div className="shrink-0 mb-12 mt-12">
               <h1 className="text-[2.5rem] font-black leading-tight mb-4 font-display uppercase tracking-tighter">LET'S BUILD YOUR<br />LEARNING PLAN.</h1>"""

replacement = """            <div className="shrink-0 mb-12 mt-8">
               <button 
                 onClick={() => setStep(Math.max(1, step - 1))}
                 className={`text-white text-xs font-bold tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity mb-12 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                 BACK
               </button>
               <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-[10px] font-bold text-white tracking-widest uppercase mb-6">
                 Learning Plan
               </div>
               <h1 className="text-[2.5rem] font-black leading-tight mb-4 font-display uppercase tracking-tighter">LET'S BUILD YOUR<br />LEARNING PLAN.</h1>"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
