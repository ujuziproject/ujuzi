import re

with open('src/components/Step0Login.tsx', 'r') as f:
    content = f.read()

target = """    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-3 font-display">Welcome Back</h2>
        <p className="text-slate-500">Log in to continue your personalized learning journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">"""
replacement = """    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Welcome Back</h2>
        <p className="text-slate-500 font-medium">Log in to continue your personalized learning journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">"""
content = content.replace(target, replacement)

# update button shape
button_target = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
        </button>"""
button_replacement = """        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 uppercase tracking-widest mt-8"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In →'}
        </button>"""
content = content.replace(button_target, button_replacement)

with open('src/components/Step0Login.tsx', 'w') as f:
    f.write(content)
