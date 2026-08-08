import re

with open('src/components/Step1SignUp.tsx', 'r') as f:
    content = f.read()

target1 = """      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Create an account</h2>
        <p className="text-slate-500 font-medium">Join uJuzi to get started on your personalized learning journey.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              placeholder="e.g. Chidi Okeke"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="email" 
              className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="password" 
              className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>"""

replacement1 = """      <div className="mb-10">
        <h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Create Account</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-ink/70 uppercase tracking-wider mb-2">Full Name *</label>
          <input 
            type="text" 
            className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
            placeholder="e.g. Chidi Okeke"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-ink/70 uppercase tracking-wider mb-2">Email Address *</label>
          <input 
            type="email" 
            className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-ink/70 uppercase tracking-wider mb-2">Password *</label>
          <input 
            type="password" 
            className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
            placeholder="••••••••"
          />
        </div>
      </div>"""

content = content.replace(target1, replacement1)

target2 = """      <div className="mt-8">
        <button 
          onClick={onNext}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-accent/20"
        >
          Create Account
        </button>"""
replacement2 = """      <div className="mt-12 flex justify-start">
        <button 
          onClick={onNext}
          className="min-w-[200px] bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-accent/20"
        >
          Create Account
        </button>"""
content = content.replace(target2, replacement2)

with open('src/components/Step1SignUp.tsx', 'w') as f:
    f.write(content)
