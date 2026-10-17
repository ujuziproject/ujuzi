import re

with open('src/components/Step4Interests.tsx', 'r') as f:
    content = f.read()

target = """    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-3 font-display">What are you interested in?</h2>
        <p className="text-slate-500">Select topics you enjoy. We'll use these to recommend study materials.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10 justify-center">"""
replacement = """    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">What are you interested in?</h2>
        <p className="text-slate-500 font-medium">Select topics you enjoy. We'll use these to recommend study materials.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">"""
content = content.replace(target, replacement)

button_target = """      <button 
        onClick={handleSave}
        disabled={loading || selected.length === 0}
        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Interests'}
      </button>"""
button_replacement = """      <button 
        onClick={handleSave}
        disabled={loading || selected.length === 0}
        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 uppercase tracking-widest mt-10"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue →'}
      </button>"""
content = content.replace(button_target, button_replacement)

with open('src/components/Step4Interests.tsx', 'w') as f:
    f.write(content)
