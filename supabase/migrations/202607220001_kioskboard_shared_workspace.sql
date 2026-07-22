create extension if not exists pgcrypto;

create table if not exists public.workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now()
);

insert into public.workspaces (id, name)
values ('00000000-0000-4000-8000-000000000001', 'KioskBoard')
on conflict (id) do nothing;

create table if not exists public.workspace_members (
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
    created_at timestamptz not null default now(),
    primary key (workspace_id, user_id)
);

create table if not exists public.kiosks (
    id uuid primary key,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    unique (workspace_id, name)
);

create table if not exists public.events (
    id uuid primary key,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    company_name text not null,
    event_name text not null,
    event_start_date date not null,
    event_end_date date not null,
    contract_completed boolean not null default false,
    deposit_paid boolean not null default false,
    balance_paid boolean not null default false,
    installation_at timestamptz,
    recovery_at timestamptz,
    notes text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (event_end_date >= event_start_date),
    check (recovery_at is null or installation_at is null or recovery_at > installation_at)
);

create table if not exists public.event_kiosks (
    event_id uuid not null references public.events(id) on delete cascade,
    kiosk_id uuid not null references public.kiosks(id) on delete restrict,
    primary key (event_id, kiosk_id)
);

create or replace function public.is_kioskboard_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.workspace_members
        where workspace_id = target_workspace_id and user_id = auth.uid()
    );
$$;

create or replace function public.add_kioskboard_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.workspace_members (workspace_id, user_id, role)
    values ('00000000-0000-4000-8000-000000000001', new.id, 'member')
    on conflict do nothing;
    return new;
end;
$$;

drop trigger if exists add_kioskboard_member_after_signup on auth.users;
create trigger add_kioskboard_member_after_signup
after insert on auth.users
for each row execute function public.add_kioskboard_member();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.kiosks enable row level security;
alter table public.events enable row level security;
alter table public.event_kiosks enable row level security;

create policy "members read workspace" on public.workspaces for select to authenticated
using (public.is_kioskboard_member(id));
create policy "members read memberships" on public.workspace_members for select to authenticated
using (public.is_kioskboard_member(workspace_id));
create policy "members manage kiosks" on public.kiosks for all to authenticated
using (public.is_kioskboard_member(workspace_id))
with check (public.is_kioskboard_member(workspace_id));
create policy "members manage events" on public.events for all to authenticated
using (public.is_kioskboard_member(workspace_id))
with check (public.is_kioskboard_member(workspace_id));
create policy "members manage event kiosks" on public.event_kiosks for all to authenticated
using (exists (
    select 1 from public.events
    where events.id = event_kiosks.event_id
      and public.is_kioskboard_member(events.workspace_id)
))
with check (exists (
    select 1 from public.events
    where events.id = event_kiosks.event_id
      and public.is_kioskboard_member(events.workspace_id)
));

do $$
begin
    alter publication supabase_realtime add table public.events;
exception when duplicate_object then null;
end $$;

do $$
begin
    alter publication supabase_realtime add table public.kiosks;
exception when duplicate_object then null;
end $$;

do $$
begin
    alter publication supabase_realtime add table public.event_kiosks;
exception when duplicate_object then null;
end $$;
