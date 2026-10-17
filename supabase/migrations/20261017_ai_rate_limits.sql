-- ============================================================
-- AI usage counters for rate limiting (used by the Cloudflare functions)
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- Logged-in students: AI calls per student per hour
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  calls int not null default 0,
  primary key (user_id, window_start)
);
alter table public.ai_usage enable row level security;
-- No policies on purpose: only the function below reads or writes this table.

create or replace function public.bump_ai_usage()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := date_trunc('hour', now());
  n int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into ai_usage (user_id, window_start, calls)
  values (auth.uid(), w, 1)
  on conflict (user_id, window_start) do update set calls = ai_usage.calls + 1
  returning calls into n;

  -- keep the table small
  delete from ai_usage where user_id = auth.uid() and window_start < w - interval '1 day';
  return n;
end;
$$;

revoke all on function public.bump_ai_usage() from public, anon;
grant execute on function public.bump_ai_usage() to authenticated;


-- "Try it" preview (no login): calls per IP per hour, plus a total for everyone
create table if not exists public.public_ai_usage (
  bucket text not null,              -- 'ip:<address>' or 'total'
  window_start timestamptz not null,
  calls int not null default 0,
  primary key (bucket, window_start)
);
alter table public.public_ai_usage enable row level security;
-- No policies on purpose: only the function below reads or writes this table.

create or replace function public.bump_public_usage(p_ip text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := date_trunc('hour', now());
  ip_n int;
  total_n int;
begin
  insert into public_ai_usage (bucket, window_start, calls)
  values ('ip:' || left(coalesce(p_ip, 'unknown'), 64), w, 1)
  on conflict (bucket, window_start) do update set calls = public_ai_usage.calls + 1
  returning calls into ip_n;

  insert into public_ai_usage (bucket, window_start, calls)
  values ('total', w, 1)
  on conflict (bucket, window_start) do update set calls = public_ai_usage.calls + 1
  returning calls into total_n;

  delete from public_ai_usage where window_start < w - interval '1 day';
  return json_build_object('ip_calls', ip_n, 'total_calls', total_n);
end;
$$;

revoke all on function public.bump_public_usage(text) from public;
grant execute on function public.bump_public_usage(text) to anon, authenticated;
