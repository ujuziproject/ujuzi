import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I will replace the sidebar logic.
sidebar_target = """      {/* Sidebar logic */}
      <div className="hidden md:flex w-1/3 bg-ink p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-accent) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl italic shadow-[0_0_15px_rgba(91,79,232,0.5)]">uJ</div>
              <span className="text-2xl font-bold tracking-tight font-display">uJuzi</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight mb-6 font-display">Shape your future with tailored education.</h1>
            <p className="text-slate-400 text-lg leading-relaxed">Complete your profile to discover resources and exams curated specifically for your academic journey in Nigeria.</p>
          </div>
          
          {step > 0 && (
            <div className="relative z-10 space-y-6">
              <div className={cn("flex items-center gap-4 transition-opacity", step > 1 ? "opacity-100" : (step === 1 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 1 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>1</div>
                <span className="text-sm font-medium">Create Account</span>
              </div>
              <div className={cn("flex items-center gap-4 transition-opacity", step > 2 ? "opacity-100" : (step === 2 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 2 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>2</div>
                <span className="text-sm font-medium">Select Track</span>
              </div>
              <div className={cn("flex items-center gap-4 transition-opacity", step > 3 ? "opacity-100" : (step === 3 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 3 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>3</div>
                <span className="text-sm font-medium">Academic Profile</span>
              </div>
              <div className={cn("flex items-center gap-4 transition-opacity", step > 4 ? "opacity-100" : (step === 4 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 4 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>4</div>
                <span className="text-sm font-medium">Interests</span>
              </div>
              <div className={cn("flex items-center gap-4 transition-opacity", step > 5 ? "opacity-100" : (step === 5 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 5 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>5</div>
                <span className="text-sm font-medium">Learning Style</span>
              </div>
            </div>
          )}
        </div>"""

sidebar_replacement = """      {/* Sidebar logic */}
      <div className="hidden md:flex w-1/3 bg-ink p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-accent) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-16 shrink-0">
              <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl italic shadow-[0_0_15px_rgba(91,79,232,0.5)]">uJ</div>
              <span className="text-2xl font-bold tracking-tight font-display">uJuzi</span>
            </div>
            
            <div className="shrink-0 mb-12">
               <h1 className="text-4xl font-black leading-tight mb-4 font-display uppercase tracking-tight">Let's build your<br />learning plan.</h1>
               <p className="text-slate-400 text-sm font-medium">Takes about 3 minutes — then we'll build your first personalized study plan.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {[
                  { id: 1, label: "Create Account" },
                  { id: 2, label: "Choose Your Path" },
                  { id: 3, label: "Academic Profile" },
                  { id: 4, label: "Interests" },
                  { id: 5, label: "Learning Style" }
                ].map((s) => {
                  const isCurrent = step === s.id;
                  const isPast = step > s.id;
                  return (
                    <div key={s.id} className={cn("flex items-center gap-4 transition-opacity", (isCurrent || isPast) ? "opacity-100" : "opacity-40")}>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all font-bold",
                        isPast ? "bg-success text-white border-none" : isCurrent ? "bg-accent text-white border-none" : "border-2 border-slate-600 text-slate-400"
                      )}>
                        {isPast ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : s.id}
                      </div>
                      <span className={cn("text-sm font-bold tracking-wide", isCurrent ? "text-white" : "text-slate-300")}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-8 shrink-0 border-t border-white/10 pt-6">
               <p className="text-xs text-slate-500 font-medium">Your answers are private and only used to personalize your study materials.</p>
            </div>
          </div>
        </div>"""

content = content.replace(sidebar_target, sidebar_replacement)

# Also remove the step progress bar in the top right of the right panel, we just want a clean top area, maybe with "← Back" inside the components if needed, or we can just clear it.
right_top_target = """        <div className="h-20 border-b border-border bg-white px-6 md:px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <>
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Step {step} of {totalSteps}</span>
                <div className="h-1 w-32 md:w-48 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                </div>
              </>
            )}
          </div>
          {userId ? (
            <button onClick={handleLogOut} className="text-sm font-semibold text-slate-500 hover:text-accent transition-colors">Log Out</button>
          ) : (
            <button className="text-sm font-semibold text-slate-500 hover:text-accent transition-colors">Help</button>
          )}
        </div>"""

right_top_replacement = """        <div className="h-20 border-b border-border bg-white px-6 md:px-12 flex items-center justify-end shrink-0">
          {userId ? (
            <button onClick={handleLogOut} className="text-sm font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-wider">Log Out</button>
          ) : (
            <button className="text-sm font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-wider">Help</button>
          )}
        </div>"""

content = content.replace(right_top_target, right_top_replacement)

# Let's add the transition screen state
state_target = """  const [track, setTrack] = useState<Track>('secondary');
  const [loadingSession, setLoadingSession] = useState(true);"""
state_replacement = """  const [track, setTrack] = useState<Track>('secondary');
  const [loadingSession, setLoadingSession] = useState(true);
  const [showDelight, setShowDelight] = useState(false);"""
content = content.replace(state_target, state_replacement)

# Delight handler in handleTrackSelect
track_target = """  const handleTrackSelect = async (selectedTrack: Track) => {
    setTrack(selectedTrack);
    if (selectedTrack === 'independent') {
      try {
        await supabase.from('student_profiles').insert({ id: userId, track: 'independent' });
        setStep(4);
      } catch (err) {
        console.error('Error saving independent track', err);
      }
    } else {
      setStep(3);
    }
  };"""
track_replacement = """  const handleTrackSelect = async (selectedTrack: Track) => {
    setTrack(selectedTrack);
    
    // Show moment of delight
    setShowDelight(true);
    
    setTimeout(async () => {
        setShowDelight(false);
        if (selectedTrack === 'independent') {
          try {
            await supabase.from('student_profiles').insert({ id: userId, track: 'independent' });
            setStep(4);
          } catch (err) {
            console.error('Error saving independent track', err);
          }
        } else {
          setStep(3);
        }
    }, 1500); // 1.5s delay
  };"""
content = content.replace(track_target, track_replacement)

# Wrap step components to handle the transition
step_target = """          <div className="w-full max-w-xl mx-auto">
            {step === 0 && <Step0Login onNext={handleLoginComplete} onSignUpClick={() => setStep(1)} />}
            {step === 1 && <Step1SignUp onNext={handleSignUpComplete} onLoginClick={() => setStep(0)} />}
            {step === 2 && <Step2Track onNext={handleTrackSelect} />}
            {step === 3 && (
              <Step3ProfileForm 
                userId={userId} 
                track={track} 
                onNext={handleProfileComplete} 
                onBack={() => setStep(2)} 
              />
            )}
            {step === 4 && <Step4Interests userId={userId} onNext={handleInterestsComplete} />}
            {step === 5 && <Step5LearningStyle userId={userId} onNext={handleLearningStyleComplete} />}
          </div>"""

step_replacement = """          <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center">
            {showDelight ? (
              <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center justify-center">
                 <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h2 className="text-2xl font-black font-display text-ink uppercase tracking-wide">
                   Great choice! 🎉
                 </h2>
                 <p className="text-slate-500 font-medium mt-3">
                   Let's get your {track === 'secondary' ? 'Secondary' : track === 'university' ? 'University' : 'Custom'} plan ready.
                 </p>
              </div>
            ) : (
              <>
                {step === 0 && <Step0Login onNext={handleLoginComplete} onSignUpClick={() => setStep(1)} />}
                {step === 1 && <Step1SignUp onNext={handleSignUpComplete} onLoginClick={() => setStep(0)} />}
                {step === 2 && <Step2Track onNext={handleTrackSelect} />}
                {step === 3 && (
                  <Step3ProfileForm 
                    userId={userId} 
                    track={track} 
                    onNext={handleProfileComplete} 
                    onBack={() => setStep(2)} 
                  />
                )}
                {step === 4 && <Step4Interests userId={userId} onNext={handleInterestsComplete} />}
                {step === 5 && <Step5LearningStyle userId={userId} onNext={handleLearningStyleComplete} />}
              </>
            )}
          </div>"""
content = content.replace(step_target, step_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
