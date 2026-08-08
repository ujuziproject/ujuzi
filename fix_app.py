import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add import
content = content.replace("import { Step5LearningStyle } from './components/Step5LearningStyle';", "import { Step5LearningStyle } from './components/Step5LearningStyle';\nimport { Step6Review } from './components/Step6Review';")

# 2. Update routing in checkSessionAndProfile
target_routing = """      // Check if profile details are filled out (meaning step 3 is done, assuming step 3 creates/updates student_profiles with more fields)
      // Actually we know if they have interests, step 4 is done. Let's check student_interests
      const { data: interests } = await supabase
        .from('student_interests')
        .select('interest_id')
        .eq('student_id', id);

      if (interests && interests.length > 0) {
        if (studentProfile.learning_style_set_at) {
          setStep(6); // Complete
        } else {
          setStep(5); // Learning Style
        }
      } else {
        setStep(4);
      }"""

replacement_routing = """      // Check if profile details are filled out (meaning step 3 is done, assuming step 3 creates/updates student_profiles with more fields)
      // Actually we know if they have interests, step 4 is done. Let's check student_interests
      const { data: interests } = await supabase
        .from('student_interests')
        .select('interest_id')
        .eq('student_id', id);

      if (interests && interests.length > 0) {
        if (studentProfile.learning_style_set_at) {
          setStep(7); // Complete
        } else if (studentProfile.content_format_preference) {
          setStep(6); // Review
        } else {
          setStep(5); // Learning Style
        }
      } else {
        setStep(4);
      }"""
content = content.replace(target_routing, replacement_routing)

# 3. Add column to select in checkSessionAndProfile
target_select = ".select('track, learning_style_set_at, exam_type, course_of_study')"
replacement_select = ".select('track, learning_style_set_at, exam_type, course_of_study, content_format_preference')"
content = content.replace(target_select, replacement_select)

# 4. Update handlers
target_handlers = """  const handleLearningStyleComplete = () => {
    setStep(6);
  };

  const handleLogOut = async () => {"""

replacement_handlers = """  const handleLearningStyleComplete = () => {
    setStep(6);
  };

  const handleReviewComplete = () => {
    setStep(7);
  };

  const handleLogOut = async () => {"""
content = content.replace(target_handlers, replacement_handlers)

# 5. Update main app render
target_main = """  if (step === 6) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }"""
replacement_main = """  if (step === 7) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }"""
content = content.replace(target_main, replacement_main)

# 6. Update steps array
target_steps = """                {[
                  { id: 2, label: "TRACK" },
                  { id: 3, label: "PROFILE" },
                  { id: 4, label: "INTERESTS" },
                  { id: 5, label: "LEARNING STYLE" }
                ].map((s) => {"""
replacement_steps = """                {[
                  { id: 2, label: "TRACK" },
                  { id: 3, label: "PROFILE" },
                  { id: 4, label: "INTERESTS" },
                  { id: 5, label: "LEARNING STYLE" },
                  { id: 6, label: "REVIEW" }
                ].map((s) => {"""
content = content.replace(target_steps, replacement_steps)

# 7. Add step 6 to the render switch
target_switch = """                {step === 5 && <Step5LearningStyle userId={userId} onNext={handleLearningStyleComplete} />}
              </>
            )}"""
replacement_switch = """                {step === 5 && <Step5LearningStyle userId={userId} onNext={handleLearningStyleComplete} />}
                {step === 6 && <Step6Review userId={userId} onNext={handleReviewComplete} />}
              </>
            )}"""
content = content.replace(target_switch, replacement_switch)

# 8. Update save and log out buttons
content = content.replace("step >= 2 && step <= 5", "step >= 2 && step <= 6")

# 9. Update totalSteps if present
content = content.replace("const totalSteps = 5;", "const totalSteps = 6;")

with open('src/App.tsx', 'w') as f:
    f.write(content)
