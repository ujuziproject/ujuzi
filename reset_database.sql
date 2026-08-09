-- Run this in your Supabase SQL Editor to wipe all app data and users

-- 1. Truncate all application tables
TRUNCATE TABLE 
  activity_log,
  lecture_notes,
  flashcards,
  quiz_questions,
  quiz_attempts,
  quizzes,
  flashcard_reviews,
  planner_items,
  study_sessions,
  topics,
  courses,
  semesters,
  learning_goals,
  curricula,
  student_interests,
  interest_content,
  interests,
  streaks,
  student_profiles
CASCADE;

-- 2. Delete all users from auth.users (this will remove all logins)
DELETE FROM auth.users;
