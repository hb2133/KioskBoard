import { LoadLocalStorageJson } from '@/core/infra/local_storage/LocalStorageJsonStore';
import type { EventRecord } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

const EventRecordsStorageKey = 'kioskboard.event-records.v1';

function NormalizeEventRecord(Value: unknown): EventRecord | null
{
    if (typeof Value !== 'object' || Value == null)
    {
        return null;
    }

    const Candidate = Value as Partial<EventRecord>;

    const IsValid = typeof Candidate.Id === 'string'
        && typeof Candidate.CompanyName === 'string'
        && typeof Candidate.EventName === 'string'
        && typeof Candidate.EventStartDate === 'string'
        && typeof Candidate.EventEndDate === 'string'
        && typeof Candidate.ContractCompleted === 'boolean'
        && typeof Candidate.DepositPaid === 'boolean'
        && typeof Candidate.BalancePaid === 'boolean'
        && typeof Candidate.DeliveryCompleted === 'boolean'
        && typeof Candidate.InstallationDateTime === 'string'
        && typeof Candidate.Notes === 'string'
        && typeof Candidate.CreatedAt === 'string'
        && typeof Candidate.UpdatedAt === 'string';

    if (IsValid === false)
    {
        return null;
    }

    return {
        Id: Candidate.Id as string,
        CompanyName: Candidate.CompanyName as string,
        EventName: Candidate.EventName as string,
        EventStartDate: Candidate.EventStartDate as string,
        EventEndDate: Candidate.EventEndDate as string,
        AssignedKioskIds: Array.isArray(Candidate.AssignedKioskIds)
            ? Candidate.AssignedKioskIds.filter((Id): Id is string => typeof Id === 'string')
            : [],
        ContractCompleted: Candidate.ContractCompleted as boolean,
        DepositPaid: Candidate.DepositPaid as boolean,
        BalancePaid: Candidate.BalancePaid as boolean,
        DeliveryCompleted: Candidate.DeliveryCompleted as boolean,
        InstallationDateTime: Candidate.InstallationDateTime as string,
        RecoveryDateTime: typeof Candidate.RecoveryDateTime === 'string'
            ? Candidate.RecoveryDateTime
            : '',
        Notes: Candidate.Notes as string,
        CreatedAt: Candidate.CreatedAt as string,
        UpdatedAt: Candidate.UpdatedAt as string,
    };
}

export function LoadEventRecordsAction(): EventRecord[]
{
    const StoredValue = LoadLocalStorageJson(EventRecordsStorageKey);

    if (Array.isArray(StoredValue) === false)
    {
        return [];
    }

    return StoredValue
        .map(NormalizeEventRecord)
        .filter((Record): Record is EventRecord => Record != null);
}

export { EventRecordsStorageKey };
