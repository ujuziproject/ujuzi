import re

with open('src/components/Step2Track.tsx', 'r') as f:
    content = f.read()

target = """    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-3 font-display">Choose your path</h2>
        <p className="text-slate-500">How would you like to use uJuzi?</p>
      </div>

      <div className="grid gap-4">"""
replacement = """    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Choose your path</h2>
        <p className="text-slate-500 font-medium">How would you like to use uJuzi?</p>
      </div>

      <div className="grid gap-4">"""
content = content.replace(target, replacement)

# replace the card selection UI to be a bit more aligned, but we just need to change the continue button
button_target = """      <button 
        onClick={() => onNext(selected as Track)}
        disabled={!selected}
        className="w-full mt-8 flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
      >
        Continue
      </button>"""
button_replacement = """      <button 
        onClick={() => onNext(selected as Track)}
        disabled={!selected}
        className="w-full mt-10 flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 uppercase tracking-widest"
      >
        Continue →
      </button>"""
content = content.replace(button_target, button_replacement)

with open('src/components/Step2Track.tsx', 'w') as f:
    f.write(content)
