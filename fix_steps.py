import re

def replace_in_file(filepath, targets_replacements):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        for t, r in targets_replacements:
            if t in content:
                content = content.replace(t, r)
            else:
                print(f"Target not found in {filepath}: {t[:50]}...")
                
        with open(filepath, 'w') as f:
            f.write(content)
    except Exception as e:
        print(f"Error modifying {filepath}: {e}")

# Step 2
s2_target1 = """      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Choose Your Path</h2>
        <p className="text-slate-500 font-medium">Select your current educational stage so we can tailor your experience.</p>
      </div>"""
s2_repl1 = """      <div className="mb-10">
        <h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Choose Your Path</h2>
      </div>"""
s2_target2 = """      <div className="mt-8 flex justify-end">
        <button 
          onClick={onNext}
          disabled={!track}
          className="bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""
s2_repl2 = """      <div className="mt-12 flex justify-start">
        <button 
          onClick={onNext}
          disabled={!track}
          className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""

# Step 3
s3_target1 = """      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Academic Profile</h2>
        <p className="text-slate-500 font-medium">Tell us about your current studies to get relevant materials.</p>
      </div>"""
s3_repl1 = """      <div className="mb-10">
        <h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Academic Profile</h2>
      </div>"""
s3_target2 = """      <div className="mt-8 flex justify-end">
        <button 
          onClick={onNext}
          className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""
s3_repl2 = """      <div className="mt-12 flex justify-start">
        <button 
          onClick={onNext}
          className="min-w-[200px] bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""

# Step 4
s4_target1 = """      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">What are you studying?</h2>
        <p className="text-slate-500 font-medium">Select the subjects or areas you need help with right now.</p>
      </div>"""
s4_repl1 = """      <div className="mb-10">
        <h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Interests</h2>
      </div>"""
s4_target2 = """      <div className="mt-8 flex justify-end">
        <button 
          onClick={onNext}
          disabled={selectedSubjects.length === 0}
          className="bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""
s4_repl2 = """      <div className="mt-12 flex justify-start">
        <button 
          onClick={onNext}
          disabled={selectedSubjects.length === 0}
          className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Next Step
        </button>
      </div>"""

# Step 5
s5_target1 = """      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">Your Learning Style</h2>
        <p className="text-slate-500 font-medium">How do you prefer to consume information and study?</p>
      </div>"""
s5_repl1 = """      <div className="mb-10">
        <h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">Learning Style</h2>
      </div>"""
s5_target2 = """      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleComplete}
          disabled={!style}
          className="bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          {isSubmitting ? "Building Plan..." : "Complete Setup"}
        </button>
      </div>"""
s5_repl2 = """      <div className="mt-12 flex justify-start">
        <button 
          onClick={handleComplete}
          disabled={!style}
          className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          {isSubmitting ? "Building Plan..." : "Complete Setup"}
        </button>
      </div>"""

replace_in_file('src/components/Step2Track.tsx', [(s2_target1, s2_repl1), (s2_target2, s2_repl2)])
replace_in_file('src/components/Step3ProfileForm.tsx', [(s3_target1, s3_repl1), (s3_target2, s3_repl2)])
replace_in_file('src/components/Step4Interests.tsx', [(s4_target1, s4_repl1), (s4_target2, s4_repl2)])
replace_in_file('src/components/Step5LearningStyle.tsx', [(s5_target1, s5_repl1), (s5_target2, s5_repl2)])
