import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_handle = """  const handleTrackSelect = (selectedTrack: Track) => {
    setTrack(selectedTrack);
    setStep(3);
  };"""

new_handle = """  const handleTrackSelect = async (selectedTrack: Track) => {
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

content = content.replace(old_handle, new_handle)

with open('src/App.tsx', 'w') as f:
    f.write(content)
