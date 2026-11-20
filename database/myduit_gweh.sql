-- =====================================================================
-- Myduit Gweh - database lengkap (skema + seed) untuk SQL Editor Supabase
-- Jalankan sekali jalan (Postgres 15+). Akun demo: lihat bagian seed.
-- Ini gabungan dari supabase/migrations/0001_schema.sql dan supabase/seed.sql.
-- =====================================================================

-- =====================================================================
-- Myduit Gweh - Skema database (Supabase / Postgres 15+)
-- Berisi: tabel, view, fungsi, trigger gamifikasi + log, dan RLS.
-- Aman dijalankan berulang (idempoten sebisanya).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Helper waktu: "hari ini" menurut WIB
-- ---------------------------------------------------------------------
create or replace function public.today_wib()
returns date
language sql stable
as $$ select (now() at time zone 'Asia/Jakarta')::date $$;

-- ---------------------------------------------------------------------
-- TABEL: RBAC
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z0-9_]+$'),
  name        text not null,
  description text,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- contoh: transactions.create
  module      text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- TABEL: profil pengguna (1-1 dengan auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  display_name       text not null default 'Hero',
  avatar             text not null default '🦊',
  role_id            uuid references public.roles(id) on delete restrict,
  is_active          boolean not null default true,
  xp                 integer not null default 0 check (xp >= 0),
  level              integer not null default 1 check (level >= 1),
  streak             integer not null default 0,
  longest_streak     integer not null default 0,
  last_activity_date date,
  created_at         timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role_id);

-- ---------------------------------------------------------------------
-- TABEL: fitur keuangan
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade, -- null = kategori global
  name       text not null,
  icon       text not null default '🪙',
  color      text not null default '#fbbf24',
  kind       text not null check (kind in ('income','expense')),
  created_at timestamptz not null default now()
);
create unique index if not exists categories_unique_name
  on public.categories ((coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid)), kind, lower(name));

create table if not exists public.wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  type            text not null default 'cash' check (type in ('cash','bank','ewallet','other')),
  icon            text not null default '👛',
  color           text not null default '#fbbf24',
  initial_balance numeric(14,2) not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists wallets_user_idx on public.wallets(user_id);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  wallet_id   uuid not null references public.wallets(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  kind        text not null check (kind in ('income','expense')),
  amount      numeric(14,2) not null check (amount > 0),
  note        text,
  occurred_on date not null default public.today_wib(),
  created_at  timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, occurred_on desc);
create index if not exists transactions_wallet_idx on public.transactions(wallet_id);
create index if not exists transactions_category_idx on public.transactions(category_id);

create table if not exists public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  month        date not null check (extract(day from month) = 1), -- selalu tanggal 1
  limit_amount numeric(14,2) not null check (limit_amount > 0),
  created_at   timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create table if not exists public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  icon          text not null default '🐉',
  target_amount numeric(14,2) not null check (target_amount > 0),
  deadline      date,
  status        text not null default 'active' check (status in ('active','completed')),
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists savings_goals_user_idx on public.savings_goals(user_id);

create table if not exists public.goal_deposits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  goal_id      uuid not null references public.savings_goals(id) on delete cascade,
  amount       numeric(14,2) not null check (amount > 0),
  note         text,
  deposited_on date not null default public.today_wib(),
  created_at   timestamptz not null default now()
);
create index if not exists goal_deposits_goal_idx on public.goal_deposits(goal_id);

-- ---------------------------------------------------------------------
-- TABEL: tantangan, achievement, log
-- ---------------------------------------------------------------------
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid default auth.uid() references public.profiles(id) on delete set null,
  title       text not null,
  description text,
  icon        text not null default '🎯',
  xp_reward   integer not null default 20 check (xp_reward between 1 and 1000),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.challenge_claims (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  claim_date   date not null default public.today_wib(),
  xp_awarded   integer not null default 0,
  created_at   timestamptz not null default now(),
  unique (challenge_id, user_id, claim_date)
);

create table if not exists public.achievements (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  name           text not null,
  description    text,
  icon           text not null default '🏆',
  condition_type text not null check (condition_type in
                   ('tx_count','streak','budget_guard','goals_completed','wallet_count','level','challenge_claims')),
  threshold      integer not null default 1 check (threshold >= 1),
  xp_reward      integer not null default 50 check (xp_reward >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.activity_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid,            -- tanpa FK agar log tetap ada walau akun dihapus
  actor_name text,
  action     text not null,   -- create | update | delete | unlock
  entity     text not null,
  entity_id  text,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

-- ---------------------------------------------------------------------
-- FUNGSI RBAC
-- ---------------------------------------------------------------------
create or replace function public.has_permission(p_code text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions pm on pm.id = rp.permission_id
    where p.id = auth.uid() and p.is_active and pm.code = p_code
  );
$$;

create or replace function public.my_permissions()
returns text[]
language sql stable security definer
set search_path = public
as $$
  select coalesce(array_agg(pm.code order by pm.code), '{}')
  from public.profiles p
  join public.role_permissions rp on rp.role_id = p.role_id
  join public.permissions pm on pm.id = rp.permission_id
  where p.id = auth.uid() and p.is_active;
$$;

-- ---------------------------------------------------------------------
-- FUNGSI GAMIFIKASI (internal, tidak bisa dipanggil klien)
-- ---------------------------------------------------------------------
create or replace function public.award_xp(p_user uuid, p_xp integer)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if p_xp is null or p_xp = 0 then return; end if;
  update public.profiles
     set xp = greatest(0, xp + p_xp),
         level = floor(sqrt(greatest(0, xp + p_xp) / 50.0))::int + 1
   where id = p_user;
end;
$$;

create or replace function public.touch_streak(p_user uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  d date := public.today_wib();
  last_d date;
  cur int;
  nxt int;
begin
  select last_activity_date, streak into last_d, cur from public.profiles where id = p_user;
  if not found then return; end if;
  if last_d = d then return; end if;
  nxt := case when last_d = d - 1 then coalesce(cur, 0) + 1 else 1 end;
  update public.profiles
     set streak = nxt,
         longest_streak = greatest(longest_streak, nxt),
         last_activity_date = d
   where id = p_user;
end;
$$;

-- Mengecek achievement milik satu user; mengembalikan yang BARU terbuka.
create or replace function public.evaluate_achievements(p_user uuid)
returns setof public.achievements
language plpgsql security definer
set search_path = public
as $$
declare
  a public.achievements%rowtype;
  prof public.profiles%rowtype;
  v int;
  ok boolean;
  inserted int;
begin
  select * into prof from public.profiles where id = p_user;
  if not found then return; end if;

  for a in
    select * from public.achievements ac
    where ac.is_active
      and not exists (select 1 from public.user_achievements ua
                      where ua.user_id = p_user and ua.achievement_id = ac.id)
    order by ac.threshold
  loop
    ok := false;
    if a.condition_type = 'tx_count' then
      select count(*) into v from public.transactions where user_id = p_user;
      ok := v >= a.threshold;
    elsif a.condition_type = 'streak' then
      select longest_streak into v from public.profiles where id = p_user;
      ok := coalesce(v, 0) >= a.threshold;
    elsif a.condition_type = 'budget_guard' then
      -- jumlah anggaran bulan yang sudah lewat dengan pengeluaran <= batas
      select count(*) into v
      from public.budgets b
      where b.user_id = p_user
        and b.month < date_trunc('month', public.today_wib())::date
        and coalesce((select sum(t.amount) from public.transactions t
                      where t.user_id = b.user_id and t.category_id = b.category_id
                        and t.kind = 'expense'
                        and t.occurred_on >= b.month
                        and t.occurred_on < (b.month + interval '1 month')::date), 0) <= b.limit_amount;
      ok := v >= a.threshold;
    elsif a.condition_type = 'goals_completed' then
      select count(*) into v from public.savings_goals where user_id = p_user and status = 'completed';
      ok := v >= a.threshold;
    elsif a.condition_type = 'wallet_count' then
      select count(*) into v from public.wallets where user_id = p_user;
      ok := v >= a.threshold;
    elsif a.condition_type = 'level' then
      select level into v from public.profiles where id = p_user;
      ok := coalesce(v, 1) >= a.threshold;
    elsif a.condition_type = 'challenge_claims' then
      select count(*) into v from public.challenge_claims where user_id = p_user;
      ok := v >= a.threshold;
    end if;

    if ok then
      insert into public.user_achievements(user_id, achievement_id)
      values (p_user, a.id)
      on conflict do nothing;
      get diagnostics inserted = row_count;
      if inserted > 0 then
        perform public.award_xp(p_user, a.xp_reward);
        insert into public.activity_logs(user_id, actor_name, action, entity, entity_id, detail)
        values (p_user, prof.display_name, 'unlock', 'achievements', a.id::text,
                jsonb_build_object('name', a.name, 'xp_reward', a.xp_reward));
        return next a;
      end if;
    end if;
  end loop;
  return;
end;
$$;

-- RPC untuk klien: cek achievement milik user yang sedang login.
create or replace function public.check_achievements()
returns setof public.achievements
language sql security definer
set search_path = public
as $$
  select * from public.evaluate_achievements(auth.uid()) where auth.uid() is not null;
$$;

-- RPC untuk klien: klaim tantangan harian (sekali per tantangan per hari).
create or replace function public.claim_challenge(p_challenge_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  c public.challenges%rowtype;
begin
  if auth.uid() is null or not public.has_permission('challenges.claim') then
    raise exception 'Kamu tidak punya izin untuk mengklaim tantangan.' using errcode = '42501';
  end if;
  select * into c from public.challenges where id = p_challenge_id and is_active;
  if not found then
    raise exception 'Tantangan tidak ditemukan atau sudah nonaktif.';
  end if;
  begin
    insert into public.challenge_claims(challenge_id, user_id, xp_awarded)
    values (c.id, auth.uid(), c.xp_reward);
  exception when unique_violation then
    raise exception 'Tantangan ini sudah kamu klaim hari ini. Coba lagi besok!';
  end;
  return jsonb_build_object('xp', c.xp_reward, 'title', c.title);
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: XP / streak
-- ---------------------------------------------------------------------
create or replace function public.trg_transaction_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_xp(new.user_id, 10);
  perform public.touch_streak(new.user_id);
  return new;
end;
$$;

create or replace function public.trg_budget_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_xp(new.user_id, 20);
  return new;
end;
$$;

create or replace function public.trg_deposit_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_xp(new.user_id, 15);
  perform public.touch_streak(new.user_id);
  -- memicu trg_goal_before_update untuk mengecek apakah quest selesai
  update public.savings_goals set target_amount = target_amount where id = new.goal_id;
  return new;
end;
$$;

create or replace function public.trg_claim_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_xp(new.user_id, new.xp_awarded);
  return new;
end;
$$;

-- Quest: otomatis selesai kalau setoran >= target (+100 XP); status manual dijaga.
create or replace function public.trg_goal_before_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  total numeric;
begin
  select coalesce(sum(amount), 0) into total from public.goal_deposits where goal_id = new.id;
  if total >= new.target_amount then
    if old.status <> 'completed' then
      new.status := 'completed';
      new.completed_at := now();
      perform public.award_xp(new.user_id, 100);
    end if;
  elsif new.status = 'completed' and old.status <> 'completed' then
    raise exception 'Boss belum kalah: setoran belum mencapai target.';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: log aktivitas generik
-- ---------------------------------------------------------------------
create or replace function public.trg_log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  j jsonb;
  actor uuid;
  nm text;
begin
  j := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  actor := coalesce(auth.uid(), nullif(j->>'user_id', '')::uuid);
  if actor is not null then
    select display_name into nm from public.profiles where id = actor;
  end if;
  insert into public.activity_logs(user_id, actor_name, action, entity, entity_id, detail)
  values (actor, nm, lower(tg_op), tg_table_name,
          coalesce(j->>'id', coalesce(j->>'role_id', '') || ':' || coalesce(j->>'permission_id', '')),
          j - 'avatar');
  return null;
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: penjaga RBAC
-- ---------------------------------------------------------------------
create or replace function public.trg_protect_roles()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then
      raise exception 'Role bawaan sistem tidak boleh dihapus.';
    end if;
    return old;
  end if;
  if old.is_system and (new.code <> old.code or new.is_system <> old.is_system) then
    raise exception 'Kode role bawaan sistem tidak boleh diubah.';
  end if;
  return new;
end;
$$;

create or replace function public.trg_protect_admin_rbac()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (
    select 1 from public.roles r
    join public.permissions p on p.id = old.permission_id
    where r.id = old.role_id and r.code = 'admin' and p.code = 'rbac.manage'
  ) then
    raise exception 'Role admin tidak boleh kehilangan izin rbac.manage.';
  end if;
  return old;
end;
$$;

-- Penjaga profil: klien tidak boleh mengubah XP/level/streak/email,
-- dan hanya pemegang users.manage yang boleh mengubah role/status (bukan akun sendiri).
-- (Sengaja BUKAN security definer agar current_user mencerminkan pemanggil.)
create or replace function public.trg_guard_profile()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.xp := old.xp;
    new.level := old.level;
    new.streak := old.streak;
    new.longest_streak := old.longest_streak;
    new.last_activity_date := old.last_activity_date;
    new.email := old.email;
    new.id := old.id;
    if old.id = auth.uid() or not public.has_permission('users.manage') then
      new.role_id := old.role_id;
      new.is_active := old.is_active;
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: pendaftaran baru -> profil dengan role pemain
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1)),
    (select id from public.roles where code = 'pemain')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- PASANG TRIGGER (drop dulu agar idempoten)
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists xp_transaction on public.transactions;
create trigger xp_transaction after insert on public.transactions
  for each row execute function public.trg_transaction_xp();

drop trigger if exists xp_budget on public.budgets;
create trigger xp_budget after insert on public.budgets
  for each row execute function public.trg_budget_xp();

drop trigger if exists xp_deposit on public.goal_deposits;
create trigger xp_deposit after insert on public.goal_deposits
  for each row execute function public.trg_deposit_xp();

drop trigger if exists xp_claim on public.challenge_claims;
create trigger xp_claim after insert on public.challenge_claims
  for each row execute function public.trg_claim_xp();

drop trigger if exists goal_before_update on public.savings_goals;
create trigger goal_before_update before update on public.savings_goals
  for each row execute function public.trg_goal_before_update();

drop trigger if exists protect_roles on public.roles;
create trigger protect_roles before update or delete on public.roles
  for each row execute function public.trg_protect_roles();

drop trigger if exists protect_admin_rbac on public.role_permissions;
create trigger protect_admin_rbac before delete on public.role_permissions
  for each row execute function public.trg_protect_admin_rbac();

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles
  for each row execute function public.trg_guard_profile();

do $$
declare t text;
begin
  foreach t in array array['wallets','transactions','budgets','savings_goals','goal_deposits',
                           'categories','challenges','challenge_claims','achievements',
                           'roles','role_permissions'] loop
    execute format('drop trigger if exists log_activity on public.%I', t);
    execute format('create trigger log_activity after insert or update or delete on public.%I
                    for each row execute function public.trg_log_activity()', t);
  end loop;
  -- profil: hanya perubahan role / status aktif (XP & streak tidak dicatat agar log tidak ramai)
  drop trigger if exists log_activity on public.profiles;
  create trigger log_activity after update on public.profiles
    for each row
    when (old.role_id is distinct from new.role_id or old.is_active is distinct from new.is_active)
    execute function public.trg_log_activity();
end $$;

-- ---------------------------------------------------------------------
-- VIEW (security_invoker: RLS tabel dasar tetap berlaku)
-- ---------------------------------------------------------------------
create or replace view public.wallet_balances with (security_invoker = true) as
select
  w.id, w.user_id, w.name, w.type, w.icon, w.color, w.initial_balance, w.created_at,
  w.initial_balance
    + coalesce(sum(case when t.kind = 'income' then t.amount end), 0)
    - coalesce(sum(case when t.kind = 'expense' then t.amount end), 0) as balance,
  coalesce(sum(case when t.kind = 'income' then t.amount end), 0)  as total_income,
  coalesce(sum(case when t.kind = 'expense' then t.amount end), 0) as total_expense
from public.wallets w
left join public.transactions t on t.wallet_id = w.id
group by w.id;

create or replace view public.budget_status with (security_invoker = true) as
select
  b.id, b.user_id, b.category_id, b.month, b.limit_amount,
  coalesce((select sum(t.amount) from public.transactions t
            where t.user_id = b.user_id and t.category_id = b.category_id
              and t.kind = 'expense'
              and t.occurred_on >= b.month
              and t.occurred_on < (b.month + interval '1 month')::date), 0) as spent
from public.budgets b;

create or replace view public.goal_progress with (security_invoker = true) as
select
  g.id, g.user_id, g.name, g.icon, g.target_amount, g.deadline, g.status, g.completed_at, g.created_at,
  coalesce((select sum(d.amount) from public.goal_deposits d where d.goal_id = g.id), 0) as saved
from public.savings_goals g;

create or replace view public.monthly_cashflow with (security_invoker = true) as
select
  user_id,
  date_trunc('month', occurred_on)::date as month,
  coalesce(sum(case when kind = 'income' then amount end), 0)  as income,
  coalesce(sum(case when kind = 'expense' then amount end), 0) as expense,
  count(*) as tx_count
from public.transactions
group by user_id, date_trunc('month', occurred_on);

create or replace view public.category_spending with (security_invoker = true) as
select
  t.user_id,
  date_trunc('month', t.occurred_on)::date as month,
  t.kind,
  t.category_id,
  coalesce(c.name, 'Tanpa kategori') as category_name,
  coalesce(c.icon, '🪙') as category_icon,
  coalesce(c.color, '#94a3b8') as category_color,
  sum(t.amount) as total,
  count(*) as tx_count
from public.transactions t
left join public.categories c on c.id = t.category_id
group by t.user_id, date_trunc('month', t.occurred_on), t.kind, t.category_id, c.name, c.icon, c.color;

-- ---------------------------------------------------------------------
-- HAK EKSEKUSI FUNGSI
-- ---------------------------------------------------------------------
revoke execute on function public.award_xp(uuid, integer)           from public, anon, authenticated;
revoke execute on function public.touch_streak(uuid)                from public, anon, authenticated;
revoke execute on function public.evaluate_achievements(uuid)       from public, anon, authenticated;
revoke execute on function public.handle_new_user()                 from public, anon, authenticated;
revoke execute on function public.trg_transaction_xp()              from public, anon, authenticated;
revoke execute on function public.trg_budget_xp()                   from public, anon, authenticated;
revoke execute on function public.trg_deposit_xp()                  from public, anon, authenticated;
revoke execute on function public.trg_claim_xp()                    from public, anon, authenticated;
revoke execute on function public.trg_goal_before_update()          from public, anon, authenticated;
revoke execute on function public.trg_log_activity()                from public, anon, authenticated;
revoke execute on function public.check_achievements()              from public, anon;
revoke execute on function public.claim_challenge(uuid)             from public, anon;
revoke execute on function public.my_permissions()                  from public, anon;
grant  execute on function public.check_achievements()              to authenticated;
grant  execute on function public.claim_challenge(uuid)             to authenticated;
grant  execute on function public.my_permissions()                  to authenticated;
grant  execute on function public.has_permission(text)              to authenticated;

-- ---------------------------------------------------------------------
-- RLS: aktif di SEMUA tabel public
-- ---------------------------------------------------------------------
alter table public.roles             enable row level security;
alter table public.permissions       enable row level security;
alter table public.role_permissions  enable row level security;
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.wallets           enable row level security;
alter table public.transactions      enable row level security;
alter table public.budgets           enable row level security;
alter table public.savings_goals     enable row level security;
alter table public.goal_deposits     enable row level security;
alter table public.challenges        enable row level security;
alter table public.challenge_claims  enable row level security;
alter table public.achievements      enable row level security;
alter table public.user_achievements enable row level security;
alter table public.activity_logs     enable row level security;

-- Bersihkan policy lama (idempoten)
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public'
             and tablename in ('roles','permissions','role_permissions','profiles','categories','wallets',
                               'transactions','budgets','savings_goals','goal_deposits','challenges',
                               'challenge_claims','achievements','user_achievements','activity_logs') loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- RBAC: referensi boleh dibaca user login; tulis hanya rbac.manage
create policy roles_select on public.roles for select to authenticated using (true);
create policy roles_write  on public.roles for all to authenticated
  using (public.has_permission('rbac.manage')) with check (public.has_permission('rbac.manage'));

create policy permissions_select on public.permissions for select to authenticated using (true);
create policy permissions_write  on public.permissions for all to authenticated
  using (public.has_permission('rbac.manage')) with check (public.has_permission('rbac.manage'));

create policy role_permissions_select on public.role_permissions for select to authenticated using (true);
create policy role_permissions_write  on public.role_permissions for all to authenticated
  using (public.has_permission('rbac.manage')) with check (public.has_permission('rbac.manage'));

-- Profil
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.has_permission('users.manage')
  or public.has_permission('reports.view_all')
  or public.has_permission('logs.view')
);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_permission('users.manage'))
  with check (id = auth.uid() or public.has_permission('users.manage'));

-- Kategori: global (user_id null) dikelola admin, pribadi dikelola pemilik
create policy categories_select on public.categories for select to authenticated using (
  (user_id is null and (public.has_permission('categories.view') or public.has_permission('categories.manage_global')))
  or (user_id = auth.uid() and public.has_permission('categories.view'))
  or public.has_permission('reports.view_all')
);
create policy categories_insert on public.categories for insert to authenticated with check (
  (user_id = auth.uid() and public.has_permission('categories.create'))
  or (user_id is null and public.has_permission('categories.manage_global'))
);
create policy categories_update on public.categories for update to authenticated
  using ((user_id = auth.uid() and public.has_permission('categories.update'))
         or (user_id is null and public.has_permission('categories.manage_global')))
  with check ((user_id = auth.uid() and public.has_permission('categories.update'))
         or (user_id is null and public.has_permission('categories.manage_global')));
create policy categories_delete on public.categories for delete to authenticated using (
  (user_id = auth.uid() and public.has_permission('categories.delete'))
  or (user_id is null and public.has_permission('categories.manage_global'))
);

-- Tabel data pribadi: pemilik + permission; mentor/admin (reports.view_all) hanya baca
do $$
declare
  spec text;
  t text; perm text; extra text;
begin
  foreach spec in array array[
    'wallets|wallets|true',
    'transactions|transactions|exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())',
    'budgets|budgets|true',
    'savings_goals|goals|true',
    'goal_deposits|goals|exists (select 1 from public.savings_goals g where g.id = goal_id and g.user_id = auth.uid())'
  ] loop
    t := split_part(spec, '|', 1);
    perm := split_part(spec, '|', 2);
    extra := split_part(spec, '|', 3);
    execute format($f$create policy %1$I on public.%2$I for select to authenticated using (
        (user_id = auth.uid() and public.has_permission(%3$L)) or public.has_permission('reports.view_all'))$f$,
        t || '_select', t, perm || '.view');
    execute format($f$create policy %1$I on public.%2$I for insert to authenticated with check (
        user_id = auth.uid() and public.has_permission(%3$L) and %4$s)$f$,
        t || '_insert', t, perm || '.create', extra);
    execute format($f$create policy %1$I on public.%2$I for update to authenticated
        using (user_id = auth.uid() and public.has_permission(%3$L))
        with check (user_id = auth.uid() and public.has_permission(%3$L) and %4$s)$f$,
        t || '_update', t, perm || '.update', extra);
    execute format($f$create policy %1$I on public.%2$I for delete to authenticated using (
        user_id = auth.uid() and public.has_permission(%3$L))$f$,
        t || '_delete', t, perm || '.delete');
  end loop;
end $$;

-- Tantangan: dilihat yang punya izin view, dikelola challenges.manage
create policy challenges_select on public.challenges for select to authenticated using (
  public.has_permission('challenges.view') or public.has_permission('challenges.manage')
);
create policy challenges_insert on public.challenges for insert to authenticated
  with check (public.has_permission('challenges.manage'));
create policy challenges_update on public.challenges for update to authenticated
  using (public.has_permission('challenges.manage')) with check (public.has_permission('challenges.manage'));
create policy challenges_delete on public.challenges for delete to authenticated
  using (public.has_permission('challenges.manage'));

-- Klaim: hanya dibaca (insert lewat RPC claim_challenge)
create policy challenge_claims_select on public.challenge_claims for select to authenticated using (
  (user_id = auth.uid() and public.has_permission('challenges.view'))
  or public.has_permission('reports.view_all')
  or public.has_permission('challenges.manage')
);

-- Achievement
create policy achievements_select on public.achievements for select to authenticated using (true);
create policy achievements_write on public.achievements for all to authenticated
  using (public.has_permission('achievements.manage')) with check (public.has_permission('achievements.manage'));

create policy user_achievements_select on public.user_achievements for select to authenticated using (
  user_id = auth.uid() or public.has_permission('users.manage') or public.has_permission('reports.view_all')
);

-- Log aktivitas: hanya baca untuk pemegang logs.view
create policy activity_logs_select on public.activity_logs for select to authenticated
  using (public.has_permission('logs.view'));

-- Pastikan anon tidak punya akses langsung ke tabel/view
revoke all on all tables in schema public from anon;


-- =====================================================================
-- Myduit Gweh - Seed data
-- Role, permission, matriks, kategori global, achievement, tantangan,
-- 3 akun demo + data contoh pemain (2 bulan terakhir, relatif ke now()).
-- Jalankan SETELAH supabase/migrations/0001_schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Role
-- ---------------------------------------------------------------------
insert into public.roles (code, name, description, is_system) values
  ('admin',  'Game Master',     'Mengelola pengguna, role, permission, kategori global, achievement, dan melihat log aktivitas.', true),
  ('mentor', 'Mentor Keuangan', 'Melihat laporan semua pemain (read-only), melihat log, dan mengelola Tantangan Harian.', true),
  ('pemain', 'Hero / Pemain',   'Mengelola keuangan pribadi: dompet, transaksi, anggaran, quest tabungan, dan kategori pribadi.', true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Permission (kode modul.aksi)
-- ---------------------------------------------------------------------
insert into public.permissions (code, module, description) values
  ('dashboard.view',            'dashboard',    'Melihat Markas (dashboard)'),
  ('wallets.view',              'wallets',      'Melihat dompet'),
  ('wallets.create',            'wallets',      'Membuat dompet'),
  ('wallets.update',            'wallets',      'Mengubah dompet'),
  ('wallets.delete',            'wallets',      'Menghapus dompet'),
  ('transactions.view',         'transactions', 'Melihat transaksi'),
  ('transactions.create',       'transactions', 'Mencatat transaksi'),
  ('transactions.update',       'transactions', 'Mengubah transaksi'),
  ('transactions.delete',       'transactions', 'Menghapus transaksi'),
  ('budgets.view',              'budgets',      'Melihat anggaran'),
  ('budgets.create',            'budgets',      'Membuat anggaran'),
  ('budgets.update',            'budgets',      'Mengubah anggaran'),
  ('budgets.delete',            'budgets',      'Menghapus anggaran'),
  ('goals.view',                'goals',        'Melihat quest tabungan'),
  ('goals.create',              'goals',        'Membuat quest tabungan / setor dana'),
  ('goals.update',              'goals',        'Mengubah quest tabungan'),
  ('goals.delete',              'goals',        'Menghapus quest tabungan'),
  ('categories.view',           'categories',   'Melihat kategori'),
  ('categories.create',         'categories',   'Membuat kategori pribadi'),
  ('categories.update',         'categories',   'Mengubah kategori pribadi'),
  ('categories.delete',         'categories',   'Menghapus kategori pribadi'),
  ('categories.manage_global',  'categories',   'Mengelola kategori global'),
  ('challenges.view',           'challenges',   'Melihat tantangan harian'),
  ('challenges.claim',          'challenges',   'Mengklaim tantangan harian'),
  ('challenges.manage',         'challenges',   'Mengelola (CRUD) tantangan harian'),
  ('reports.view_own',          'reports',      'Melihat laporan milik sendiri'),
  ('reports.view_all',          'reports',      'Melihat laporan semua pemain'),
  ('users.manage',              'users',        'Mengelola pengguna'),
  ('rbac.manage',               'rbac',         'Mengelola role dan permission'),
  ('achievements.manage',       'achievements', 'Mengelola master achievement'),
  ('logs.view',                 'logs',         'Melihat log aktivitas')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Matriks role-permission
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on (
     (r.code = 'admin'  and p.code in ('dashboard.view','categories.view','categories.manage_global',
                                       'challenges.view','reports.view_all','users.manage',
                                       'rbac.manage','achievements.manage','logs.view'))
  or (r.code = 'mentor' and p.code in ('dashboard.view','challenges.view','challenges.manage',
                                       'reports.view_all','logs.view'))
  or (r.code = 'pemain' and p.code in ('dashboard.view',
                                       'wallets.view','wallets.create','wallets.update','wallets.delete',
                                       'transactions.view','transactions.create','transactions.update','transactions.delete',
                                       'budgets.view','budgets.create','budgets.update','budgets.delete',
                                       'goals.view','goals.create','goals.update','goals.delete',
                                       'categories.view','categories.create','categories.update','categories.delete',
                                       'challenges.view','challenges.claim','reports.view_own'))
)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Kategori global
-- ---------------------------------------------------------------------
insert into public.categories (user_id, name, icon, color, kind) values
  (null, 'Makanan & Minuman', '🍜', '#f97316', 'expense'),
  (null, 'Transportasi',      '🚌', '#38bdf8', 'expense'),
  (null, 'Belanja',           '🛍️', '#e879f9', 'expense'),
  (null, 'Tagihan',           '🧾', '#facc15', 'expense'),
  (null, 'Hiburan',           '🎮', '#a78bfa', 'expense'),
  (null, 'Kesehatan',         '💊', '#fb7185', 'expense'),
  (null, 'Pendidikan',        '📚', '#34d399', 'expense'),
  (null, 'Lainnya',           '📦', '#94a3b8', 'expense'),
  (null, 'Gaji',              '💼', '#10b981', 'income'),
  (null, 'Uang Saku',         '🎒', '#22d3ee', 'income'),
  (null, 'Bonus',             '🎁', '#fbbf24', 'income'),
  (null, 'Usaha Sampingan',   '🛠️', '#84cc16', 'income'),
  (null, 'Pemasukan Lainnya', '💰', '#94a3b8', 'income')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Achievement
-- ---------------------------------------------------------------------
insert into public.achievements (code, name, description, icon, condition_type, threshold, xp_reward) values
  ('first_step',   'Langkah Pertama',  'Catat transaksi pertamamu.',                     '👣', 'tx_count',          1,   25),
  ('tx_25',        'Pencatat Rajin',   'Catat 25 transaksi.',                            '📒', 'tx_count',          25,  50),
  ('tx_100',       'Juru Catat Legendaris', 'Catat 100 transaksi.',                      '📜', 'tx_count',          100, 150),
  ('streak_7',     'Streak 7 Hari',    'Mencatat keuangan 7 hari berturut-turut.',       '🔥', 'streak',            7,   75),
  ('streak_30',    'Streak 30 Hari',   'Mencatat keuangan 30 hari berturut-turut.',      '☄️', 'streak',            30,  200),
  ('budget_guard', 'Penjaga Anggaran', 'Selesaikan satu bulan tanpa melewati anggaran.', '🛡️', 'budget_guard',      1,   60),
  ('boss_slayer',  'Pembunuh Boss',    'Kalahkan boss pertamamu (quest tabungan selesai).', '🐉', 'goals_completed',  1,   100),
  ('collector',    'Kolektor',         'Punya 3 dompet.',                                '🎒', 'wallet_count',      3,   40),
  ('level_5',      'Naik Kelas',       'Capai level 5.',                                 '🏆', 'level',             5,   100),
  ('challenger',   'Penantang',        'Klaim 5 tantangan harian.',                      '🎯', 'challenge_claims',  5,   60)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Akun demo: auth.users + auth.identities (password: Demo12345!)
-- Trigger on_auth_user_created membuat profil (role pemain);
-- role admin/mentor diperbarui setelahnya.
-- ---------------------------------------------------------------------
do $$
declare
  u record;
  col text;
begin
  for u in
    select * from (values
      ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@myduitgweh.app',  'Game Master',     '🧙'),
      ('a0000000-0000-4000-8000-000000000002'::uuid, 'mentor@myduitgweh.app', 'Mentor Keuangan', '🦉'),
      ('a0000000-0000-4000-8000-000000000003'::uuid, 'pemain@myduitgweh.app', 'Hero Demo',       '🦊')
    ) as v(id, email, display_name, avatar)
  loop
    if not exists (select 1 from auth.users where id = u.id or email = u.email) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
        extensions.crypt('Demo12345!', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('display_name', u.display_name, 'email_verified', true),
        now(), now(), '', '', '', ''
      );
    end if;

    if not exists (select 1 from auth.identities where user_id = u.id and provider = 'email') then
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), u.id, u.id::text,
              jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
              'email', now(), now(), now());
    end if;

    -- Pastikan profil ada (jika trigger belum pernah terpasang saat user dibuat)
    insert into public.profiles (id, email, display_name, avatar, role_id)
    values (u.id, u.email, u.display_name, u.avatar, (select id from public.roles where code = 'pemain'))
    on conflict (id) do nothing;
  end loop;

  -- Kolom token lain di GoTrue tidak boleh NULL (beda versi beda kolom): isi '' jika ada.
  for col in
    select column_name from information_schema.columns
    where table_schema = 'auth' and table_name = 'users'
      and column_name in ('confirmation_token','recovery_token','email_change','email_change_token_new',
                          'email_change_token_current','phone_change','phone_change_token','reauthentication_token')
  loop
    execute format('update auth.users set %1$I = '''' where %1$I is null and email like ''%%@myduitgweh.app''', col);
  end loop;
end $$;

-- Role & nama untuk akun demo (update setelah trigger membuat profil)
update public.profiles set
  role_id = (select id from public.roles where code = 'admin'),
  display_name = 'Game Master', avatar = '🧙'
where id = 'a0000000-0000-4000-8000-000000000001';

update public.profiles set
  role_id = (select id from public.roles where code = 'mentor'),
  display_name = 'Mentor Keuangan', avatar = '🦉'
where id = 'a0000000-0000-4000-8000-000000000002';

update public.profiles set
  role_id = (select id from public.roles where code = 'pemain'),
  display_name = 'Hero Demo', avatar = '🦊'
where id = 'a0000000-0000-4000-8000-000000000003';

-- ---------------------------------------------------------------------
-- Tantangan harian (dibuat oleh mentor demo)
-- ---------------------------------------------------------------------
insert into public.challenges (created_by, title, description, icon, xp_reward)
select 'a0000000-0000-4000-8000-000000000002', v.title, v.descr, v.icon, v.xp
from (values
  ('Catat 3 Transaksi Hari Ini', 'Catat minimal tiga transaksi sebelum tidur. Sekecil apa pun, tetap dicatat!', '📝', 30),
  ('Cek Perisai HP',             'Buka halaman Anggaran dan pastikan tidak ada bar HP yang merah.',            '🛡️', 20),
  ('Nol Jajan Impulsif',         'Seharian tidak membeli sesuatu yang tidak direncanakan.',                    '🧘', 40),
  ('Setor Tabungan Receh',       'Setor berapa pun ke salah satu quest tabunganmu.',                           '🐷', 25),
  ('Rapikan Kategori',           'Periksa transaksi yang masih "Tanpa kategori" dan rapikan.',                 '🗂️', 15)
) as v(title, descr, icon, xp)
where exists (select 1 from public.profiles where id = 'a0000000-0000-4000-8000-000000000002')
  and not exists (select 1 from public.challenges c where c.title = v.title);

-- ---------------------------------------------------------------------
-- Data contoh pemain demo (hanya jika belum pernah diisi)
-- ---------------------------------------------------------------------
do $$
declare
  uid constant uuid := 'a0000000-0000-4000-8000-000000000003';
  today date := public.today_wib();
  m0 date := date_trunc('month', public.today_wib())::date;       -- awal bulan ini
  m1 date := (date_trunc('month', public.today_wib()) - interval '1 month')::date; -- awal bulan lalu
  w_cash uuid; w_bank uuid; w_ewallet uuid;
  c_food uuid; c_trans uuid; c_shop uuid; c_bill uuid; c_fun uuid; c_health uuid;
  c_salary uuid; c_allow uuid; c_free uuid; c_kopi uuid;
  g_laptop uuid; g_trip uuid; g_headset uuid;
  exp_cats uuid[]; exp_amt int[]; exp_notes text[]; exp_wallets uuid[];
  i int; n int;
begin
  if exists (select 1 from public.transactions where user_id = uid) then
    raise notice 'Data contoh pemain sudah ada, dilewati.';
    return;
  end if;

  select id into c_food   from public.categories where user_id is null and name = 'Makanan & Minuman';
  select id into c_trans  from public.categories where user_id is null and name = 'Transportasi';
  select id into c_shop   from public.categories where user_id is null and name = 'Belanja';
  select id into c_bill   from public.categories where user_id is null and name = 'Tagihan';
  select id into c_fun    from public.categories where user_id is null and name = 'Hiburan';
  select id into c_health from public.categories where user_id is null and name = 'Kesehatan';
  select id into c_salary from public.categories where user_id is null and name = 'Gaji';
  select id into c_allow  from public.categories where user_id is null and name = 'Uang Saku';

  -- Kategori pribadi
  insert into public.categories (user_id, name, icon, color, kind) values
    (uid, 'Kopi Sore', '☕', '#c2855a', 'expense'),
    (uid, 'Freelance', '💻', '#2dd4bf', 'income')
  on conflict do nothing;
  select id into c_kopi from public.categories where user_id = uid and name = 'Kopi Sore';
  select id into c_free from public.categories where user_id = uid and name = 'Freelance';

  -- 3 dompet
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'Dompet Tunai',  'cash',    '👛', '#fbbf24', 250000) returning id into w_cash;
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'Rekening Bank', 'bank',    '🏦', '#38bdf8', 3000000) returning id into w_bank;
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'E-Wallet',      'ewallet', '📱', '#a78bfa', 500000) returning id into w_ewallet;

  -- Pemasukan (bulan lalu & bulan ini)
  insert into public.transactions (user_id, wallet_id, category_id, kind, amount, note, occurred_on) values
    (uid, w_bank,    c_salary, 'income', 4500000, 'Gaji bulan lalu',        m1 + 0),
    (uid, w_ewallet, c_free,   'income',  850000, 'Proyek desain poster',   m1 + 12),
    (uid, w_cash,    c_allow,  'income',  300000, 'Uang saku tambahan',     m1 + 20),
    (uid, w_bank,    c_salary, 'income', 4500000, 'Gaji bulan ini',         m0 + 0),
    (uid, w_ewallet, c_free,   'income',  600000, 'Proyek landing page',    greatest(m0, today - 3));

  -- Pengeluaran: 36 transaksi tersebar ~55 hari terakhir (tidak ada yang di masa depan)
  exp_cats    := array[c_food, c_trans, c_shop, c_fun, c_food, c_bill, c_kopi, c_trans, c_food, c_health, c_shop, c_fun];
  exp_amt     := array[42000, 22000, 135000, 65000, 38000, 285000, 28000, 18000, 55000, 90000, 110000, 55000];
  exp_notes   := array['Makan siang', 'Ongkos ojek', 'Beli kaos', 'Nonton bareng', 'Nasi goreng', 'Tagihan internet',
                       'Kopi sore', 'Naik bus', 'Makan malam', 'Beli vitamin', 'Sepatu olahraga', 'Top up game'];
  exp_wallets := array[w_cash, w_ewallet, w_bank, w_ewallet, w_cash, w_bank, w_ewallet, w_ewallet, w_cash, w_bank, w_bank, w_ewallet];
  n := array_length(exp_cats, 1);
  for i in 0..35 loop
    insert into public.transactions (user_id, wallet_id, category_id, kind, amount, note, occurred_on)
    values (uid,
            exp_wallets[(i % n) + 1],
            exp_cats[(i % n) + 1],
            'expense',
            exp_amt[(i % n) + 1] + ((i * 7) % 5) * 1000,
            exp_notes[(i % n) + 1],
            today - ((i * 3) / 2)::int);
  end loop;

  -- 4 anggaran bulan ini + 2 bulan lalu
  insert into public.budgets (user_id, category_id, month, limit_amount) values
    (uid, c_food,  m0,  500000),
    (uid, c_trans, m0,  200000),
    (uid, c_shop,  m0,  400000),
    (uid, c_fun,   m0,  150000),
    (uid, c_food,  m1, 1500000),
    (uid, c_trans, m1,  600000);

  -- 2 quest tabungan (+ 1 quest selesai) beserta setoran
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline)
    values (uid, 'Laptop Baru', '💻', 8000000, (today + 120)) returning id into g_laptop;
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline)
    values (uid, 'Liburan Akhir Tahun', '🏝️', 5000000, (today + 200)) returning id into g_trip;
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline)
    values (uid, 'Headset Gaming', '🎧', 750000, (today - 10)) returning id into g_headset;

  insert into public.goal_deposits (user_id, goal_id, amount, note, deposited_on) values
    (uid, g_headset, 250000, 'Setoran 1', today - 50),
    (uid, g_headset, 250000, 'Setoran 2', today - 35),
    (uid, g_headset, 250000, 'Setoran 3 - boss kalah!', today - 15),
    (uid, g_laptop, 1000000, 'Sisihkan gaji', today - 45),
    (uid, g_laptop, 1200000, 'Bonus freelance', today - 20),
    (uid, g_laptop, 1000000, 'Sisihkan gaji', greatest(m0, today - 2)),
    (uid, g_trip,    800000, 'Awal tabungan', today - 30),
    (uid, g_trip,   1000000, 'Setoran bulanan', today - 5);

  -- Klaim tantangan (hari-hari sebelumnya)
  insert into public.challenge_claims (challenge_id, user_id, claim_date, xp_awarded)
  select c.id, uid, today - d.ago, c.xp_reward
  from (values ('Catat 3 Transaksi Hari Ini', 1), ('Setor Tabungan Receh', 2), ('Cek Perisai HP', 4)) as d(title, ago)
  join public.challenges c on c.title = d.title;

  -- Buka achievement yang memang sudah memenuhi syarat (trigger tidak boleh error di sini)
  perform public.evaluate_achievements(uid);

  -- Streak contoh: sedang berjalan 5 hari
  update public.profiles
     set streak = 5, longest_streak = greatest(longest_streak, 5), last_activity_date = today
   where id = uid;

  -- Rapikan waktu log: transaksi dicatat sesuai tanggal kejadian
  update public.activity_logs
     set created_at = ((detail->>'occurred_on')::date + time '12:00') at time zone 'Asia/Jakarta'
   where entity = 'transactions' and action = 'create' and user_id = uid
     and (detail->>'occurred_on') is not null;
end $$;
