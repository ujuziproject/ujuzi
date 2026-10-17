-- ============================================================
-- Study materials: permissions for EVERY way a topic can belong to a student
--
-- A topic belongs to a student through one of three paths:
--   1. topics.curriculum_id -> curricula.student_id            (secondary subjects)
--   2. topics.course_id -> courses.semester_id -> semesters     (university semesters)
--   3. topics.course_id -> courses.goal_id -> learning_goals    (learning goals)
--
-- Path 3 was never covered for topics, notes, flashcards and quizzes, so
-- generating materials inside a learning goal silently failed.
-- These policies cover all three paths in one place. They ADD to the
-- existing policies (Postgres allows a row if ANY policy allows it).
--
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- Topics created inside a course (semester or goal) have no curriculum_id,
-- so that column must be optional. Every topic still needs one parent.
alter table topics alter column curriculum_id drop not null;
alter table topics drop constraint if exists topics_has_parent;
alter table topics add constraint topics_has_parent
  check (curriculum_id is not null or course_id is not null) not valid;

-- Helper: does the logged-in student own this curriculum / course?
create or replace function public.owns_topic_parent(p_curriculum_id uuid, p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (p_curriculum_id is not null and exists (
      select 1 from curricula c where c.id = p_curriculum_id and c.student_id = auth.uid()
    ))
    or
    (p_course_id is not null and exists (
      select 1 from courses co
      left join semesters s on s.id = co.semester_id
      left join learning_goals g on g.id = co.goal_id
      where co.id = p_course_id
        and (s.student_id = auth.uid() or g.student_id = auth.uid())
    ));
$$;

-- Helper: does the logged-in student own this topic?
create or replace function public.owns_topic(p_topic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from topics t
    where t.id = p_topic_id
      and public.owns_topic_parent(t.curriculum_id, t.course_id)
  );
$$;

-- Helper: does the logged-in student own this quiz?
create or replace function public.owns_quiz(p_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from quizzes q where q.id = p_quiz_id and public.owns_topic(q.topic_id)
  );
$$;

revoke all on function public.owns_topic_parent(uuid, uuid) from public, anon;
revoke all on function public.owns_topic(uuid) from public, anon;
revoke all on function public.owns_quiz(uuid) from public, anon;
grant execute on function public.owns_topic_parent(uuid, uuid) to authenticated;
grant execute on function public.owns_topic(uuid) to authenticated;
grant execute on function public.owns_quiz(uuid) to authenticated;


-- ---------- topics ----------
drop policy if exists "topics_all_paths_select" on topics;
drop policy if exists "topics_all_paths_insert" on topics;
drop policy if exists "topics_all_paths_update" on topics;
drop policy if exists "topics_all_paths_delete" on topics;
create policy "topics_all_paths_select" on topics for select to authenticated
  using (public.owns_topic_parent(curriculum_id, course_id));
create policy "topics_all_paths_insert" on topics for insert to authenticated
  with check (public.owns_topic_parent(curriculum_id, course_id));
create policy "topics_all_paths_update" on topics for update to authenticated
  using (public.owns_topic_parent(curriculum_id, course_id))
  with check (public.owns_topic_parent(curriculum_id, course_id));
create policy "topics_all_paths_delete" on topics for delete to authenticated
  using (public.owns_topic_parent(curriculum_id, course_id));

-- ---------- lecture_notes ----------
drop policy if exists "lecture_notes_all_paths_select" on lecture_notes;
drop policy if exists "lecture_notes_all_paths_insert" on lecture_notes;
drop policy if exists "lecture_notes_all_paths_update" on lecture_notes;
drop policy if exists "lecture_notes_all_paths_delete" on lecture_notes;
create policy "lecture_notes_all_paths_select" on lecture_notes for select to authenticated using (public.owns_topic(topic_id));
create policy "lecture_notes_all_paths_insert" on lecture_notes for insert to authenticated with check (public.owns_topic(topic_id));
create policy "lecture_notes_all_paths_update" on lecture_notes for update to authenticated using (public.owns_topic(topic_id)) with check (public.owns_topic(topic_id));
create policy "lecture_notes_all_paths_delete" on lecture_notes for delete to authenticated using (public.owns_topic(topic_id));

-- ---------- flashcards ----------
drop policy if exists "flashcards_all_paths_select" on flashcards;
drop policy if exists "flashcards_all_paths_insert" on flashcards;
drop policy if exists "flashcards_all_paths_update" on flashcards;
drop policy if exists "flashcards_all_paths_delete" on flashcards;
create policy "flashcards_all_paths_select" on flashcards for select to authenticated using (public.owns_topic(topic_id));
create policy "flashcards_all_paths_insert" on flashcards for insert to authenticated with check (public.owns_topic(topic_id));
create policy "flashcards_all_paths_update" on flashcards for update to authenticated using (public.owns_topic(topic_id)) with check (public.owns_topic(topic_id));
create policy "flashcards_all_paths_delete" on flashcards for delete to authenticated using (public.owns_topic(topic_id));

-- ---------- quizzes ----------
drop policy if exists "quizzes_all_paths_select" on quizzes;
drop policy if exists "quizzes_all_paths_insert" on quizzes;
drop policy if exists "quizzes_all_paths_update" on quizzes;
drop policy if exists "quizzes_all_paths_delete" on quizzes;
create policy "quizzes_all_paths_select" on quizzes for select to authenticated using (public.owns_topic(topic_id));
create policy "quizzes_all_paths_insert" on quizzes for insert to authenticated with check (public.owns_topic(topic_id));
create policy "quizzes_all_paths_update" on quizzes for update to authenticated using (public.owns_topic(topic_id)) with check (public.owns_topic(topic_id));
create policy "quizzes_all_paths_delete" on quizzes for delete to authenticated using (public.owns_topic(topic_id));

-- ---------- quiz_questions ----------
drop policy if exists "quiz_questions_all_paths_select" on quiz_questions;
drop policy if exists "quiz_questions_all_paths_insert" on quiz_questions;
drop policy if exists "quiz_questions_all_paths_update" on quiz_questions;
drop policy if exists "quiz_questions_all_paths_delete" on quiz_questions;
create policy "quiz_questions_all_paths_select" on quiz_questions for select to authenticated using (public.owns_quiz(quiz_id));
create policy "quiz_questions_all_paths_insert" on quiz_questions for insert to authenticated with check (public.owns_quiz(quiz_id));
create policy "quiz_questions_all_paths_update" on quiz_questions for update to authenticated using (public.owns_quiz(quiz_id)) with check (public.owns_quiz(quiz_id));
create policy "quiz_questions_all_paths_delete" on quiz_questions for delete to authenticated using (public.owns_quiz(quiz_id));
