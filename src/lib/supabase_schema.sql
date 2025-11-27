-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create animals table
create table if not exists animals (
  uuid text primary key,
  id serial,
  animal jsonb,
  pai jsonb,
  mae jsonb,
  "avoMaterno" jsonb,
  "updatedAt" text,
  "_deleted" boolean default false,
  "lastModified" text
);

-- Create farms table
create table if not exists farms (
  uuid text primary key,
  id serial,
  "farmName" text,
  "updatedAt" text,
  "_deleted" boolean default false,
  "lastModified" text
);

-- Create vaccines table
create table if not exists vaccines (
  uuid text primary key,
  id serial,
  "vaccineName" text,
  "updatedAt" text,
  "_deleted" boolean default false,
  "lastModified" text
);

-- Create matriz table
create table if not exists matriz (
  uuid text primary key,
  id serial,
  nome text,
  "serieRGD" text,
  rgn text,
  sexo text,
  nasc text,
  iabcgz text,
  deca text,
  p text,
  f text,
  status jsonb,
  farm text,
  vacinas jsonb,
  type text,
  genotipagem text,
  condition text,
  "parturitionFrom" jsonb,
  "protocolosReproducao" jsonb,
  "updatedAt" text,
  "_deleted" boolean default false,
  "lastModified" text
);

-- Enable Row Level Security (RLS)
alter table animals enable row level security;
alter table farms enable row level security;
alter table vaccines enable row level security;
alter table matriz enable row level security;

-- Create policies to allow public access (for development/demo purposes)
-- WARNING: In production, you should restrict this to authenticated users
create policy "Public access for animals" on animals for all using (true) with check (true);
create policy "Public access for farms" on farms for all using (true) with check (true);
create policy "Public access for vaccines" on vaccines for all using (true) with check (true);
create policy "Public access for matriz" on matriz for all using (true) with check (true);
