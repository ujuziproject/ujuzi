import re

with open('src/components/CurriculumUpload.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';"
import_new = "import { Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle, Search } from 'lucide-react';"
content = content.replace(import_target, import_new)

state_target = """  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');"""
state_new = """  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  
  const [findingCurriculum, setFindingCurriculum] = useState(false);
  const [findingError, setFindingError] = useState('');
  const [findingSuccess, setFindingSuccess] = useState('');
  const [profileData, setProfileData] = useState<any>(null);"""
content = content.replace(state_target, state_new)

effect_target = """  useEffect(() => {
    supabase.from('student_profiles').select('content_format_preference, explanation_complexity_preference, learning_style_set_at').eq('id', userId).maybeSingle().then(({data}) => {
       if (data && data.learning_style_set_at) {
          setPrefs({
             contentFormat: data.content_format_preference,
             explanationComplexity: data.explanation_complexity_preference
          });
       }
    });
  }, [userId]);"""
effect_new = """  useEffect(() => {
    supabase.from('student_profiles').select('content_format_preference, explanation_complexity_preference, learning_style_set_at, track, institution_name, faculty, course_of_study').eq('id', userId).maybeSingle().then(({data}) => {
       if (data) {
          setProfileData(data);
          if (data.learning_style_set_at) {
            setPrefs({
               contentFormat: data.content_format_preference,
               explanationComplexity: data.explanation_complexity_preference
            });
          }
       }
    });
  }, [userId]);"""
content = content.replace(effect_target, effect_new)

ui_target = """          {inputType === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-ink/80 mb-2">Paste Text</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste the raw text of the curriculum here..."
                className="w-full h-48 p-4 rounded-xl border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm resize-none bg-surface"
              />
            </div>
          )}"""
ui_new = """          {inputType === 'text' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-ink/80">Paste Text</label>
                <button 
                  type="button"
                  onClick={async () => {
                     if (!title) {
                         setFindingError('Please enter a Curriculum Title first.');
                         return;
                     }
                     
                     setFindingCurriculum(true);
                     setFindingError('');
                     setFindingSuccess('');
                     
                     try {
                         const res = await fetch('/api/find-curriculum', {
                             method: 'POST',
                             headers: {'Content-Type': 'application/json'},
                             body: JSON.stringify({
                                 courseName: title,
                                 university: profileData?.track === 'university' ? profileData?.institution_name : undefined,
                                 faculty: profileData?.track === 'university' ? profileData?.faculty : undefined,
                                 courseOfStudy: profileData?.track === 'university' ? profileData?.course_of_study : undefined
                             })
                         });
                         if (!res.ok) throw new Error('Failed to find curriculum');
                         const data = await res.json();
                         setText(data.text);
                         if (data.isReal) {
                             setFindingSuccess('Found what appears to be the official curriculum — please still verify against your department.');
                         } else {
                             setFindingSuccess('This is a general, AI-suggested curriculum, not your official one — please verify with your department before relying on it fully.');
                         }
                     } catch(e: any) {
                         setFindingError(e.message);
                     } finally {
                         setFindingCurriculum(false);
                     }
                  }}
                  disabled={findingCurriculum}
                  className="text-sm font-bold text-accent hover:text-ink transition-colors flex items-center gap-1"
                >
                  {findingCurriculum ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  I don't have it — help me find one
                </button>
              </div>
              
              {findingError && <div className="mb-3 text-xs text-red-600 bg-red-50 p-3 rounded-lg">{findingError}</div>}
              {findingSuccess && <div className="mb-3 text-xs text-ink bg-accent-warm/20 p-3 rounded-lg font-medium">{findingSuccess}</div>}

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste the raw text of the curriculum here..."
                className="w-full h-48 p-4 rounded-xl border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm resize-none bg-surface"
              />
            </div>
          )}"""
content = content.replace(ui_target, ui_new)

with open('src/components/CurriculumUpload.tsx', 'w') as f:
    f.write(content)
