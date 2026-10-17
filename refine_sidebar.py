import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                {[
                  { id: 1, label: "Create Account" },
                  { id: 2, label: "Choose Your Path" },
                  { id: 3, label: "Academic Profile" },
                  { id: 4, label: "Interests" },
                  { id: 5, label: "Learning Style" }
                ].map((s) => {
                  const isCurrent = step === s.id;
                  const isPast = step > s.id;
                  return (
                    <div key={s.id} className={cn("flex items-center gap-4 transition-opacity", (isCurrent || isPast) ? "opacity-100" : "opacity-40")}>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all font-bold",
                        isPast ? "bg-success text-white border-none" : isCurrent ? "bg-accent text-white border-none" : "border-2 border-slate-600 text-slate-400"
                      )}>
                        {isPast ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : s.id}
                      </div>
                      <span className={cn("text-sm font-bold tracking-wide", isCurrent ? "text-white" : "text-slate-300")}>{s.label}</span>
                    </div>
                  );
                })}"""

replacement = """                {[
                  { id: 1, label: "CREATE ACCOUNT" },
                  { id: 2, label: "CHOOSE YOUR PATH" },
                  { id: 3, label: "ACADEMIC PROFILE" },
                  { id: 4, label: "INTERESTS" },
                  { id: 5, label: "LEARNING STYLE" }
                ].map((s) => {
                  const isCurrent = step === s.id;
                  const isPast = step > s.id;
                  return (
                    <div key={s.id} className={cn("flex items-center gap-5 transition-all duration-300", (isCurrent || isPast) ? "opacity-100" : "opacity-40")}>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all font-bold shrink-0",
                        isPast ? "bg-accent text-white border-none" : isCurrent ? "bg-accent text-white border-none" : "border-2 border-[#333] text-[#555]"
                      )}>
                        {isPast ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : s.id}
                      </div>
                      <span className={cn("text-xs font-bold tracking-[0.1em]", isCurrent ? "text-white" : "text-[#555]")}>{s.label}</span>
                    </div>
                  );
                })}"""

content = content.replace(target, replacement)

target2 = """            <div className="shrink-0 mb-12">
               <h1 className="text-4xl font-black leading-tight mb-4 font-display uppercase tracking-tight">Let's build your<br />learning plan.</h1>
               <p className="text-slate-400 text-sm font-medium">Takes about 3 minutes — then we'll build your first personalized study plan.</p>
            </div>"""

replacement2 = """            <div className="shrink-0 mb-12 mt-12">
               <h1 className="text-[2.5rem] font-black leading-tight mb-4 font-display uppercase tracking-tighter">LET'S BUILD YOUR<br />LEARNING PLAN.</h1>
               <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-sm">Takes about 3 minutes — then we'll build your first personalized study plan.</p>
            </div>"""

content = content.replace(target2, replacement2)

with open('src/App.tsx', 'w') as f:
    f.write(content)
