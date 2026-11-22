-- =====================================================================
-- সুস্থ হবো — Supabase ডাটাবেস (ধাপ ২: লগইন + রক্তদান কর্নার)
-- ব্যবহার: Supabase Dashboard → SQL Editor → New query → পুরোটা পেস্ট → Run
-- আবার চালালেও সমস্যা নেই (idempotent)।
-- =====================================================================

-- ---------- ১. প্রোফাইল (অ্যাকাউন্টের অতিরিক্ত তথ্য) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null check (char_length(full_name) between 2 and 80),
  phone         text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  role          text not null default 'রোগী' check (role in ('রোগী','রক্তদাতা','ডাক্তার','স্বেচ্ছাসেবী')),
  blood_group   text check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  division      text check (char_length(division) <= 40),
  district      text check (char_length(district) <= 40),
  upazila       text check (char_length(upazila)  <= 60),
  last_donation date check (last_donation <= current_date),
  is_donor      boolean not null default false,   -- রক্তদাতা তালিকায় থাকতে চান
  donor_visible boolean not null default true,    -- খোঁজার ফলাফলে দেখা যাবে কি না
  created_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- নতুন ইউজার হলে স্বয়ংক্রিয়ভাবে প্রোফাইল তৈরি (সাইন-আপের তথ্য থেকে)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, phone, role, blood_group, division, district, upazila, last_donation, is_donor)
  values (
    new.id,
    left(coalesce(nullif(trim(m->>'full_name'), ''), 'ব্যবহারকারী'), 80),
    m->>'phone',
    case when m->>'role' in ('রোগী','রক্তদাতা','ডাক্তার','স্বেচ্ছাসেবী') then m->>'role' else 'রোগী' end,
    nullif(m->>'blood_group', ''),
    nullif(left(m->>'division', 40), ''),
    nullif(left(m->>'district', 40), ''),
    nullif(left(m->>'upazila', 60), ''),
    nullif(m->>'last_donation', '')::date,
    (m->>'role') = 'রক্তদাতা' and nullif(m->>'blood_group', '') is not null
  );
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- নিরাপত্তা নীতি: ইউজার শুধু নিজের প্রোফাইল দেখতে/বদলাতে পারবে
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, blood_group, division, district, upazila, last_donation, is_donor, donor_visible)
  on public.profiles to authenticated;   -- role/id বদলানো যাবে না

-- ---------- ২. রক্তের অনুরোধ ----------
create table if not exists public.blood_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_name  text not null check (char_length(patient_name) between 2 and 80),
  blood_group   text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units         int  not null default 1 check (units between 1 and 20),
  needed_at     date not null,
  hospital      text not null check (char_length(hospital) between 3 and 120),
  division      text not null check (char_length(division) <= 40),
  district      text not null check (char_length(district) <= 40),
  upazila       text check (char_length(upazila) <= 60),
  problem       text check (char_length(problem) <= 300),
  contact_phone text not null check (contact_phone ~ '^01[3-9][0-9]{8}$'),
  status        text not null default 'open' check (status in ('open','fulfilled','cancelled')),
  created_at    timestamptz not null default now()
);
create index if not exists blood_requests_open_idx on public.blood_requests (status, needed_at, district);
alter table public.blood_requests enable row level security;

-- স্প্যাম ঠেকানো: দিনে সর্বোচ্চ ৫টি অনুরোধ; অতীতের তারিখ নয়
create or replace function public.blood_request_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.needed_at < current_date - 1 then
    raise exception 'DATE_PAST' using errcode = 'P0001';
  end if;
  if (select count(*) from public.blood_requests where user_id = new.user_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'RATE_LIMIT' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists blood_request_guard_trg on public.blood_requests;
create trigger blood_request_guard_trg before insert on public.blood_requests
  for each row execute function public.blood_request_guard();

drop policy if exists "own requests read"   on public.blood_requests;
drop policy if exists "own requests insert" on public.blood_requests;
drop policy if exists "own requests update" on public.blood_requests;
drop policy if exists "own requests delete" on public.blood_requests;
create policy "own requests read"   on public.blood_requests for select to authenticated using (user_id = auth.uid());
create policy "own requests insert" on public.blood_requests for insert to authenticated with check (user_id = auth.uid());
create policy "own requests update" on public.blood_requests for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own requests delete" on public.blood_requests for delete to authenticated using (user_id = auth.uid());
revoke all on public.blood_requests from anon, authenticated;
grant select, delete on public.blood_requests to authenticated;
grant insert (patient_name, blood_group, units, needed_at, hospital, division, district, upazila, problem, contact_phone)
  on public.blood_requests to authenticated;
grant update (status) on public.blood_requests to authenticated;

-- ---------- ৩. ডোনারের নম্বর দেখার লগ (অপব্যবহার ঠেকাতে) ----------
create table if not exists public.contact_log (
  id        bigint generated always as identity primary key,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  donor_id  uuid not null references auth.users(id) on delete cascade,
  at        timestamptz not null default now()
);
create index if not exists contact_log_viewer_idx on public.contact_log (viewer_id, at);
alter table public.contact_log enable row level security;   -- কোনো পলিসি নেই = সরাসরি কেউ পড়তে পারবে না
revoke all on public.contact_log from anon, authenticated;

-- ---------- ৪. নিরাপদ ফাংশন (ফ্রন্টএন্ড এগুলোই কল করবে) ----------

-- (ক) খোলা রক্তের অনুরোধ। লগইন না থাকলে ফোন নম্বর বাদ।
create or replace function public.list_blood_requests(p_group text default null, p_division text default null, p_district text default null)
returns table (id uuid, patient_name text, blood_group text, units int, needed_at date, hospital text,
               division text, district text, upazila text, problem text, contact_phone text, created_at timestamptz, is_mine boolean)
language sql stable security definer set search_path = '' as $$
  select r.id, r.patient_name, r.blood_group, r.units, r.needed_at, r.hospital, r.division, r.district, r.upazila, r.problem,
         case when auth.uid() is not null then r.contact_phone end,
         r.created_at, (r.user_id = auth.uid())
  from public.blood_requests r
  where r.status = 'open' and r.needed_at >= current_date - 1
    and (p_group    is null or p_group    = '' or r.blood_group = p_group)
    and (p_division is null or p_division = '' or r.division    = p_division)
    and (p_district is null or p_district = '' or r.district    = p_district)
  order by r.needed_at asc, r.created_at desc
  limit 60;
$$;

-- (খ) রক্তদাতা খোঁজা — ফোন নম্বর ছাড়া; শুধু লগইন করা ইউজার
create or replace function public.search_donors(p_group text default null, p_division text default null, p_district text default null, p_upazila text default null)
returns table (donor_id uuid, display_name text, blood_group text, division text, district text, upazila text, last_donation date, available boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'LOGIN_REQUIRED' using errcode = 'P0001'; end if;
  return query
  select p.id,
         split_part(p.full_name, ' ', 1),
         p.blood_group, p.division, p.district, p.upazila, p.last_donation,
         (p.last_donation is null or p.last_donation <= current_date - 90)
  from public.profiles p
  where p.is_donor and p.donor_visible and p.blood_group is not null and p.id <> auth.uid()
    and (p_group    is null or p_group    = '' or p.blood_group = p_group)
    and (p_division is null or p_division = '' or p.division    = p_division)
    and (p_district is null or p_district = '' or p.district    = p_district)
    and (p_upazila  is null or p_upazila  = '' or p.upazila     = p_upazila)
  order by (p.last_donation is null or p.last_donation <= current_date - 90) desc, p.last_donation asc nulls first
  limit 50;
end $$;

-- (গ) একজন ডোনারের নম্বর দেখা — লগইন লাগবে, ২৪ ঘণ্টায় সর্বোচ্চ ১৫ জনের, প্রতিবার লগ হয়
create or replace function public.get_donor_contact(p_donor uuid)
returns table (full_name text, phone text)
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); used int;
begin
  if me is null then raise exception 'LOGIN_REQUIRED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_donor and p.is_donor and p.donor_visible) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  select count(distinct donor_id) into used from public.contact_log where viewer_id = me and at > now() - interval '24 hours';
  if used >= 15 and not exists (select 1 from public.contact_log where viewer_id = me and donor_id = p_donor and at > now() - interval '24 hours') then
    raise exception 'RATE_LIMIT' using errcode = 'P0001';
  end if;
  insert into public.contact_log (viewer_id, donor_id) values (me, p_donor);
  return query select p.full_name, p.phone from public.profiles p where p.id = p_donor;
end $$;

-- (ঘ) হোমপেজের সংখ্যা — শুধু গণনা, কোনো ব্যক্তিগত তথ্য নয়
create or replace function public.public_stats()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'donors', (select count(*) from public.profiles where is_donor and donor_visible and blood_group is not null),
    'open_requests', (select count(*) from public.blood_requests where status = 'open' and needed_at >= current_date - 1));
$$;

revoke execute on function public.list_blood_requests(text,text,text), public.search_donors(text,text,text,text),
  public.get_donor_contact(uuid), public.public_stats() from public;
grant execute on function public.list_blood_requests(text,text,text), public.public_stats() to anon, authenticated;
grant execute on function public.search_donors(text,text,text,text), public.get_donor_contact(uuid) to authenticated;
