-- app roles enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- user roles table (roles never stored on profiles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- videos table
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'natok',
  video_path text,
  thumb_path text,
  duration_label text,
  views_count bigint not null default 0,
  published boolean not null default false,
  is_hero boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.videos to anon;
grant select, insert, update, delete on public.videos to authenticated;
grant all on public.videos to service_role;

alter table public.videos enable row level security;

create policy "Anyone can view published videos"
on public.videos for select
to anon, authenticated
using (published = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage videos"
on public.videos for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger videos_touch_updated_at
before update on public.videos
for each row execute function public.touch_updated_at();

-- storage policies for the private media bucket
create policy "Anyone can view media files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

create policy "Admins can upload media files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update media files"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete media files"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.objects to anon;