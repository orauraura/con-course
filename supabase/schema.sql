-- Enable RLS
-- Run this in Supabase SQL editor

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Timeline posts
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

-- Post likes
create table if not exists post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Post comments
create table if not exists post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Groups
create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Group members
create table if not exists group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Group messages
create table if not exists group_messages (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

-- Direct messages
create table if not exists direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text,
  file_url text,
  file_name text,
  file_type text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict do nothing;

-- RLS Policies
alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_messages enable row level security;
alter table direct_messages enable row level security;

-- Profiles policies
create policy "Profiles are viewable by authenticated users" on profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Posts policies
create policy "Posts viewable by authenticated" on posts
  for select using (auth.role() = 'authenticated');
create policy "Users can create posts" on posts
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = user_id);

-- Post likes policies
create policy "Likes viewable by authenticated" on post_likes
  for select using (auth.role() = 'authenticated');
create policy "Users can like" on post_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on post_likes
  for delete using (auth.uid() = user_id);

-- Post comments policies
create policy "Comments viewable by authenticated" on post_comments
  for select using (auth.role() = 'authenticated');
create policy "Users can comment" on post_comments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on post_comments
  for delete using (auth.uid() = user_id);

-- Groups policies
create policy "Groups viewable by authenticated" on groups
  for select using (auth.role() = 'authenticated');
create policy "Authenticated can create groups" on groups
  for insert with check (auth.role() = 'authenticated');

-- Group members policies
create policy "Members viewable by authenticated" on group_members
  for select using (auth.role() = 'authenticated');
create policy "Users can join groups" on group_members
  for insert with check (auth.uid() = user_id);
create policy "Users can leave groups" on group_members
  for delete using (auth.uid() = user_id);

-- Group messages policies
create policy "Group messages viewable by members" on group_messages
  for select using (
    exists (select 1 from group_members where group_id = group_messages.group_id and user_id = auth.uid())
  );
create policy "Members can send messages" on group_messages
  for insert with check (
    auth.uid() = user_id and
    exists (select 1 from group_members where group_id = group_messages.group_id and user_id = auth.uid())
  );

-- Direct messages policies
create policy "DMs viewable by sender or receiver" on direct_messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send DMs" on direct_messages
  for insert with check (auth.uid() = sender_id);
create policy "Receiver can mark as read" on direct_messages
  for update using (auth.uid() = receiver_id);

-- Storage policy
create policy "Authenticated users can upload" on storage.objects
  for insert with check (auth.role() = 'authenticated' and bucket_id = 'uploads');
create policy "Anyone can view uploads" on storage.objects
  for select using (bucket_id = 'uploads');

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
