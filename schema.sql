-- ============================================================
-- Finanças Pessoais — Schema Supabase
-- Cole este SQL no editor do Supabase (SQL Editor → New query)
-- ============================================================

-- Expenses
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  type text not null,
  base_value numeric not null default 0,
  due_day integer not null default 1,
  responsible text not null default 'both',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  total_installments integer,
  start_month text
);
alter table public.expenses enable row level security;
create policy "own" on public.expenses for all using (auth.uid() = user_id);

-- Incomes
create table if not exists public.incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  type text not null,
  base_value numeric not null default 0,
  receipt_day integer not null default 5,
  responsible text not null default 'person1',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.incomes enable row level security;
create policy "own" on public.incomes for all using (auth.uid() = user_id);

-- Monthly expense records
create table if not exists public.monthly_expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  expense_id text not null,
  year integer not null,
  month integer not null,
  value numeric not null default 0,
  status text not null default 'pending',
  paid_date text,
  notes text,
  installment_number integer
);
alter table public.monthly_expenses enable row level security;
create policy "own" on public.monthly_expenses for all using (auth.uid() = user_id);

-- Monthly income records
create table if not exists public.monthly_incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  income_id text not null,
  year integer not null,
  month integer not null,
  value numeric not null default 0,
  status text not null default 'pending',
  received_date text,
  notes text
);
alter table public.monthly_incomes enable row level security;
create policy "own" on public.monthly_incomes for all using (auth.uid() = user_id);

-- Variable entries
create table if not exists public.variable_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  expense_id text not null,
  year integer not null,
  month integer not null,
  value numeric not null default 0,
  description text not null,
  date text not null
);
alter table public.variable_entries enable row level security;
create policy "own" on public.variable_entries for all using (auth.uid() = user_id);

-- Extra incomes (one-time)
create table if not exists public.extra_incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  value numeric not null default 0,
  date text not null,
  category text not null,
  responsible text not null default 'both',
  notes text
);
alter table public.extra_incomes enable row level security;
create policy "own" on public.extra_incomes for all using (auth.uid() = user_id);

-- Daily expenses
create table if not exists public.daily_expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  category text not null,
  value numeric not null default 0,
  date text not null,
  responsible text not null default 'both',
  notes text
);
alter table public.daily_expenses enable row level security;
create policy "own" on public.daily_expenses for all using (auth.uid() = user_id);

-- Settings
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  person1_name text not null default 'Pessoa 1',
  person2_name text not null default 'Pessoa 2'
);
alter table public.settings enable row level security;
create policy "own" on public.settings for all using (auth.uid() = user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.incomes;
alter publication supabase_realtime add table public.monthly_expenses;
alter publication supabase_realtime add table public.monthly_incomes;
alter publication supabase_realtime add table public.variable_entries;
alter publication supabase_realtime add table public.extra_incomes;
alter publication supabase_realtime add table public.daily_expenses;
alter publication supabase_realtime add table public.settings;
