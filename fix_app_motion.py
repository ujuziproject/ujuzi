import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# add motion import
if 'import { AnimatePresence, motion } from' not in content:
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { AnimatePresence, motion } from 'motion/react';")

target_switch = """            {showDelight ? (
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
                {step === 6 && <Step6Review userId={userId} onNext={handleReviewComplete} />}
              </>
            )}"""

replacement_switch = """            <AnimatePresence mode="wait">
              {showDelight ? (
                <motion.div 
                  key="delight"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center justify-center h-full w-full"
                >
                   <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <h2 className="text-2xl font-black font-display text-ink uppercase tracking-wide">
                     Great choice! 🎉
                   </h2>
                   <p className="text-slate-500 font-medium mt-3">
                     Let's get your {track === 'secondary' ? 'Secondary' : track === 'university' ? 'University' : 'Custom'} plan ready.
                   </p>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="w-full flex-1"
                >
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
                  {step === 6 && <Step6Review userId={userId} onNext={handleReviewComplete} />}
                </motion.div>
              )}
            </AnimatePresence>"""

content = content.replace(target_switch, replacement_switch)

with open('src/App.tsx', 'w') as f:
    f.write(content)
