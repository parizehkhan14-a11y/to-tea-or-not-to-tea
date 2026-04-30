create or replace function public.delete_tea_review_admin(
  review_id text,
  admin_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if admin_password <> 'Princesspeach' then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  delete from public.tea_reviews
  where id = review_id;
end;
$$;

revoke all on function public.delete_tea_review_admin(text, text) from public;
grant execute on function public.delete_tea_review_admin(text, text) to anon, authenticated;
