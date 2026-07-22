import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import type { EventRecord } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';
import { GetSupabaseClient } from './SupabaseClient';

const WorkspaceId = '00000000-0000-4000-8000-000000000001';

interface EventRow
{
    id: string;
    company_name: string;
    event_name: string;
    content?: string;
    manager_name?: string;
    manager_contact?: string;
    event_start_date: string;
    event_end_date: string;
    contract_completed: boolean;
    deposit_paid: boolean;
    balance_paid: boolean;
    installation_at: string | null;
    recovery_at: string | null;
    notes: string;
    created_at: string;
    updated_at: string;
    event_kiosks?: Array<{ kiosk_id: string }>;
}

export interface SharedOperationsSnapshot
{
    Records: EventRecord[];
    Kiosks: ManagedKiosk[];
}

function RequireClient()
{
    const Client = GetSupabaseClient();
    if (Client == null) throw new Error('Supabase is not configured.');
    return Client;
}

function ToEventRecord(Row: EventRow): EventRecord
{
    return {
        Id: Row.id,
        CompanyName: Row.company_name,
        EventName: Row.event_name,
        Content: Row.content ?? '',
        ManagerName: Row.manager_name ?? '',
        ManagerContact: Row.manager_contact ?? '',
        EventStartDate: Row.event_start_date,
        EventEndDate: Row.event_end_date,
        AssignedKioskIds: Row.event_kiosks?.map((Item) => Item.kiosk_id) ?? [],
        ContractCompleted: Row.contract_completed,
        DepositPaid: Row.deposit_paid,
        BalancePaid: Row.balance_paid,
        DeliveryCompleted: false,
        InstallationDateTime: FormatLocalDateTime(Row.installation_at),
        RecoveryDateTime: FormatLocalDateTime(Row.recovery_at),
        Notes: Row.notes,
        CreatedAt: Row.created_at,
        UpdatedAt: Row.updated_at,
    };
}

function FormatLocalDateTime(Value: string | null): string
{
    if (Value == null) return '';
    const DateValue = new Date(Value);
    const Year = DateValue.getFullYear();
    const Month = String(DateValue.getMonth() + 1).padStart(2, '0');
    const Day = String(DateValue.getDate()).padStart(2, '0');
    const Hour = String(DateValue.getHours()).padStart(2, '0');
    const Minute = String(DateValue.getMinutes()).padStart(2, '0');
    return `${Year}-${Month}-${Day}T${Hour}:${Minute}`;
}

function ToEventRow(Record: EventRecord)
{
    return {
        id: Record.Id,
        workspace_id: WorkspaceId,
        company_name: Record.CompanyName,
        event_name: Record.EventName,
        content: Record.Content,
        manager_name: Record.ManagerName,
        manager_contact: Record.ManagerContact,
        event_start_date: Record.EventStartDate,
        event_end_date: Record.EventEndDate,
        contract_completed: Record.ContractCompleted,
        deposit_paid: Record.DepositPaid,
        balance_paid: Record.BalancePaid,
        installation_at: Record.InstallationDateTime === ''
            ? null
            : new Date(Record.InstallationDateTime).toISOString(),
        recovery_at: Record.RecoveryDateTime === ''
            ? null
            : new Date(Record.RecoveryDateTime).toISOString(),
        notes: Record.Notes,
        created_at: Record.CreatedAt,
        updated_at: Record.UpdatedAt,
    };
}

export async function LoadSharedOperationsSnapshot(): Promise<SharedOperationsSnapshot>
{
    const Client = RequireClient();
    const [EventsResult, KiosksResult] = await Promise.all([
        Client.from('events').select('*, event_kiosks(kiosk_id)').order('created_at'),
        Client.from('kiosks').select('*').order('created_at'),
    ]);
    if (EventsResult.error != null) throw EventsResult.error;
    if (KiosksResult.error != null) throw KiosksResult.error;

    return {
        Records: (EventsResult.data as EventRow[]).map(ToEventRecord),
        Kiosks: KiosksResult.data.map((Row) => ({
            Id: Row.id as string,
            Name: Row.name as string,
            CreatedAt: Row.created_at as string,
        })),
    };
}

export async function UpsertSharedEvent(Record: EventRecord): Promise<void>
{
    const Client = RequireClient();
    const { error: EventError } = await Client.from('events').upsert(ToEventRow(Record));
    if (EventError != null) throw EventError;
    const { error: DeleteError } = await Client.from('event_kiosks').delete().eq('event_id', Record.Id);
    if (DeleteError != null) throw DeleteError;
    if (Record.AssignedKioskIds.length > 0)
    {
        const { error } = await Client.from('event_kiosks').insert(
            Record.AssignedKioskIds.map((KioskId) => ({ event_id: Record.Id, kiosk_id: KioskId })),
        );
        if (error != null) throw error;
    }
}

export async function DeleteSharedEvent(RecordId: string): Promise<void>
{
    const { error } = await RequireClient().from('events').delete().eq('id', RecordId);
    if (error != null) throw error;
}

export async function UpsertSharedKiosk(Kiosk: ManagedKiosk): Promise<void>
{
    const { error } = await RequireClient().from('kiosks').upsert({
        id: Kiosk.Id, workspace_id: WorkspaceId, name: Kiosk.Name, created_at: Kiosk.CreatedAt,
    });
    if (error != null) throw error;
}

export async function DeleteSharedKiosk(KioskId: string): Promise<void>
{
    const { error } = await RequireClient().from('kiosks').delete().eq('id', KioskId);
    if (error != null) throw error;
}

export async function SeedSharedOperationsSnapshot(Snapshot: SharedOperationsSnapshot): Promise<void>
{
    for (const Kiosk of Snapshot.Kiosks) await UpsertSharedKiosk(Kiosk);
    for (const Record of Snapshot.Records) await UpsertSharedEvent(Record);
}

async function ClearSharedOperationsSnapshot(): Promise<void>
{
    const Client = RequireClient();
    const { error: LinksError } = await Client.from('event_kiosks').delete().neq('event_id', '');
    if (LinksError != null) throw LinksError;
    const { error: EventsError } = await Client.from('events').delete().eq('workspace_id', WorkspaceId);
    if (EventsError != null) throw EventsError;
    const { error: KiosksError } = await Client.from('kiosks').delete().eq('workspace_id', WorkspaceId);
    if (KiosksError != null) throw KiosksError;
}

export async function ReplaceSharedOperationsSnapshot(Snapshot: SharedOperationsSnapshot): Promise<void>
{
    const PreviousSnapshot = await LoadSharedOperationsSnapshot();
    try
    {
        await ClearSharedOperationsSnapshot();
        await SeedSharedOperationsSnapshot(Snapshot);
    }
    catch (ErrorValue)
    {
        await ClearSharedOperationsSnapshot();
        await SeedSharedOperationsSnapshot(PreviousSnapshot);
        throw ErrorValue;
    }
}

export function SubscribeToSharedOperations(OnChange: () => void): RealtimeChannel
{
    return RequireClient().channel('kioskboard-operations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, OnChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosks' }, OnChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_kiosks' }, OnChange)
        .subscribe();
}
