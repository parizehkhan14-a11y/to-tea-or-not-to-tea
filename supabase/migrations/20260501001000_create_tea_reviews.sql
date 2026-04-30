create table if not exists public.tea_reviews (
  id text primary key,
  flavor text not null,
  location text not null,
  drink_name text not null,
  rating integer not null check (rating between 1 and 5),
  thoughts text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tea_reviews_updated_at on public.tea_reviews;

create trigger set_tea_reviews_updated_at
before update on public.tea_reviews
for each row
execute function public.set_updated_at();

alter table public.tea_reviews enable row level security;

drop policy if exists "tea_reviews public read" on public.tea_reviews;
drop policy if exists "tea_reviews public insert" on public.tea_reviews;
drop policy if exists "tea_reviews public update" on public.tea_reviews;
drop policy if exists "tea_reviews public delete" on public.tea_reviews;

create policy "tea_reviews public read"
on public.tea_reviews
for select
to anon, authenticated
using (true);

create policy "tea_reviews public insert"
on public.tea_reviews
for insert
to anon, authenticated
with check (true);

create policy "tea_reviews public update"
on public.tea_reviews
for update
to anon, authenticated
using (true)
with check (true);

create policy "tea_reviews public delete"
on public.tea_reviews
for delete
to anon, authenticated
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tea_reviews'
  ) then
    alter publication supabase_realtime add table public.tea_reviews;
  end if;
end;
$$;
