import re

# Fix Step1SignUp
with open('src/components/Step1SignUp.tsx', 'r') as f:
    content = f.read()

content = content.replace('<div className="text-center mb-10">', '<div className="mb-10">')
content = content.replace('className="text-3xl font-bold text-ink mb-2"', 'className="text-2xl md:text-3xl font-black text-ink mb-3 uppercase tracking-tight font-display"')
content = content.replace('<button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]">', '<button type="submit" className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]">')
content = content.replace('<div className="mt-6 text-center text-sm text-slate-500">', '<div className="mt-6 text-sm text-slate-500">')

with open('src/components/Step1SignUp.tsx', 'w') as f:
    f.write(content)


# Fix Step0Login
with open('src/components/Step0Login.tsx', 'r') as f:
    content = f.read()

content = content.replace('<div className="text-center mb-10">', '<div className="mb-10">')
content = content.replace('className="text-3xl font-bold text-ink mb-2"', 'className="text-2xl md:text-3xl font-black text-ink mb-3 uppercase tracking-tight font-display"')
content = content.replace('<button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]">', '<button type="submit" className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]">')
content = content.replace('<div className="mt-6 text-center text-sm text-slate-500">', '<div className="mt-6 text-sm text-slate-500">')

with open('src/components/Step0Login.tsx', 'w') as f:
    f.write(content)

