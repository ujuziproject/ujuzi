import fs from 'fs';
let f = fs.readFileSync('src/components/FlashcardReviewer.tsx', 'utf-8');

if (!f.includes('const [internalCards, setInternalCards] = useState<Flashcard[]>')) {
  f = f.replace(
    'export function FlashcardReviewer({ userId, flashcards }: FlashcardReviewerProps) {',
    `export function FlashcardReviewer({ userId, flashcards }: FlashcardReviewerProps) {
  const [internalCards, setInternalCards] = useState<Flashcard[]>(flashcards);
  
  useEffect(() => {
    if (flashcards.length === 0) {
      // fetch all flashcards for this user
      async function fetchUserFlashcards() {
        // Need to get all topics for this user's curricula/courses
        const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
        const track = profile?.track || 'secondary';
        
        let allTopicIds = [];
        if (track === 'university') {
            const { data: sems } = await supabase.from('semesters').select('id').eq('student_id', userId);
            if (sems && sems.length > 0) {
                const { data: cs } = await supabase.from('courses').select('id').in('semester_id', sems.map(s => s.id));
                if (cs && cs.length > 0) {
                    const { data: ts } = await supabase.from('topics').select('id').in('course_id', cs.map(c => c.id));
                    if (ts) allTopicIds = ts.map(t => t.id);
                }
            }
        } else if (track === 'independent') {
            const { data: goals } = await supabase.from('learning_goals').select('id').eq('student_id', userId);
            if (goals && goals.length > 0) {
                const { data: cs } = await supabase.from('courses').select('id').in('goal_id', goals.map(g => g.id));
                if (cs && cs.length > 0) {
                    const { data: ts } = await supabase.from('topics').select('id').in('course_id', cs.map(c => c.id));
                    if (ts) allTopicIds = ts.map(t => t.id);
                }
            }
        } else {
            const { data: currs } = await supabase.from('curricula').select('id').eq('student_id', userId);
            if (currs && currs.length > 0) {
                const { data: ts } = await supabase.from('topics').select('id').in('curriculum_id', currs.map(c => c.id));
                if (ts) allTopicIds = ts.map(t => t.id);
            }
        }
        
        if (allTopicIds.length > 0) {
            const { data: fcs } = await supabase.from('flashcards').select('*').in('topic_id', allTopicIds);
            if (fcs) setInternalCards(fcs);
        }
      }
      fetchUserFlashcards();
    }
  }, [userId, flashcards]);`
  );
  
  f = f.replace(
    'const due = flashcards.filter(fc => {',
    'const due = internalCards.filter(fc => {'
  );
  f = f.replace(
    '}, [userId, flashcards]);',
    '}, [userId, internalCards]);'
  );
  
  fs.writeFileSync('src/components/FlashcardReviewer.tsx', f);
}
