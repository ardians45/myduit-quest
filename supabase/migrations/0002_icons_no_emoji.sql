-- =====================================================================
-- Myduit Gweh - Migrasi 0002: ikon berupa kunci (tanpa emoji)
-- Kolom icon / avatar sekarang menyimpan KUNCI ikon (mis. 'utensils')
-- atau KUNCI avatar (mis. 'knight'), bukan karakter emoji.
-- Idempoten: aman dijalankan berulang, dan di atas data kosong.
-- Emoji lama dikenali lewat codepoint (U+FE0F dibuang lebih dulu),
-- jadi file ini sendiri tidak berisi karakter emoji.
-- =====================================================================

-- 1) Default kolom -> kunci
alter table public.categories      alter column icon   set default 'coins';
alter table public.wallets         alter column icon   set default 'wallet';
alter table public.savings_goals   alter column icon   set default 'skull';
alter table public.challenges      alter column icon   set default 'target';
alter table public.achievements    alter column icon   set default 'trophy';
alter table public.profiles        alter column avatar set default 'knight';

-- 2) Fungsi pemeta (sementara, hilang saat sesi berakhir)
-- Nilai yang sudah berupa kunci dibiarkan. Emoji lama dipetakan lewat codepoint
-- karakter pertama. Tidak dikenal -> nilai default kolom (p_default).
create or replace function pg_temp.icon_key(p_val text, p_default text)
returns text language plpgsql immutable as $$
declare
  v text;
  cp int;
begin
  if p_val is null or btrim(p_val) = '' then
    return p_default;
  end if;
  if p_val ~ '^[a-z][a-z0-9-]*$' then
    return p_val;
  end if;
  v := replace(p_val, chr(65039), '');
  if v = '' then
    return p_default;
  end if;
  cp := ascii(v);
  return case cp
    when 129689 then 'coins'          -- koin
    when 128176 then 'banknote'       -- kantong uang
    when 127836 then 'utensils'       -- mangkuk mi
    when 9749   then 'coffee'         -- kopi
    when 128652 then 'bus'            -- bus
    when 128717 then 'shopping-bag'   -- tas belanja
    when 129534 then 'receipt'        -- struk
    when 127918 then 'gamepad'        -- gamepad
    when 128138 then 'pill'           -- pil
    when 128218 then 'book-open'      -- buku bertumpuk
    when 127873 then 'gift'           -- kado
    when 128188 then 'briefcase'      -- tas kerja
    when 127890 then 'backpack'       -- ransel
    when 128736 then 'wrench'         -- palu dan kunci pas
    when 128187 then 'laptop'         -- laptop
    when 127968 then 'house'          -- rumah
    when 9992   then 'plane'          -- pesawat
    when 127911 then 'headphones'     -- headphone
    when 128055 then 'piggy-bank'     -- wajah babi
    when 128009 then 'skull'          -- naga
    when 128091 then 'wallet'         -- dompet kecil
    when 127974 then 'landmark'       -- bank
    when 128241 then 'smartphone'     -- ponsel
    when 128179 then 'credit-card'    -- kartu kredit
    when 128230 then 'package'        -- paket
    when 127965 then 'tree-palm'      -- pulau
    when 128663 then 'car'            -- mobil
    when 127891 then 'graduation-cap' -- topi wisuda
    when 128099 then 'footprints'     -- jejak kaki
    when 128210 then 'notebook'       -- buku catatan
    when 128220 then 'scroll-text'    -- gulungan
    when 128293 then 'flame'          -- api
    when 9732   then 'zap'            -- komet
    when 128737 then 'shield-check'   -- perisai
    when 127942 then 'trophy'         -- piala
    when 127919 then 'target'         -- sasaran
    when 128221 then 'notebook-pen'   -- memo
    when 129496 then 'leaf'           -- orang bermeditasi
    when 128450 then 'folders'        -- pembatas kartu
    when 128161 then 'lightbulb'      -- lampu
    when 128640 then 'rocket'         -- roket
    else p_default
  end;
end;
$$;

create or replace function pg_temp.avatar_key(p_val text)
returns text language plpgsql immutable as $$
declare
  v text;
begin
  if p_val is null or btrim(p_val) = '' then
    return 'knight';
  end if;
  if p_val ~ '^[a-z][a-z0-9-]*$' then
    return p_val;
  end if;
  v := replace(p_val, chr(65039), '');
  return case ascii(v)
    when 129418 then 'fox'     -- rubah
    when 129497 then 'mage'    -- penyihir
    when 129417 then 'owl'     -- burung hantu
    when 128049 then 'rogue'   -- kucing
    when 128060 then 'ranger'  -- panda
    when 129409 then 'knight'  -- singa
    when 128050 then 'dragon'  -- naga (wajah)
    when 129399 then 'rogue'   -- ninja
    when 129302 then 'robot'   -- robot
    when 128126 then 'robot'   -- monster alien
    else 'knight'
  end;
end;
$$;

-- 3) Ubah data lama. Trigger log aktivitas dan guard boss dimatikan sementara
-- agar migrasi massal tidak membanjiri activity_logs atau memicu XP.
-- (Dijalankan sebagai pemilik tabel; trigger dinyalakan lagi di akhir.)
alter table public.categories    disable trigger log_activity;
alter table public.wallets       disable trigger log_activity;
alter table public.savings_goals disable trigger log_activity;
alter table public.savings_goals disable trigger goal_before_update;
alter table public.challenges    disable trigger log_activity;
alter table public.achievements  disable trigger log_activity;

update public.categories   set icon = pg_temp.icon_key(icon, 'coins')        where icon is distinct from pg_temp.icon_key(icon, 'coins');
update public.wallets      set icon = pg_temp.icon_key(icon, 'wallet')       where icon is distinct from pg_temp.icon_key(icon, 'wallet');
update public.savings_goals set icon = pg_temp.icon_key(icon, 'skull')       where icon is distinct from pg_temp.icon_key(icon, 'skull');
update public.challenges   set icon = pg_temp.icon_key(icon, 'target')       where icon is distinct from pg_temp.icon_key(icon, 'target');
update public.achievements set icon = pg_temp.icon_key(icon, 'trophy')       where icon is distinct from pg_temp.icon_key(icon, 'trophy');
update public.profiles     set avatar = pg_temp.avatar_key(avatar)           where avatar is distinct from pg_temp.avatar_key(avatar);

alter table public.categories    enable trigger log_activity;
alter table public.wallets       enable trigger log_activity;
alter table public.savings_goals enable trigger log_activity;
alter table public.savings_goals enable trigger goal_before_update;
alter table public.challenges    enable trigger log_activity;
alter table public.achievements  enable trigger log_activity;

-- 4) View category_spending: ikon fallback berupa kunci
create or replace view public.category_spending with (security_invoker = true) as
select
  t.user_id,
  date_trunc('month', t.occurred_on)::date as month,
  t.kind,
  t.category_id,
  coalesce(c.name, 'Tanpa kategori') as category_name,
  coalesce(c.icon, 'coins') as category_icon,
  coalesce(c.color, '#94a3b8') as category_color,
  sum(t.amount) as total,
  count(*) as tx_count
from public.transactions t
left join public.categories c on c.id = t.category_id
group by t.user_id, date_trunc('month', t.occurred_on), t.kind, t.category_id, c.name, c.icon, c.color;

-- 5) Fungsi pembuat profil: avatar default 'knight' (eksplisit)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar, role_id)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1)),
    'knight',
    (select id from public.roles where code = 'pemain')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
