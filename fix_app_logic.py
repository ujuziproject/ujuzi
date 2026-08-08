import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update checkSessionAndProfile
target_check = """      // Check if profile details are filled out (meaning step 3 is done, assuming step 3 creates/updates student_profiles with more fields)
      // Actually we know if they have interests, step 4 is done. Let's check student_interests
      const { data: interests } = await supabase
        .from('student_interests')"""

replacement_check = """      // Determine if Step 3 is completed based on track
      let step3Completed = false;
      if (studentProfile.track === 'independent') {
        step3Completed = true;
      } else if (studentProfile.track === 'secondary') {
        if (studentProfile.exam_type) step3Completed = true;
      } else if (studentProfile.track === 'university') {
        if (studentProfile.course_of_study) step3Completed = true;
      }

      if (!step3Completed) {
        setStep(3);
        setLoadingSession(false);
        return;
      }

      // Check if profile details are filled out (meaning step 3 is done, assuming step 3 creates/updates student_profiles with more fields)
      // Actually we know if they have interests, step 4 is done. Let's check student_interests
      const { data: interests } = await supabase
        .from('student_interests')"""

content = content.replace(target_check, replacement_check)

# Update the select fields to also fetch exam_type and course_of_study so we can check them
target_select = ".select('track, learning_style_set_at')"
replacement_select = ".select('track, learning_style_set_at, exam_type, course_of_study')"
content = content.replace(target_select, replacement_select)

# Update handleTrackSelect
target_handle = """        if (selectedTrack === 'independent') {
          try {
            await supabase.from('student_profiles').insert({ id: userId, track: 'independent' });
            setStep(4);
          } catch (err) {
            console.error('Error saving independent track', err);
          }
        } else {
          setStep(3);
        }"""

replacement_handle = """        try {
          await supabase.from('student_profiles').upsert({ id: userId, track: selectedTrack });
        } catch (err) {
          console.error('Error saving track', err);
        }
        if (selectedTrack === 'independent') {
          setStep(4);
        } else {
          setStep(3);
        }"""

content = content.replace(target_handle, replacement_handle)

# Let's change the logout button text during onboarding to "Save & Log out" if step >= 2
# We can do this in the render logic
target_btn1 = """{userId ? (
            <button onClick={handleLogOut} className="text-[10px] font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">Log Out</button>
          )"""
replacement_btn1 = """{userId ? (
            <button onClick={handleLogOut} className="text-[10px] font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">{step >= 2 && step <= 5 ? 'Save & Log out' : 'Log Out'}</button>
          )"""

target_btn2 = """{userId ? (
            <button onClick={handleLogOut} className="text-[11px] font-bold text-slate-400 hover:text-accent transition-colors uppercase tracking-widest">Log Out</button>
          )"""
replacement_btn2 = """{userId ? (
            <button onClick={handleLogOut} className="text-[11px] font-bold text-slate-400 hover:text-accent transition-colors uppercase tracking-widest">{step >= 2 && step <= 5 ? 'Save & Log out' : 'Log Out'}</button>
          )"""

content = content.replace(target_btn1, replacement_btn1)
content = content.replace(target_btn2, replacement_btn2)

with open('src/App.tsx', 'w') as f:
    f.write(content)

