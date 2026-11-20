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
  (null, 'Makanan & Minuman', 'utensils', '#f97316', 'expense'),
  (null, 'Transportasi',      'bus', '#38bdf8', 'expense'),
  (null, 'Belanja',           'shopping-bag', '#e879f9', 'expense'),
  (null, 'Tagihan',           'receipt', '#facc15', 'expense'),
  (null, 'Hiburan',           'gamepad', '#a78bfa', 'expense'),
  (null, 'Kesehatan',         'pill', '#fb7185', 'expense'),
  (null, 'Pendidikan',        'book-open', '#34d399', 'expense'),
  (null, 'Lainnya',           'package', '#94a3b8', 'expense'),
  (null, 'Gaji',              'briefcase', '#10b981', 'income'),
  (null, 'Uang Saku',         'backpack', '#22d3ee', 'income'),
  (null, 'Bonus',             'gift', '#fbbf24', 'income'),
  (null, 'Usaha Sampingan',   'wrench', '#84cc16', 'income'),
  (null, 'Pemasukan Lainnya', 'banknote', '#94a3b8', 'income')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Achievement
-- ---------------------------------------------------------------------
insert into public.achievements (code, name, description, icon, condition_type, threshold, xp_reward) values
  ('first_step',   'Langkah Pertama',  'Catat transaksi pertamamu.',                     'footprints', 'tx_count',          1,   25),
  ('tx_25',        'Pencatat Rajin',   'Catat 25 transaksi.',                            'notebook', 'tx_count',          25,  50),
  ('tx_100',       'Juru Catat Legendaris', 'Catat 100 transaksi.',                      'scroll-text', 'tx_count',          100, 150),
  ('streak_7',     'Streak 7 Hari',    'Mencatat keuangan 7 hari berturut-turut.',       'flame', 'streak',            7,   75),
  ('streak_30',    'Streak 30 Hari',   'Mencatat keuangan 30 hari berturut-turut.',      'zap', 'streak',            30,  200),
  ('budget_guard', 'Penjaga Anggaran', 'Selesaikan satu bulan tanpa melewati anggaran.', 'shield-check', 'budget_guard',      1,   60),
  ('boss_slayer',  'Pembunuh Boss',    'Kalahkan boss pertamamu (quest tabungan selesai).', 'skull', 'goals_completed',  1,   100),
  ('collector',    'Kolektor',         'Punya 3 dompet.',                                'backpack', 'wallet_count',      3,   40),
  ('level_5',      'Naik Kelas',       'Capai level 5.',                                 'trophy', 'level',             5,   100),
  ('challenger',   'Penantang',        'Klaim 5 tantangan harian.',                      'target', 'challenge_claims',  5,   60)
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
      ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@myduitgweh.app',  'Game Master',     'mage'),
      ('a0000000-0000-4000-8000-000000000002'::uuid, 'mentor@myduitgweh.app', 'Mentor Keuangan', 'owl'),
      ('a0000000-0000-4000-8000-000000000003'::uuid, 'pemain@myduitgweh.app', 'Hero Demo',       'fox')
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
  display_name = 'Game Master', avatar = 'mage'
where id = 'a0000000-0000-4000-8000-000000000001';

update public.profiles set
  role_id = (select id from public.roles where code = 'mentor'),
  display_name = 'Mentor Keuangan', avatar = 'owl'
where id = 'a0000000-0000-4000-8000-000000000002';

update public.profiles set
  role_id = (select id from public.roles where code = 'pemain'),
  display_name = 'Hero Demo', avatar = 'fox'
where id = 'a0000000-0000-4000-8000-000000000003';

-- ---------------------------------------------------------------------
-- Tantangan harian (dibuat oleh mentor demo)
-- ---------------------------------------------------------------------
insert into public.challenges (created_by, title, description, icon, xp_reward)
select 'a0000000-0000-4000-8000-000000000002', v.title, v.descr, v.icon, v.xp
from (values
  ('Catat 3 Transaksi Hari Ini', 'Catat minimal tiga transaksi sebelum tidur. Sekecil apa pun, tetap dicatat!', 'notebook-pen', 30),
  ('Cek Perisai HP',             'Buka halaman Anggaran dan pastikan tidak ada bar HP yang merah.',            'shield-check', 20),
  ('Nol Jajan Impulsif',         'Seharian tidak membeli sesuatu yang tidak direncanakan.',                    'leaf', 40),
  ('Setor Tabungan Receh',       'Setor berapa pun ke salah satu quest tabunganmu.',                           'piggy-bank', 25),
  ('Rapikan Kategori',           'Periksa transaksi yang masih "Tanpa kategori" dan rapikan.',                 'folders', 15)
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
    (uid, 'Kopi Sore', 'coffee', '#c2855a', 'expense'),
    (uid, 'Freelance', 'laptop', '#2dd4bf', 'income')
  on conflict do nothing;
  select id into c_kopi from public.categories where user_id = uid and name = 'Kopi Sore';
  select id into c_free from public.categories where user_id = uid and name = 'Freelance';

  -- 3 dompet
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'Dompet Tunai',  'cash',    'wallet', '#fbbf24', 250000) returning id into w_cash;
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'Rekening Bank', 'bank',    'landmark', '#38bdf8', 3000000) returning id into w_bank;
  insert into public.wallets (user_id, name, type, icon, color, initial_balance) values
    (uid, 'E-Wallet',      'ewallet', 'smartphone', '#a78bfa', 500000) returning id into w_ewallet;

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
    values (uid, 'Laptop Baru', 'laptop', 8000000, (today + 120)) returning id into g_laptop;
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline)
    values (uid, 'Liburan Akhir Tahun', 'tree-palm', 5000000, (today + 200)) returning id into g_trip;
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline)
    values (uid, 'Headset Gaming', 'headphones', 750000, (today - 10)) returning id into g_headset;

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
