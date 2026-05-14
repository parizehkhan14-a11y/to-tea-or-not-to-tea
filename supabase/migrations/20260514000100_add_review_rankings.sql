alter table public.tea_reviews
add column if not exists rank_position integer check (rank_position between 1 and 3);

update public.tea_reviews
set rank_position = case id
  when 'entry-1' then 1
  when 'entry-2' then 2
  when 'entry-3' then 3
  else rank_position
end
where id in ('entry-1', 'entry-2', 'entry-3');

drop policy if exists "tea_reviews public insert" on public.tea_reviews;

create or replace function public.insert_tea_review_admin(
  review_id text,
  admin_password text,
  next_flavor text,
  next_location text,
  next_drink_name text,
  next_rating integer,
  next_rank_position integer,
  next_thoughts text,
  next_created_at timestamptz
)
returns public.tea_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_review public.tea_reviews;
begin
  if admin_password <> 'Princesspeach' then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  if next_rank_position is not null then
    update public.tea_reviews
    set rank_position = null
    where rank_position = next_rank_position;
  end if;

  insert into public.tea_reviews (
    id,
    flavor,
    location,
    drink_name,
    rating,
    rank_position,
    thoughts,
    created_at
  )
  values (
    review_id,
    next_flavor,
    next_location,
    next_drink_name,
    next_rating,
    next_rank_position,
    next_thoughts,
    next_created_at
  )
  returning * into inserted_review;

  return inserted_review;
end;
$$;

create or replace function public.update_tea_review_admin(
  review_id text,
  admin_password text,
  next_flavor text,
  next_location text,
  next_drink_name text,
  next_rating integer,
  next_rank_position integer,
  next_thoughts text
)
returns public.tea_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_review public.tea_reviews;
begin
  if admin_password <> 'Princesspeach' then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  if next_rank_position is not null then
    update public.tea_reviews
    set rank_position = null
    where rank_position = next_rank_position
      and id <> review_id;
  end if;

  update public.tea_reviews
  set
    flavor = next_flavor,
    location = next_location,
    drink_name = next_drink_name,
    rating = next_rating,
    rank_position = next_rank_position,
    thoughts = next_thoughts
  where id = review_id
  returning * into updated_review;

  if updated_review.id is null then
    raise exception 'Review not found' using errcode = '02000';
  end if;

  return updated_review;
end;
$$;

revoke all on function public.insert_tea_review_admin(text, text, text, text, text, integer, integer, text, timestamptz) from public;
revoke all on function public.update_tea_review_admin(text, text, text, text, text, integer, integer, text) from public;
grant execute on function public.insert_tea_review_admin(text, text, text, text, text, integer, integer, text, timestamptz) to anon, authenticated;
grant execute on function public.update_tea_review_admin(text, text, text, text, text, integer, integer, text) to anon, authenticated;
