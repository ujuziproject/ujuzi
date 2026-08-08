import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_target = "import { Step4Interests } from './components/Step4Interests';"
import_new = "import { Step4Interests } from './components/Step4Interests';\nimport { Step5LearningStyle } from './components/Step5LearningStyle';"
content = content.replace(import_target, import_new)

# Update select
select_target = """      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('track')"""
select_new = """      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('track, learning_style_set_at')"""
content = content.replace(select_target, select_new)

# Update step logic
step_logic_target = """      if (interests && interests.length > 0) {
        setStep(5); // Complete
      } else {
        // If we want to be more granular we could check fields in studentProfile, 
        // but let's assume if track is set, they need to do step 3 next, unless step 3 is also saved.
        // For simplicity, let's route to Step 4 if studentProfile exists (assume step 3 done for now), 
        // or actually since studentProfile is created in Step 3, if it exists, they just need interests.
        setStep(4);
      }"""
step_logic_new = """      if (interests && interests.length > 0) {
        if (studentProfile.learning_style_set_at) {
          setStep(6); // Complete
        } else {
          setStep(5); // Learning Style
        }
      } else {
        setStep(4);
      }"""
content = content.replace(step_logic_target, step_logic_new)

# Update handlers
handlers_target = """  const handleInterestsComplete = () => {
    setStep(5);
  };"""
handlers_new = """  const handleInterestsComplete = () => {
    setStep(5);
  };

  const handleLearningStyleComplete = () => {
    setStep(6);
  };"""
content = content.replace(handlers_target, handlers_new)

# Update totalSteps
total_steps_target = "const totalSteps = 4;"
total_steps_new = "const totalSteps = 5;"
content = content.replace(total_steps_target, total_steps_new)

# Update main conditional rendering
main_render_target = "if (step === 5) {"
main_render_new = "if (step === 6) {"
content = content.replace(main_render_target, main_render_new)

# Update step markers in UI (add step 5)
marker_target = """              <div className={cn("flex items-center gap-4 transition-opacity", step > 4 ? "opacity-100" : (step === 4 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 4 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>4</div>
                <span className="text-sm font-medium">Interests</span>
              </div>
            </div>"""
marker_new = """              <div className={cn("flex items-center gap-4 transition-opacity", step > 4 ? "opacity-100" : (step === 4 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 4 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>4</div>
                <span className="text-sm font-medium">Interests</span>
              </div>
              <div className={cn("flex items-center gap-4 transition-opacity", step > 5 ? "opacity-100" : (step === 5 ? "opacity-100" : "opacity-50"))}>
                <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors", step >= 5 ? "bg-accent border-accent text-white" : "border-slate-600 text-slate-400")}>5</div>
                <span className="text-sm font-medium">Learning Style</span>
              </div>
            </div>"""
content = content.replace(marker_target, marker_new)

# Update main body routing
body_target = """            {step === 4 && <Step4Interests userId={userId} onNext={handleInterestsComplete} />}
          </div>
        </div>"""
body_new = """            {step === 4 && <Step4Interests userId={userId} onNext={handleInterestsComplete} />}
            {step === 5 && <Step5LearningStyle userId={userId} onNext={handleLearningStyleComplete} />}
          </div>
        </div>"""
content = content.replace(body_target, body_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

