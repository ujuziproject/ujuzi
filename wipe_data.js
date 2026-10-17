import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'planner_items',
  'study_sessions',
  'flashcard_reviews',
  'quiz_attempts',
  'quiz_questions',
  'quizzes',
  'flashcards',
  'lecture_notes',
  'activity_log',
  'topics',
  'courses',
  'curricula',
  'learning_goals',
  'semesters',
  'streaks',
  'student_interests',
  'student_profiles',
  'profiles'
];

async function wipe() {
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1000);
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      continue;
    }
    if (data && data.length > 0) {
      const ids = data.map(d => d.id);
      const { error: delError } = await supabase.from(table).delete().in('id', ids);
      if (delError) {
        console.error(`Error deleting from ${table}:`, delError.message);
      } else {
        console.log(`Deleted ${data.length} records from ${table}`);
      }
    } else {
        console.log(`No records in ${table}`);
    }
  }
}
wipe();
