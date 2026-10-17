import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, BookOpen, Layers, CheckSquare, ArrowLeft, Edit2 } from 'lucide-react';"
import_new = "import { Loader2, BookOpen, Layers, CheckSquare, ArrowLeft, Edit2, Clock, CheckCircle2 } from 'lucide-react';\nimport { recordStudySession, endStudySession, saveSessionReflection } from '../lib/tracking';"

content = content.replace(import_target, import_new)
content = content.replace("import { recordStudySession, endStudySession } from '../lib/tracking';", "")

state_target = """  // Tracking
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {"""
state_new = """  // Tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
       setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {"""
content = content.replace(state_target, state_new)

effect_target = """  useEffect(() => {
    let currentSessionId: string | null = null;
    
    async function startSession() {
      const id = await recordStudySession(userId, topic.id, activeTab);
      currentSessionId = id;
      setSessionId(id);
    }
    
    startSession();
    
    return () => {
      if (currentSessionId) {
        endStudySession(currentSessionId);
      }
    };
  }, [activeTab, topic.id, userId]);"""
effect_new = """  useEffect(() => {
    let currentSessionId: string | null = null;
    
    async function startSession() {
      const id = await recordStudySession(userId, topic.id, activeTab);
      currentSessionId = id;
      setSessionId(id);
    }
    
    startSession();
    setElapsedSeconds(0);
    
    return () => {
      if (currentSessionId) {
        endStudySession(currentSessionId);
      }
    };
  }, [activeTab, topic.id, userId]);"""
content = content.replace(effect_target, effect_new)

ui_target = """      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Topics
      </button>"""
ui_new = """      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
            <Clock className="w-4 h-4 text-accent" />
            <span className="font-mono">{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <button 
            onClick={() => {
              if (sessionId) {
                endStudySession(sessionId);
                setCompletedSessionId(sessionId);
                setShowReflection(true);
              }
            }}
            className="text-sm font-bold bg-ink text-white px-4 py-1.5 rounded-full shadow-sm hover:bg-ink/90 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
      
      {showReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-ink mb-2">Session Complete!</h3>
            <p className="text-sm text-slate-500 mb-6">Take a moment to jot down quick reflective notes about what you just studied.</p>
            <textarea
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="e.g. I struggled with the third formula, need to review it tomorrow..."
              className="w-full h-32 p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent text-sm resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowReflection(false);
                  setReflectionText('');
                  onBack();
                }}
                className="px-5 py-2.5 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
              >
                Skip
              </button>
              <button 
                onClick={async () => {
                  if (completedSessionId && reflectionText.trim()) {
                    await saveSessionReflection(completedSessionId, reflectionText.trim());
                  }
                  setShowReflection(false);
                  setReflectionText('');
                  onBack();
                }}
                className="px-5 py-2.5 rounded-full font-bold bg-accent text-white hover:bg-accent/90 shadow-md transition-colors text-sm"
              >
                Save Note & Close
              </button>
            </div>
          </div>
        </div>
      )}
"""
content = content.replace(ui_target, ui_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
