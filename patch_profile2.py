import re

with open('src/components/Profile.tsx', 'r') as f:
    content = f.read()

# Imports
import_target = "import { Step5LearningStyle } from './Step5LearningStyle';"
import_new = "import { Step5LearningStyle } from './Step5LearningStyle';\nimport { UniversityDropdown } from './UniversityDropdown';"
content = content.replace(import_target, import_new)

# State
state_target = """  const [track, setTrack] = useState<Track>('secondary');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');"""
state_new = """  const [track, setTrack] = useState<Track>('secondary');
  const [universityId, setUniversityId] = useState('');
  const [institution, setInstitution] = useState('');
  const [faculty, setFaculty] = useState('Sciences');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  
  const faculties = [
    'Sciences', 'Engineering', 'Medicine & Health Sciences', 'Law', 
    'Arts & Humanities', 'Social Sciences', 'Education', 'Agriculture', 
    'Environmental Sciences', 'Management/Business', 'Computing & Information Technology', 'Other'
  ];"""
content = content.replace(state_target, state_new)

# Fetch
fetch_target = """      if (profile) {
        setTrack(profile.track as Track);
        setInstitution(profile.institution || '');
        setCourse(profile.course || '');"""
fetch_new = """      if (profile) {
        setTrack(profile.track as Track);
        setUniversityId(profile.university_id || '');
        setInstitution(profile.institution_name || profile.institution || '');
        setFaculty(profile.faculty || 'Sciences');
        setCourse(profile.course_of_study || profile.course || '');"""
content = content.replace(fetch_target, fetch_new)

# Update Save - wait we need to check how it was saved earlier.
save_target = """      id: userId,
      track,
      institution: track === 'university' ? institution : null,
      course: track === 'university' ? course : null,
      level: track === 'university' ? level : null,
      exam_type: track === 'secondary' ? examType : null,"""
save_new = """      id: userId,
      track,
      university_id: track === 'university' ? (universityId || null) : null,
      institution_name: track === 'university' ? institution : null,
      faculty: track === 'university' ? faculty : null,
      course_of_study: track === 'university' ? course : null,
      level_year: track === 'university' ? parseInt(level) || null : null,
      exam_type: track === 'secondary' ? examType : null,"""
content = content.replace(save_target, save_new)

# UI
ui_target = """            <div>
              <label className="block text-sm font-bold text-ink mb-2">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                placeholder="University Name"
              />
            </div>"""
ui_new = """            <div>
              <label className="block text-sm font-bold text-ink mb-2">Institution</label>
              <UniversityDropdown
                value={universityId}
                onChange={(id, name) => {
                  setUniversityId(id);
                  setInstitution(name);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Faculty</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              >
                {faculties.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>"""
content = content.replace(ui_target, ui_new)

with open('src/components/Profile.tsx', 'w') as f:
    f.write(content)

