import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        {/* Mobile Header */}
        <div className="md:hidden h-20 border-b border-slate-800 bg-ink px-6 flex items-center justify-between shrink-0">
          <span className="text-2xl font-black tracking-tighter font-display text-white"><span className="text-accent text-[28px]">u</span>Juzi</span>"""

replacement = """        {/* Mobile Header */}
        <div className="md:hidden h-20 border-b border-slate-800 bg-ink px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-white p-1 rounded-lg flex items-center justify-center font-black text-sm w-8 h-8 shrink-0 shadow-[0_0_10px_rgba(91,79,232,0.5)]">uJ</div>
            <span className="text-xl font-bold tracking-tight font-display text-white">uJuzi</span>
          </div>"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
