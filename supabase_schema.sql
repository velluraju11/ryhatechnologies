-- Create Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  author text DEFAULT 'Ryha Technologies',
  category text[] DEFAULT '{}',
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Posts
alter table public.posts enable row level security;

-- Create Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  name text not null,
  content text not null,
  approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Comments
alter table public.comments enable row level security;

-- Policies for Posts
-- Public can read published posts
create policy "Public can view published posts"
  on public.posts for select
  using ( published = true );

-- Admin (Authenticated) can do everything
create policy "Admins can manage posts"
  on public.posts for all
  using ( auth.role() = 'authenticated' ); -- Adjust if you have specific admin roles

-- Policies for Comments
-- Public can read approved comments
create policy "Public can view approved comments"
  on public.comments for select
  using ( approved = true );

-- Public can insert comments (moderation queue)
create policy "Public can insert comments"
  on public.comments for insert
  with check ( true );

-- Admin can manage all comments
create policy "Admins can manage comments"
  on public.comments for all
  using ( auth.role() = 'authenticated' );
