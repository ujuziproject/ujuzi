export type Role = 'student' | 'parent' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  phone_number?: string;
}

export type Track = 'secondary' | 'university' | 'independent';
export type ExamType = 'WAEC' | 'JAMB' | 'NECO' | 'other';

export interface StudentProfile {
  id: string;
  track: Track;
  exam_type?: ExamType;
  exam_year?: number;
  university_id?: string;
  institution_name?: string;
  faculty?: string;
  course_of_study?: string;
  level_year?: number;
  weekly_goal_minutes?: number;
}

export interface Interest {
  id: string;
  name: string;
}

export interface StudentInterest {
  student_id: string;
  interest_id: string;
}

export interface Curriculum {
  id: string;
  student_id: string;
  title: string;
  file_url?: string;
  raw_text?: string;
  status: 'uploaded' | 'parsing' | 'parsed' | 'failed';
}

export interface Topic {
  id: string;
  curriculum_id?: string;
  course_id?: string;
  subject_name: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface LectureNote {
  id: string;
  topic_id: string;
  content: string;
  source_refs?: any;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  question: string;
  answer: string;
}

export interface Quiz {
  id: string;
  topic_id: string;
  title: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  attempted_at: string;
}

export interface FlashcardReview {
  id: string;
  student_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  last_reviewed_at: string;
}

export interface Streak {
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

export interface Semester {
  id: string;
  student_id: string;
  level_year: number;
  semester_number: number;
  created_at: string;
}

export interface Course {
  id: string;
  semester_id?: string;
  goal_id?: string;
  course_code?: string;
  course_title: string;
  file_url?: string;
  raw_text?: string;
  status: 'uploaded' | 'parsing' | 'parsed' | 'failed';
  created_at: string;
}

export interface LearningGoal {
  id: string;
  student_id: string;
  goal_title: string;
  category?: string;
  target_date?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  student_id: string;
  topic_id: string;
  screen_type: 'notes' | 'flashcards' | 'quiz';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  reflection?: string;
}

export interface InterestContent {
  id: string;
  interest_id: string;
  title: string;
  summary: string;
  content_url?: string;
  image_url?: string;
  created_at: string;
}

export interface PlannerItem {
  id: string;
  student_id: string;
  topic_id?: string;
  item_type: 'flashcards' | 'quiz' | 'notes';
  title: string;
  scheduled_date: string;
  scheduled_time?: string;
  completed: boolean;
  completed_at?: string;
}
