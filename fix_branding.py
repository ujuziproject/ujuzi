import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """            <div className="flex items-center mb-16 shrink-0">
              <span className="text-[32px] font-black tracking-tighter font-display text-white"><span className="text-accent">u</span>Juzi</span>
            </div>"""

replacement = """            <div className="flex items-center gap-2 mb-16 shrink-0">
              <div className="h-10 w-10 bg-accent text-white rounded-lg flex items-center justify-center font-bold text-xl italic shadow-[0_0_15px_rgba(91,79,232,0.5)]">uJ</div>
              <span className="text-2xl font-bold tracking-tight font-display text-white">uJuzi</span>
            </div>"""

content = content.replace(target, replacement)

target2 = """        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tighter font-display text-ink"><span className="text-accent">u</span>Juzi</span>
        </div>"""

replacement2 = """        <div className="flex items-center gap-2">
          <div className="bg-accent text-white p-1 rounded-lg flex items-center justify-center font-black text-sm w-8 h-8 shrink-0">uJ</div>
          <span className="text-xl font-black tracking-tight font-display text-ink">uJuzi</span>
        </div>"""

content = content.replace(target2, replacement2)

with open('src/App.tsx', 'w') as f:
    f.write(content)

