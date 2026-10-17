import fs from 'fs';

let content = fs.readFileSync('src/components/Profile.tsx', 'utf-8');

const oldVars = `  const [examType, setExamType] = useState('WAEC');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [msg, setMsg] = useState('');`;

const newVars = `  const [examType, setExamType] = useState('WAEC');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [examDate, setExamDate] = useState('');
  const [msg, setMsg] = useState('');`;

content = content.replace(oldVars, newVars);

const oldLoad = `      setExamType(profile.exam_type || 'WAEC');
      setExamYear(profile.exam_year?.toString() || new Date().getFullYear().toString());`;

const newLoad = `      setExamType(profile.exam_type || 'WAEC');
      setExamYear(profile.exam_year?.toString() || new Date().getFullYear().toString());
      setExamDate(profile.exam_date || '');`;

content = content.replace(oldLoad, newLoad);

const oldSave = `      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,`;

const newSave = `      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,
      exam_date: track === 'secondary' && examDate ? examDate : null,`;

content = content.replace(oldSave, newSave);

const oldExamInputs = `<div className="space-y-2">
              <label className="block text-sm font-bold text-ink mb-2">Target Year</label>`;

const newExamInputs = `<div>
              <label className="block text-sm font-bold text-ink mb-2">Exam Date (Optional)</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink mb-2">Target Year</label>`;

content = content.replace(oldExamInputs, newExamInputs);

const oldAfterUpdate = `    const { error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      setMsg('Error saving profile');
    } else {
      setMsg('Profile updated!');
    }`;

const newAfterUpdate = `    const { data: currentProfile } = await supabase.from('student_profiles').select('exam_date').eq('id', userId).single();
    const oldExamDate = currentProfile?.exam_date;

    const { error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      setMsg('Error saving profile');
    } else {
      setMsg('Profile updated!');
      if (track === 'secondary' && updates.exam_date !== oldExamDate) {
        const { adjustStudyPlan } = await import('../lib/pacing');
        await adjustStudyPlan(userId, 'secondary');
      }
    }`;

content = content.replace(oldAfterUpdate, newAfterUpdate);

fs.writeFileSync('src/components/Profile.tsx', content);
