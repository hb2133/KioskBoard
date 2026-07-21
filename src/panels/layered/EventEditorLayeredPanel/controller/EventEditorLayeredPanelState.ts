import type {
    EventRecord,
    EventRecordDraft,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface KioskScheduleConflict
{
    KioskId: string;
    EventLabel: string;
    EventStartDate: string;
    EventEndDate: string;
}

function GetNextDateKey(DateKey: string): string
{
    const [Year, Month, Day] = DateKey.split('-').map(Number);
    const NextDate = new Date(Year, Month - 1, Day + 1);
    const NextYear = NextDate.getFullYear();
    const NextMonth = String(NextDate.getMonth() + 1).padStart(2, '0');
    const NextDay = String(NextDate.getDate()).padStart(2, '0');

    return `${NextYear}-${NextMonth}-${NextDay}`;
}

function GetOccupiedRange(Record: EventRecord | EventRecordDraft): {
    Start: string;
    End: string;
} | null
{
    if (Record.EventStartDate === '' || Record.EventEndDate === '')
    {
        return null;
    }

    const EventStart = `${Record.EventStartDate}T00:00`;
    const Start = Record.InstallationDateTime !== ''
        && Record.InstallationDateTime < EventStart
        ? Record.InstallationDateTime
        : EventStart;
    const End = Record.RecoveryDateTime !== ''
        ? Record.RecoveryDateTime
        : `${GetNextDateKey(Record.EventEndDate)}T00:00`;

    return { Start, End };
}

export function GetKioskScheduleConflicts(
    Draft: EventRecordDraft,
    Records: EventRecord[],
    EditingRecordId: string | null,
): Map<string, KioskScheduleConflict>
{
    const DraftRange = GetOccupiedRange(Draft);
    const Conflicts = new Map<string, KioskScheduleConflict>();

    if (DraftRange == null)
    {
        return Conflicts;
    }

    Records.forEach((Record) =>
    {
        if (Record.Id === EditingRecordId)
        {
            return;
        }

        const RecordRange = GetOccupiedRange(Record);

        if (
            RecordRange == null
            || DraftRange.Start >= RecordRange.End
            || DraftRange.End <= RecordRange.Start
        )
        {
            return;
        }

        Record.AssignedKioskIds.forEach((KioskId) =>
        {
            if (Conflicts.has(KioskId) === false)
            {
                Conflicts.set(KioskId, {
                    KioskId,
                    EventLabel: `${Record.CompanyName} · ${Record.EventName}`,
                    EventStartDate: Record.EventStartDate,
                    EventEndDate: Record.EventEndDate,
                });
            }
        });
    });

    return Conflicts;
}
