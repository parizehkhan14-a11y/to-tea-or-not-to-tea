drop policy if exists "tea_reviews public update" on public.tea_reviews;
drop policy if exists "tea_reviews public delete" on public.tea_reviews;

create or replace function public.update_tea_review_admin(
  review_id text,
  admin_password text,
  next_flavor text,
  next_location text,
  next_drink_name text,
  next_rating integer,
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

  update public.tea_reviews
  set
    flavor = next_flavor,
    location = next_location,
    drink_name = next_drink_name,
    rating = next_rating,
    thoughts = next_thoughts
  where id = review_id
  returning * into updated_review;

  if updated_review.id is null then
    raise exception 'Review not found' using errcode = '02000';
  end if;

  return updated_review;
end;
$$;

revoke all on function public.update_tea_review_admin(text, text, text, text, text, integer, text) from public;
grant execute on function public.update_tea_review_admin(text, text, text, text, text, integer, text) to anon, authenticated;
