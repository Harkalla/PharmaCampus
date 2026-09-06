create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  country text,
  city text,
  university text,
  level text,
  semester text,
  bio text,
  photo_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.semesters (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  semester text not null,
  description text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  semester text,
  level text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  semester text,
  type text,
  author text,
  file_name text,
  file_path text,
  status text not null default 'published' check (status in ('draft','pending','published','refused','archived')),
  submitted_by uuid references public.profiles(id) on delete set null,
  year integer,
  tags text,
  cover_image text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  semester text,
  year integer,
  file_name text,
  file_path text,
  answer_file_name text,
  answer_file_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.corrections (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid references public.exams(id) on delete cascade,
  title text,
  file_name text,
  file_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  semester text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answers jsonb not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  percentage numeric not null default 0,
  submitted_at timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  dci text,
  therapeutic_class text,
  indications text,
  dosage text,
  contraindications text,
  adverse_effects text,
  precautions text,
  interactions text,
  forms text,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  category text,
  title text,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  message text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  type text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  title text,
  description text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.exams enable row level security;
alter table public.corrections enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.medicines enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.suggestions enable row level security;

drop policy if exists "Users can view profiles" on public.profiles;
create policy "Users can view profiles" on public.profiles
for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "Anyone can read semesters" on public.semesters;
create policy "Anyone can read semesters" on public.semesters
for select using (true);

drop policy if exists "Admins can manage semesters" on public.semesters;
create policy "Admins can manage semesters" on public.semesters
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read subjects" on public.subjects;
create policy "Anyone can read subjects" on public.subjects
for select using (true);

drop policy if exists "Admins can manage subjects" on public.subjects;
create policy "Admins can manage subjects" on public.subjects
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read courses" on public.courses;
create policy "Anyone can read courses" on public.courses
for select using (true);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses" on public.courses
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read documents" on public.documents;
create policy "Anyone can read documents" on public.documents
for select using (true);

drop policy if exists "Admins can manage documents" on public.documents;
create policy "Admins can manage documents" on public.documents
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read exams" on public.exams;
create policy "Anyone can read exams" on public.exams
for select using (true);

drop policy if exists "Admins can manage exams" on public.exams;
create policy "Admins can manage exams" on public.exams
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read corrections" on public.corrections;
create policy "Anyone can read corrections" on public.corrections
for select using (true);

drop policy if exists "Admins can manage corrections" on public.corrections;
create policy "Admins can manage corrections" on public.corrections
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read quizzes" on public.quizzes;
create policy "Anyone can read quizzes" on public.quizzes
for select using (true);

drop policy if exists "Admins can manage quizzes" on public.quizzes;
create policy "Admins can manage quizzes" on public.quizzes
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read quiz questions" on public.quiz_questions;
create policy "Anyone can read quiz questions" on public.quiz_questions
for select using (true);

drop policy if exists "Admins can manage quiz questions" on public.quiz_questions;
create policy "Admins can manage quiz questions" on public.quiz_questions
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can read their own results" on public.quiz_results;
create policy "Users can read their own results" on public.quiz_results
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own results" on public.quiz_results;
create policy "Users can insert own results" on public.quiz_results
for insert with check (auth.uid() = user_id);

drop policy if exists "Anyone can read medicines" on public.medicines;
create policy "Anyone can read medicines" on public.medicines
for select using (true);

drop policy if exists "Admins can manage medicines" on public.medicines;
create policy "Admins can manage medicines" on public.medicines
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts" on public.posts
for select using (true);

drop policy if exists "Users can create posts" on public.posts;
create policy "Users can create posts" on public.posts
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts" on public.posts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments" on public.comments
for select using (true);

drop policy if exists "Users can create comments" on public.comments;
create policy "Users can create comments" on public.comments
for insert with check (auth.uid() = user_id);

drop policy if exists "Anyone can read notifications" on public.notifications;
create policy "Anyone can read notifications" on public.notifications
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert notifications" on public.notifications;
create policy "Users can insert notifications" on public.notifications
for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports" on public.reports
for insert with check (auth.uid() = user_id or auth.uid() is not null);

drop policy if exists "Admins can read reports" on public.reports;
create policy "Admins can read reports" on public.reports
for select using (public.is_admin());

drop policy if exists "Users can create suggestions" on public.suggestions;
create policy "Users can create suggestions" on public.suggestions
for insert with check (auth.uid() = user_id or auth.uid() is not null);

drop policy if exists "Admins can read suggestions" on public.suggestions;
create policy "Admins can read suggestions" on public.suggestions
for select using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, country, city, university, level, semester, bio, photo_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'country', ''),
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'university', ''),
    coalesce(new.raw_user_meta_data ->> 'level', ''),
    coalesce(new.raw_user_meta_data ->> 'semester', ''),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    coalesce(new.raw_user_meta_data ->> 'photo_url', ''),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    country = excluded.country,
    city = excluded.city,
    university = excluded.university,
    level = excluded.level,
    semester = excluded.semester,
    bio = excluded.bio,
    photo_url = excluded.photo_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index if not exists idx_subjects_semester on public.subjects(semester);
create index if not exists idx_documents_subject on public.documents(subject_id);
create index if not exists idx_exams_subject on public.exams(subject_id);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_notifications_user on public.notifications(user_id);
