-- Owners are managed via Supabase Auth (auth.users)
-- We extend them with a profiles table

create table profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null,
  name text not null,
  breed text,
  age_months int,
  notes text,
  vet_name text,
  vet_phone text,
  medical_notes text,
  behavioural_notes text,
  avatar_url text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_gbp numeric(8,2)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null,
  dog_id uuid references dogs(id),
  service_id uuid references services(id),
  date date not null,
  time time,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) not null,
  sender_role text not null check (sender_role in ('owner','staff')),
  content text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table dogs enable row level security;
alter table bookings enable row level security;
alter table messages enable row level security;

-- Profiles: owners see only their own
create policy "owner_profiles" on profiles for all using (auth.uid() = id);

-- Dogs: owners see only their own
create policy "owner_dogs" on dogs for all using (auth.uid() = owner_id);

-- Bookings: owners see only their own
create policy "owner_bookings" on bookings for all using (auth.uid() = owner_id);

-- Messages: owners see messages for their own bookings
create policy "owner_messages" on messages for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = messages.booking_id
        and bookings.owner_id = auth.uid()
    )
  );

-- Services: readable by all authenticated users
alter table services enable row level security;
create policy "read_services" on services for select using (auth.role() = 'authenticated');
