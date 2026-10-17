import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                        isPast ? "bg-accent text-white border-none" : isCurrent ? "bg-accent text-white border-none" : "border-2 border-[#333] text-[#555]"
                      )}>"""

replacement = """                        isPast ? "bg-white text-ink border-none" : isCurrent ? "bg-white text-ink border-none" : "border-2 border-[#333] text-[#555]"
                      )}>"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
