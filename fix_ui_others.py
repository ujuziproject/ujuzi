import glob
import re

files = glob.glob('src/components/*.tsx')

for filepath in files:
    if 'Step0' in filepath or 'Step1' in filepath:
        continue
        
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Labels
        content = re.sub(r'className="block text-\[10px\] font-bold text-slate-500 uppercase tracking-widest mb-2"', 'className="block text-sm font-medium text-gray-700 mb-1"', content)
        
        # Inputs
        content = re.sub(r'className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-\[15px\] font-medium text-ink placeholder:text-slate-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"', 'className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"', content)
        content = re.sub(r'className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-\[15px\] font-medium text-ink focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all appearance-none[^"]*"', 'className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"', content)
        
        # Buttons
        content = re.sub(r'className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3\.5 px-8 rounded-xl transition-all shadow-sm active:scale-\[0\.98\] text-\[15px\]"', 'className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-accent/20"', content)
        content = re.sub(r'className="min-w-\[200px\] bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold py-3\.5 px-8 rounded-xl transition-all shadow-sm active:scale-\[0\.98\] text-\[15px\]"', 'className="min-w-[200px] mt-6 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-accent/20"', content)
        
        # In Step 1 & 0 we also had text-center on the header, let's revert it for others too just in case
        content = content.replace('<div className="mb-10">', '<div className="text-center mb-10">')
        content = content.replace('className="text-2xl md:text-3xl font-black text-ink mb-3 uppercase tracking-tight font-display"', 'className="text-3xl font-bold text-ink mb-2"')

        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error {filepath}: {e}")

# In UniversityDropdown.tsx, there was a padded input
with open('src/components/UniversityDropdown.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'className="block w-full pl-12 pr-5 py-\[18px\] bg-\[#fdfdfd\] border-2 border-slate-100/80 rounded-2xl text-\[15px\] font-medium text-ink placeholder:text-slate-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-\[0_2px_10px_rgba\(0,0,0,0\.02\)\] hover:border-slate-200"', 'className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"', content)
with open('src/components/UniversityDropdown.tsx', 'w') as f:
    f.write(content)

