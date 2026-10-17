import re

with open('src/components/Step3ProfileForm.tsx', 'r') as f:
    content = f.read()

target = """    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-10 text-center">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 mx-auto transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-ink mb-2">Tell us more</h1>
        <p className="text-slate-500">
          {track === 'secondary' 
            ? 'Help us tailor your exam preparation journey.' 
            : 'Let us know what you are studying.'}
        </p>
      </div>"""
replacement = """    <div className="w-full max-w-md mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink mb-6 transition-colors uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-ink mb-3 uppercase tracking-tight font-display">Academic Profile</h1>
        <p className="text-slate-500 font-medium">
          {track === 'secondary' 
            ? 'Help us tailor your exam preparation journey.' 
            : 'Let us know what you are studying.'}
        </p>
      </div>"""
content = content.replace(target, replacement)

button_target = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
        </button>"""
button_replacement = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 mt-10 uppercase tracking-widest"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue →'}
        </button>"""
content = content.replace(button_target, button_replacement)

with open('src/components/Step3ProfileForm.tsx', 'w') as f:
    f.write(content)
