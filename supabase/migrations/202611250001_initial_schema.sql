create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 currency text not null default 'USD' check(currency='USD'),
 take_home_income numeric(12,2) not null default 0 check(take_home_income>=0),
 next_payday date,
 pay_frequency text not null default 'biweekly' check(pay_frequency in ('weekly','biweekly','semimonthly','monthly','irregular')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.bills (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 100), amount numeric(12,2) not null check(amount>0),
 due_date date not null, recurrence text not null default 'once' check(recurrence in ('once','weekly','monthly','quarterly','yearly')),
 is_paid boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.expenses (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 description text not null check(length(trim(description)) between 1 and 120), amount numeric(12,2) not null check(amount>0),
 category text not null default 'Other', spent_on date not null default current_date, created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.bills enable row level security;
alter table public.expenses enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "bills_select_own" on public.bills for select to authenticated using ((select auth.uid())=user_id);
create policy "bills_insert_own" on public.bills for insert to authenticated with check ((select auth.uid())=user_id);
create policy "bills_update_own" on public.bills for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "bills_delete_own" on public.bills for delete to authenticated using ((select auth.uid())=user_id);
create policy "expenses_select_own" on public.expenses for select to authenticated using ((select auth.uid())=user_id);
create policy "expenses_insert_own" on public.expenses for insert to authenticated with check ((select auth.uid())=user_id);
create policy "expenses_update_own" on public.expenses for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "expenses_delete_own" on public.expenses for delete to authenticated using ((select auth.uid())=user_id);
create index if not exists bills_user_due_idx on public.bills(user_id,due_date);
create index if not exists expenses_user_date_idx on public.expenses(user_id,spent_on desc);
