import re

with open('src/components/Step3ProfileForm.tsx', 'r') as f:
    content = f.read()

target = """    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-500 hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-3 font-display">Academic Profile</h2>
        <p className="text-slate-500">Tell us a bit about where you are in your studies.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">"""
replacement = """    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center text-xs font-bold text-slate-500 hover:text-ink transition-colors mb-6 uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Academic Profile</h2>
        <p className="text-slate-500 font-medium">Tell us a bit about where you are in your studies.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">"""
content = content.replace(target, replacement)

button_target = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
        </button>"""
button_replacement = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 uppercase tracking-widest mt-10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue →'}
        </button>"""
content = content.replace(button_target, button_replacement)

# Make inputs more generously spaced if possible, but form fields are standard so just let them be for now

with open('src/components/Step3ProfileForm.tsx', 'w') as f:
    f.write(content)
