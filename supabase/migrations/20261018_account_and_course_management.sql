-- ============================================================
-- Account deletion + renaming/deleting courses
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- Delete my account ----------
-- Deletes the logged-in student's login. Everything else they own (profile,
-- courses, topics, notes, flashcards, quizzes, progress, planner, badges)
-- is removed automatically because every table cascades from it.
-- Their uploaded files are removed by the app (Storage API) just before this runs.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Students may delete their own uploaded files (needed before deleting an account)
drop policy if exists "Users can delete their own curriculum files" on storage.objects;
create policy "Users can delete their own curriculum files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'curricula' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------- Rename / delete courses ----------
-- Courses in a semester or a learning goal
drop policy if exists "courses_owner_update" on courses;
drop policy if exists "courses_owner_delete" on courses;
create policy "courses_owner_update" on courses for update to authenticated
  using (
    exists (select 1 from semesters s where s.id = courses.semester_id and s.student_id = auth.uid())
    or exists (select 1 from learning_goals g where g.id = courses.goal_id and g.student_id = auth.uid())
  )
  with check (
    exists (select 1 from semesters s where s.id = courses.semester_id and s.student_id = auth.uid())
    or exists (select 1 from learning_goals g where g.id = courses.goal_id and g.student_id = auth.uid())
  );
create policy "courses_owner_delete" on courses for delete to authenticated
  using (
    exists (select 1 from semesters s where s.id = courses.semester_id and s.student_id = auth.uid())
    or exists (select 1 from learning_goals g where g.id = courses.goal_id and g.student_id = auth.uid())
  );

-- Secondary-school subjects (curricula)
drop policy if exists "curricula_owner_delete" on curricula;
create policy "curricula_owner_delete" on curricula for delete to authenticated
  using (student_id = auth.uid());
