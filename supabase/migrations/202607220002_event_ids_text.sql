drop policy if exists "members manage event kiosks" on public.event_kiosks;

alter table public.event_kiosks
drop constraint if exists event_kiosks_event_id_fkey;

alter table public.event_kiosks
alter column event_id type text using event_id::text;

alter table public.events
alter column id type text using id::text;

alter table public.event_kiosks
add constraint event_kiosks_event_id_fkey
foreign key (event_id) references public.events(id) on delete cascade;

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
