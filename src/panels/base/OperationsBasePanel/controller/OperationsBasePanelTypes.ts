export type OperationsView = 'ledger' | 'calendar' | 'completed';

export type EventOperationalStatus = 'scheduled' | 'active' | 'completed';

export type EventStatusFilter = 'all' | EventOperationalStatus;

export type EventCompletionField = 'ContractCompleted' | 'DepositPaid' | 'BalancePaid';

export interface EventRecord
{
    Id: string;
    CompanyName: string;
    EventName: string;
    EventStartDate: string;
    EventEndDate: string;
    AssignedKioskIds: string[];
    ContractCompleted: boolean;
    DepositPaid: boolean;
    BalancePaid: boolean;
    DeliveryCompleted: boolean;
    InstallationDateTime: string;
    RecoveryDateTime: string;
    Notes: string;
    CreatedAt: string;
    UpdatedAt: string;
}

export type EventRecordDraft = Omit<EventRecord, 'Id' | 'CreatedAt' | 'UpdatedAt'>;

export interface EventRecordWithStatus extends EventRecord
{
    OperationalStatus: EventOperationalStatus;
}

export interface OperationsSummary
{
    All: number;
    Scheduled: number;
    Active: number;
    Completed: number;
}

export interface CalendarEventItem
{
    Id: string;
    Label: string;
    OperationalStatus: EventOperationalStatus;
    IsStart: boolean;
    StartMinute: number;
    EndMinute: number;
}

export interface CalendarDay
{
    DateKey: string;
    DayNumber: number;
    IsCurrentMonth: boolean;
    IsToday: boolean;
    Events: CalendarEventItem[];
}

export type OperationsLayeredPanel =
    | {
        Kind: 'event-editor';
        Record: EventRecord | null;
    }
    | {
        Kind: 'delete-confirm';
        RecordId: string;
        RecordLabel: string;
    }
    | {
        Kind: 'kiosk-settings';
    }
    | {
        Kind: 'event-details';
        Record: EventRecordWithStatus;
    };
