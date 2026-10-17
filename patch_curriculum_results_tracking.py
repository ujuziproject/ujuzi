import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

import_line = "import { Loader2, BookOpen, BrainCircuit, CheckSquare, Search, FileText, ChevronRight, X, Maximize2, Minimize2, Lightbulb, Play } from 'lucide-react';"
import_line_new = "import { Loader2, BookOpen, BrainCircuit, CheckSquare, Search, FileText, ChevronRight, X, Maximize2, Minimize2, Lightbulb, Play } from 'lucide-react';\nimport { recordStudySession, endStudySession } from '../lib/tracking';"
content = content.replace(import_line, import_line_new)

effect_code = """  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);"""

effect_code_new = """  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Tracking
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
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

content = content.replace(effect_code, effect_code_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
