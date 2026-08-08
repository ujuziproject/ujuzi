import re

with open('src/components/Profile.tsx', 'r') as f:
    content = f.read()

# State variables
state_target = """  const [examType, setExamType] = useState('WAEC');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [msg, setMsg] = useState('');"""
state_new = """  const [examType, setExamType] = useState('WAEC');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [msg, setMsg] = useState('');
  
  const [contentFormat, setContentFormat] = useState('balanced');
  const [explanationComplexity, setExplanationComplexity] = useState('balanced');
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const [retakingQuiz, setRetakingQuiz] = useState(false);"""
content = content.replace(state_target, state_new)


effect_target = """  useEffect(() => {
    async function loadProfile() {
      const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', userId).maybeSingle();
      if (profile) {
        setTrack(profile.track as Track);
        setInstitution(profile.institution || '');
        setCourse(profile.course || '');
        setLevel(profile.level || '');
        setExamType(profile.exam_type || 'WAEC');
        setExamYear(profile.exam_year?.toString() || new Date().getFullYear().toString());
      }
      setLoading(false);
    }
    loadProfile();
  }, [userId]);"""
effect_new = """  const loadProfile = async () => {
    const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', userId).maybeSingle();
    if (profile) {
      setTrack(profile.track as Track);
      setInstitution(profile.institution || '');
      setCourse(profile.course || '');
      setLevel(profile.level || '');
      setExamType(profile.exam_type || 'WAEC');
      setExamYear(profile.exam_year?.toString() || new Date().getFullYear().toString());
      
      setContentFormat(profile.content_format_preference || 'balanced');
      setExplanationComplexity(profile.explanation_complexity_preference || 'balanced');
      setHasTakenQuiz(!!profile.learning_style_set_at);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);"""
content = content.replace(effect_target, effect_new)

# Save
save_target = """      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,
      updated_at: new Date().toISOString(),
    };"""
save_new = """      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,
      content_format_preference: contentFormat,
      explanation_complexity_preference: explanationComplexity,
      updated_at: new Date().toISOString(),
    };"""
content = content.replace(save_target, save_new)


# UI
ui_target = """        )}
        <div className="pt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-success">{msg}</span>"""
ui_new = """        )}
        
        <div className="pt-6 border-t border-border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-ink mb-1 font-display">Learning Style</h3>
              <p className="text-sm text-slate-500">
                {hasTakenQuiz 
                  ? "Based on your quiz results, or customized by you." 
                  : "Take the quiz to personalize your learning style, or set manually."}
              </p>
            </div>
            {!retakingQuiz && (
              <button
                onClick={() => setRetakingQuiz(true)}
                className="text-sm font-bold text-accent bg-accent/10 px-4 py-2 rounded-full hover:bg-accent/20 transition-colors"
              >
                {hasTakenQuiz ? "Retake Quiz" : "Take Quiz"}
              </button>
            )}
          </div>

          {retakingQuiz ? (
             <div className="bg-surface rounded-2xl p-2">
                 <div className="mb-4 flex justify-end px-4 pt-4">
                     <button onClick={() => { setRetakingQuiz(false); loadProfile(); }} className="text-sm text-slate-500 font-semibold hover:text-ink">Cancel</button>
                 </div>
                 <Step5LearningStyleWrapper userId={userId} onComplete={() => { setRetakingQuiz(false); loadProfile(); }} />
             </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Content Format</label>
                <select
                  value={contentFormat}
                  onChange={(e) => setContentFormat(e.target.value)}
                  className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                >
                  <option value="visual">Visual (Diagrams & Structure)</option>
                  <option value="text">Text (Detailed Written Notes)</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Explanation Complexity</label>
                <select
                  value={explanationComplexity}
                  onChange={(e) => setExplanationComplexity(e.target.value)}
                  className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                >
                  <option value="simple">Simple (Analogies & Basics)</option>
                  <option value="advanced">Advanced (Technical & Precise)</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border mt-4 pt-6">
          <span className="text-sm font-semibold text-success">{msg}</span>"""
content = content.replace(ui_target, ui_new)


import_target = "import { Track } from '../types';"
import_new = "import { Track } from '../types';\nimport { Step5LearningStyle } from './Step5LearningStyle';\n\nfunction Step5LearningStyleWrapper({userId, onComplete}: {userId: string, onComplete: () => void}) {\n  return <Step5LearningStyle userId={userId} onNext={onComplete} />;\n}"
content = content.replace(import_target, import_new)

with open('src/components/Profile.tsx', 'w') as f:
    f.write(content)
