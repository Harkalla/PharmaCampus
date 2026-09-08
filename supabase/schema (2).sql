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
  year integer not null default 1,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  code text unique,
  semester_id text not null references public.semesters(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  semester text not null,
  description text,
  category text,
  module_id uuid references public.modules(id) on delete set null,
  semester_id text references public.semesters(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  semester text,
  level text,
  category text default 'Cours',
  author text,
  file_name text,
  file_path text,
  file_url text,
  file_size bigint,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  semester_id text references public.semesters(id) on delete set null,
  semester text,
  type text,
  category text not null default 'Autre',
  author text,
  file_name text,
  file_path text,
  file_url text,
  file_size bigint,
  status text not null default 'published' check (status in ('draft','pending','published','refused','archived')),
  submitted_by uuid references public.profiles(id) on delete set null,
  year integer,
  tags text,
  cover_image text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Create this table before its policies and Storage rules are evaluated.
create table if not exists public.document_contributions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  semester_id text references public.semesters(id) on delete set null,
  semester text,
  category text not null default 'Autre',
  type text,
  year integer,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  status text not null default 'pending' check (status in ('pending','published','refused','archived')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  semester_id text references public.semesters(id) on delete set null,
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
  module_id uuid references public.modules(id) on delete set null,
  semester_id text references public.semesters(id) on delete set null,
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

create table if not exists public.practicals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  module_id uuid references public.modules(id) on delete cascade,
  semester_id text references public.semesters(id) on delete cascade,
  objectives text,
  materials text,
  protocol text,
  expected_results text,
  report_instructions text,
  document_id uuid references public.documents(id) on delete set null,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revision_questions (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references public.modules(id) on delete cascade,
  semester_id text references public.semesters(id) on delete cascade,
  question text not null,
  answer text,
  explanation text,
  difficulty text default 'Moyenne',
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  resource_type text not null,
  resource_id uuid,
  viewed_at timestamptz not null default now(),
  unique(user_id, resource_type, resource_id)
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

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  room text not null default 'direct',
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
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

-- ============================================================
-- Rattrapage complet des colonnes pour TOUTES les tables.
-- Certaines de ces tables peuvent préexister avec une structure plus
-- ancienne : "create table if not exists" plus haut ne les modifie pas,
-- donc on ajoute explicitement chaque colonne manquante ici.
-- ============================================================

-- profiles
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists university text;
alter table public.profiles add column if not exists level text;
alter table public.profiles add column if not exists semester text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists photo_url text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- semesters
alter table public.semesters add column if not exists name text;
alter table public.semesters add column if not exists year integer not null default 1;
alter table public.semesters add column if not exists sort_order integer not null default 1;
alter table public.semesters add column if not exists created_at timestamptz not null default now();

-- modules
alter table public.modules add column if not exists code text;
alter table public.modules add column if not exists semester_id text references public.semesters(id) on delete cascade;
alter table public.modules add column if not exists name text;
alter table public.modules add column if not exists description text;
alter table public.modules add column if not exists sort_order integer not null default 1;
alter table public.modules add column if not exists created_at timestamptz not null default now();

-- subjects
alter table public.subjects add column if not exists name text;
alter table public.subjects add column if not exists semester text;
alter table public.subjects add column if not exists description text;
alter table public.subjects add column if not exists category text;
alter table public.subjects add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.subjects add column if not exists semester_id text references public.semesters(id) on delete set null;
alter table public.subjects add column if not exists created_at timestamptz not null default now();

-- courses
alter table public.courses add column if not exists title text;
alter table public.courses add column if not exists description text;
alter table public.courses add column if not exists subject_id uuid references public.subjects(id) on delete cascade;
alter table public.courses add column if not exists semester text;
alter table public.courses add column if not exists level text;
alter table public.courses add column if not exists category text default 'Cours';
alter table public.courses add column if not exists author text;
alter table public.courses add column if not exists file_name text;
alter table public.courses add column if not exists file_path text;
alter table public.courses add column if not exists file_url text;
alter table public.courses add column if not exists file_size bigint;
alter table public.courses add column if not exists status text not null default 'published';
alter table public.courses add column if not exists created_at timestamptz not null default now();

-- documents
alter table public.documents add column if not exists title text;
alter table public.documents add column if not exists description text;
alter table public.documents add column if not exists subject_id uuid references public.subjects(id) on delete cascade;
alter table public.documents add column if not exists semester text;
alter table public.documents add column if not exists type text;
alter table public.documents add column if not exists category text not null default 'Autre';
alter table public.documents add column if not exists author text;
alter table public.documents add column if not exists file_name text;
alter table public.documents add column if not exists file_path text;
alter table public.documents add column if not exists file_url text;
alter table public.documents add column if not exists file_size bigint;
alter table public.documents add column if not exists status text not null default 'published';
alter table public.documents add column if not exists submitted_by uuid references public.profiles(id) on delete set null;
alter table public.documents add column if not exists year integer;
alter table public.documents add column if not exists tags text;
alter table public.documents add column if not exists cover_image text;
alter table public.documents add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.documents add column if not exists reviewed_at timestamptz;
alter table public.documents add column if not exists rejection_reason text;
alter table public.documents add column if not exists updated_at timestamptz not null default now();
alter table public.documents add column if not exists created_at timestamptz not null default now();

-- document_contributions
alter table public.document_contributions add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.document_contributions add column if not exists title text;
alter table public.document_contributions add column if not exists description text;
alter table public.document_contributions add column if not exists subject_id uuid references public.subjects(id) on delete set null;
alter table public.document_contributions add column if not exists semester_id text references public.semesters(id) on delete set null;
alter table public.document_contributions add column if not exists semester text;
alter table public.document_contributions add column if not exists category text not null default 'Autre';
alter table public.document_contributions add column if not exists type text;
alter table public.document_contributions add column if not exists year integer;
alter table public.document_contributions add column if not exists file_name text;
alter table public.document_contributions add column if not exists file_path text;
alter table public.document_contributions add column if not exists file_size bigint;
alter table public.document_contributions add column if not exists status text not null default 'pending';
alter table public.document_contributions add column if not exists rejection_reason text;
alter table public.document_contributions add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.document_contributions add column if not exists reviewed_at timestamptz;
alter table public.document_contributions add column if not exists created_at timestamptz not null default now();

-- exams
alter table public.exams add column if not exists title text;
alter table public.exams add column if not exists subject_id uuid references public.subjects(id) on delete cascade;
alter table public.exams add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.exams add column if not exists semester_id text references public.semesters(id) on delete set null;
alter table public.exams add column if not exists semester text;
alter table public.exams add column if not exists year integer;
alter table public.exams add column if not exists file_name text;
alter table public.exams add column if not exists file_path text;
alter table public.exams add column if not exists answer_file_name text;
alter table public.exams add column if not exists answer_file_path text;
alter table public.exams add column if not exists created_at timestamptz not null default now();

-- corrections
alter table public.corrections add column if not exists exam_id uuid references public.exams(id) on delete cascade;
alter table public.corrections add column if not exists title text;
alter table public.corrections add column if not exists file_name text;
alter table public.corrections add column if not exists file_path text;
alter table public.corrections add column if not exists created_at timestamptz not null default now();

-- quizzes
alter table public.quizzes add column if not exists title text;
alter table public.quizzes add column if not exists subject_id uuid references public.subjects(id) on delete set null;
alter table public.quizzes add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.quizzes add column if not exists semester_id text references public.semesters(id) on delete set null;
alter table public.quizzes add column if not exists semester text;
alter table public.quizzes add column if not exists created_at timestamptz not null default now();

-- quiz_questions
alter table public.quiz_questions add column if not exists quiz_id uuid references public.quizzes(id) on delete cascade;
alter table public.quiz_questions add column if not exists question text;
alter table public.quiz_questions add column if not exists options jsonb;
alter table public.quiz_questions add column if not exists correct_answers jsonb;
alter table public.quiz_questions add column if not exists explanation text;
alter table public.quiz_questions add column if not exists created_at timestamptz not null default now();

-- quiz_results
alter table public.quiz_results add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.quiz_results add column if not exists quiz_id uuid references public.quizzes(id) on delete cascade;
alter table public.quiz_results add column if not exists score integer not null default 0;
alter table public.quiz_results add column if not exists total integer not null default 0;
alter table public.quiz_results add column if not exists percentage numeric not null default 0;
alter table public.quiz_results add column if not exists submitted_at timestamptz not null default now();

-- medicines
alter table public.medicines add column if not exists name text;
alter table public.medicines add column if not exists dci text;
alter table public.medicines add column if not exists therapeutic_class text;
alter table public.medicines add column if not exists indications text;
alter table public.medicines add column if not exists dosage text;
alter table public.medicines add column if not exists contraindications text;
alter table public.medicines add column if not exists adverse_effects text;
alter table public.medicines add column if not exists precautions text;
alter table public.medicines add column if not exists interactions text;
alter table public.medicines add column if not exists forms text;
alter table public.medicines add column if not exists image text;
alter table public.medicines add column if not exists created_at timestamptz not null default now();

-- practicals
alter table public.practicals add column if not exists title text;
alter table public.practicals add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.practicals add column if not exists semester_id text references public.semesters(id) on delete cascade;
alter table public.practicals add column if not exists objectives text;
alter table public.practicals add column if not exists materials text;
alter table public.practicals add column if not exists protocol text;
alter table public.practicals add column if not exists expected_results text;
alter table public.practicals add column if not exists report_instructions text;
alter table public.practicals add column if not exists document_id uuid references public.documents(id) on delete set null;
alter table public.practicals add column if not exists status text not null default 'published';
alter table public.practicals add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.practicals add column if not exists created_at timestamptz not null default now();
alter table public.practicals add column if not exists updated_at timestamptz not null default now();

-- revision_questions
alter table public.revision_questions add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.revision_questions add column if not exists semester_id text references public.semesters(id) on delete cascade;
alter table public.revision_questions add column if not exists question text;
alter table public.revision_questions add column if not exists answer text;
alter table public.revision_questions add column if not exists explanation text;
alter table public.revision_questions add column if not exists difficulty text default 'Moyenne';
alter table public.revision_questions add column if not exists status text not null default 'published';
alter table public.revision_questions add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.revision_questions add column if not exists created_at timestamptz not null default now();

-- user_progress
alter table public.user_progress add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.user_progress add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.user_progress add column if not exists resource_type text;
alter table public.user_progress add column if not exists resource_id uuid;
alter table public.user_progress add column if not exists viewed_at timestamptz not null default now();

-- posts
alter table public.posts add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.posts add column if not exists subject_id uuid references public.subjects(id) on delete set null;
alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists title text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists created_at timestamptz not null default now();

-- comments
alter table public.comments add column if not exists post_id uuid references public.posts(id) on delete cascade;
alter table public.comments add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.comments add column if not exists content text;
alter table public.comments add column if not exists created_at timestamptz not null default now();

-- messages
alter table public.messages add column if not exists room text not null default 'direct';
alter table public.messages add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.messages add column if not exists recipient_id uuid references public.profiles(id) on delete cascade;
alter table public.messages add column if not exists content text;
alter table public.messages add column if not exists created_at timestamptz not null default now();

-- notifications
alter table public.notifications add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists link text;
alter table public.notifications add column if not exists is_read boolean not null default false;
alter table public.notifications add column if not exists created_at timestamptz not null default now();

-- reports
alter table public.reports add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists type text;
alter table public.reports add column if not exists description text;
alter table public.reports add column if not exists created_at timestamptz not null default now();

-- suggestions
alter table public.suggestions add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.suggestions add column if not exists title text;
alter table public.suggestions add column if not exists description text;
alter table public.suggestions add column if not exists created_at timestamptz not null default now();

-- Compatibility migration for an earlier schema that used text module_id values.
-- Legacy values are preserved instead of being deleted; new relations use UUIDs.
do $$
declare
  relation_name text;
  module_column_type text;
begin
  foreach relation_name in array array['subjects', 'documents', 'exams', 'quizzes', 'practicals', 'revision_questions', 'user_progress', 'document_contributions'] loop
    select c.udt_name into module_column_type
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = relation_name
      and c.column_name = 'module_id';

    if module_column_type = 'text' then
      execute format('alter table public.%I drop constraint if exists %I', relation_name, relation_name || '_module_id_fkey');
      execute format('alter table public.%I rename column module_id to module_code_legacy', relation_name);
    end if;
  end loop;
end $$;

alter table public.subjects add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.documents add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.practicals add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.revision_questions add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.user_progress add column if not exists module_id uuid references public.modules(id) on delete cascade;
alter table public.document_contributions add column if not exists module_id uuid references public.modules(id) on delete set null;

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
alter table public.modules enable row level security;
alter table public.subjects enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.exams enable row level security;
alter table public.corrections enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.medicines enable row level security;
alter table public.practicals enable row level security;
alter table public.revision_questions enable row level security;
alter table public.user_progress enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.suggestions enable row level security;

drop policy if exists "Users can view profiles" on public.profiles;
create policy "Users can view profiles" on public.profiles
for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
for update using (auth.uid() = id)
with check ((auth.uid() = id and role = 'user') or public.is_admin());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "Anyone can read semesters" on public.semesters;
create policy "Anyone can read semesters" on public.semesters
for select using (true);

drop policy if exists "Admins can manage semesters" on public.semesters;
create policy "Admins can manage semesters" on public.semesters
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read modules" on public.modules;
create policy "Anyone can read modules" on public.modules
for select using (true);

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules" on public.modules
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
for select using (status = 'published' or public.is_admin() or auth.uid() = submitted_by);

drop policy if exists "Admins can manage documents" on public.documents;
create policy "Admins can manage documents" on public.documents
for all using (public.is_admin()) with check (public.is_admin());

alter table public.document_contributions enable row level security;
alter table public.document_contributions add column if not exists module_id uuid references public.modules(id) on delete set null;
alter table public.document_contributions add column if not exists semester_id text references public.semesters(id) on delete set null;
alter table public.document_contributions add column if not exists file_size bigint;
drop policy if exists "Students can create contributions" on public.document_contributions;
create policy "Students can create contributions" on public.document_contributions
for insert with check (auth.uid() = user_id and not public.is_admin());
drop policy if exists "Users can view own contributions" on public.document_contributions;
create policy "Users can view own contributions" on public.document_contributions
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "Admins can manage contributions" on public.document_contributions;
create policy "Admins can manage contributions" on public.document_contributions
for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('pharmacampus-documents', 'pharmacampus-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pharmacampus-images', 'pharmacampus-images', false),
       ('pharmacampus-exams', 'pharmacampus-exams', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read published resources" on storage.objects;
create policy "Authenticated users can read published resources" on storage.objects
for select to authenticated
using (
  bucket_id = 'pharmacampus-documents'
  and (
    public.is_admin()
    or exists (select 1 from public.documents d where d.file_path = name and d.status = 'published')
    or exists (select 1 from public.document_contributions c where c.file_path = name and c.user_id = auth.uid())
  )
);

drop policy if exists "Admins can upload resources" on storage.objects;
create policy "Admins can upload resources" on storage.objects
for insert to authenticated
with check (bucket_id = 'pharmacampus-documents' and public.is_admin());

drop policy if exists "Admins can update resources" on storage.objects;
create policy "Admins can update resources" on storage.objects
for update to authenticated
using (bucket_id = 'pharmacampus-documents' and public.is_admin())
with check (bucket_id = 'pharmacampus-documents' and public.is_admin());

drop policy if exists "Admins can delete resources" on storage.objects;
create policy "Admins can delete resources" on storage.objects
for delete to authenticated
using (bucket_id = 'pharmacampus-documents' and public.is_admin());

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

drop policy if exists "Anyone can read published practicals" on public.practicals;
create policy "Anyone can read published practicals" on public.practicals
for select using (status = 'published' or public.is_admin());
drop policy if exists "Admins can manage practicals" on public.practicals;
create policy "Admins can manage practicals" on public.practicals
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read published revision questions" on public.revision_questions;
create policy "Anyone can read published revision questions" on public.revision_questions
for select using (status = 'published' or public.is_admin());
drop policy if exists "Admins can manage revision questions" on public.revision_questions;
create policy "Admins can manage revision questions" on public.revision_questions
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress" on public.user_progress
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "Users can write own progress" on public.user_progress;
create policy "Users can write own progress" on public.user_progress
for insert with check (auth.uid() = user_id);

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

drop policy if exists "Users can read own messages" on public.messages;
create policy "Users can read own messages" on public.messages
for select using (auth.uid() = user_id or auth.uid() = recipient_id);
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages" on public.messages
for insert with check (auth.uid() = user_id and (recipient_id is null or recipient_id <> auth.uid()));

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
