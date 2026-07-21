import type {
    CalendarDay,
    EventOperationalStatus,
    EventRecord,
    EventRecordWithStatus,
    OperationsSummary,
} from './OperationsBasePanelTypes';

const OperationalStatusOrder: Record<EventOperationalStatus, number> = {
    scheduled: 0,
    active: 1,
    completed: 2,
};

function CompareEventRecordsForDefaultOrder(
    Left: EventRecordWithStatus,
    Right: EventRecordWithStatus,
): number
{
    const StatusDifference = OperationalStatusOrder[Left.OperationalStatus]
        - OperationalStatusOrder[Right.OperationalStatus];

    if (StatusDifference !== 0)
    {
        return StatusDifference;
    }

    const StartDateDifference = Right.EventStartDate.localeCompare(Left.EventStartDate);

    if (StartDateDifference !== 0)
    {
        return StartDateDifference;
    }

    const EndDateDifference = Right.EventEndDate.localeCompare(Left.EventEndDate);

    if (EndDateDifference !== 0)
    {
        return EndDateDifference;
    }

    return Right.CreatedAt.localeCompare(Left.CreatedAt);
}

export function GetLocalDateKey(DateValue: Date): string
{
    const Year = DateValue.getFullYear();
    const Month = String(DateValue.getMonth() + 1).padStart(2, '0');
    const Day = String(DateValue.getDate()).padStart(2, '0');

    return `${Year}-${Month}-${Day}`;
}

export function GetEventOperationalStatus(
    Record: EventRecord,
    TodayKey: string,
): EventOperationalStatus
{
    if (TodayKey < Record.EventStartDate)
    {
        return 'scheduled';
    }

    if (TodayKey <= Record.EventEndDate)
    {
        return 'active';
    }

    return 'completed';
}

export function AddOperationalStatus(
    Records: EventRecord[],
    TodayKey: string,
): EventRecordWithStatus[]
{
    return Records
        .map((Record) => ({
            ...Record,
            OperationalStatus: GetEventOperationalStatus(Record, TodayKey),
        }))
        .sort(CompareEventRecordsForDefaultOrder);
}

export function GetOperationsSummary(Records: EventRecordWithStatus[]): OperationsSummary
{
    return Records.reduce<OperationsSummary>((Summary, Record) =>
    {
        Summary.All += 1;

        if (Record.OperationalStatus === 'scheduled')
        {
            Summary.Scheduled += 1;
        }
        else if (Record.OperationalStatus === 'active')
        {
            Summary.Active += 1;
        }
        else
        {
            Summary.Completed += 1;
        }

        return Summary;
    }, {
        All: 0,
        Scheduled: 0,
        Active: 0,
        Completed: 0,
    });
}

function ParseDateKey(DateKey: string): Date
{
    const [Year, Month, Day] = DateKey.split('-').map(Number);

    return new Date(Year, Month - 1, Day);
}

export function GetMonthKey(DateValue: Date): string
{
    const Year = DateValue.getFullYear();
    const Month = String(DateValue.getMonth() + 1).padStart(2, '0');

    return `${Year}-${Month}`;
}

export function ShiftMonth(MonthKey: string, Offset: number): string
{
    const [Year, Month] = MonthKey.split('-').map(Number);
    const ShiftedDate = new Date(Year, Month - 1 + Offset, 1);

    return GetMonthKey(ShiftedDate);
}

function GetCalendarEventStart(Record: EventRecordWithStatus): {
    DateKey: string;
    StartMinute: number;
}
{
    const InstallationDate = Record.InstallationDateTime.slice(0, 10);

    if (InstallationDate === '' || InstallationDate >= Record.EventStartDate)
    {
        return {
            DateKey: Record.EventStartDate,
            StartMinute: 0,
        };
    }

    const [Hour = 0, Minute = 0] = Record.InstallationDateTime
        .split('T')[1]
        ?.slice(0, 5)
        .split(':')
        .map(Number) ?? [];

    return {
        DateKey: InstallationDate,
        StartMinute: Math.min(Math.max(Hour * 60 + Minute, 0), 1439),
    };
}

function GetCalendarEventEnd(Record: EventRecordWithStatus): {
    DateKey: string;
    EndMinute: number;
}
{
    const RecoveryDate = Record.RecoveryDateTime.slice(0, 10);

    if (RecoveryDate === '')
    {
        return {
            DateKey: Record.EventEndDate,
            EndMinute: 1440,
        };
    }

    const [Hour = 0, Minute = 0] = Record.RecoveryDateTime
        .split('T')[1]
        ?.slice(0, 5)
        .split(':')
        .map(Number) ?? [];

    return {
        DateKey: RecoveryDate,
        EndMinute: Math.min(Math.max(Hour * 60 + Minute, 0), 1440),
    };
}

export function BuildCalendarDays(
    Records: EventRecordWithStatus[],
    MonthKey: string,
    TodayKey: string,
): CalendarDay[]
{
    const [Year, Month] = MonthKey.split('-').map(Number);
    const FirstDay = new Date(Year, Month - 1, 1);
    const GridStart = new Date(Year, Month - 1, 1 - FirstDay.getDay());

    return Array.from({ length: 42 }, (_, Index) =>
    {
        const DayDate = new Date(
            GridStart.getFullYear(),
            GridStart.getMonth(),
            GridStart.getDate() + Index,
        );
        const DateKey = GetLocalDateKey(DayDate);
        const Events = Records.flatMap((Record) =>
        {
            const CalendarStart = GetCalendarEventStart(Record);
            const CalendarEnd = GetCalendarEventEnd(Record);

            if (
                DateKey < CalendarStart.DateKey
                || DateKey > CalendarEnd.DateKey
                || (DateKey === CalendarEnd.DateKey && CalendarEnd.EndMinute === 0)
            )
            {
                return [];
            }

            return [{
                Id: Record.Id,
                Label: `${Record.CompanyName} · ${Record.EventName}`,
                OperationalStatus: Record.OperationalStatus,
                IsStart: DateKey === CalendarStart.DateKey,
                StartMinute: DateKey === CalendarStart.DateKey ? CalendarStart.StartMinute : 0,
                EndMinute: DateKey === CalendarEnd.DateKey ? CalendarEnd.EndMinute : 1440,
            }];
        });

        return {
            DateKey,
            DayNumber: DayDate.getDate(),
            IsCurrentMonth: DayDate.getMonth() === Month - 1,
            IsToday: DateKey === TodayKey,
            Events,
        };
    });
}

export function FormatDateRange(StartDate: string, EndDate: string): string
{
    const Start = ParseDateKey(StartDate);
    const End = ParseDateKey(EndDate);
    const Formatter = new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
    });

    if (StartDate === EndDate)
    {
        return Formatter.format(Start);
    }

    return `${Formatter.format(Start)} – ${Formatter.format(End)}`;
}
