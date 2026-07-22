alter table public.events
    add column if not exists content text not null default '',
    add column if not exists manager_name text not null default '',
    add column if not exists manager_contact text not null default '';
