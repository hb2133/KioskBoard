import { useEffect, useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import { FormatDateRange } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelState';
import type {
    EventOperationalStatus,
    EventCompletionField,
    EventRecord,
    EventRecordWithStatus,
    EventStatusFilter,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface EventLedgerSectionProps
{
    Records: EventRecordWithStatus[];
    Kiosks: ManagedKiosk[];
    HasAnyRecords: boolean;
    StatusFilter: EventStatusFilter;
    OnChangeFilter: (Filter: EventStatusFilter) => void;
    OnEdit: (Record: EventRecord) => void;
    OnDelete: (Record: EventRecord) => void;
    OnAddEvent: () => void;
    OnToggleCompletion: (RecordId: string, Field: EventCompletionField) => void;
}

const StatusFilterOptions: Array<{ Value: EventStatusFilter; Label: string }> = [
    { Value: 'upcoming', Label: Strings.StatusUpcoming },
    { Value: 'scheduled', Label: Strings.StatusScheduled },
    { Value: 'active', Label: Strings.StatusActive },
];

interface ProgressStatusFilterProps
{
    Value: EventStatusFilter;
    OnChange: (Filter: EventStatusFilter) => void;
}

function ProgressStatusFilter(Properties: ProgressStatusFilterProps)
{
    return (
        <div
            aria-label={Strings.ProgressLedgerDescription}
            className="ProgressStatusFilter"
            role="group"
        >
            {StatusFilterOptions.map((Option) => (
                <button
                    aria-pressed={Option.Value === Properties.Value}
                    className={Option.Value === Properties.Value
                        ? 'ProgressStatusFilter__button ProgressStatusFilter__button--active'
                        : 'ProgressStatusFilter__button'}
                    key={Option.Value}
                    onClick={() => Properties.OnChange(Option.Value)}
                    type="button"
                >
                    {Option.Label}
                </button>
            ))}
        </div>
    );
}

function GetStatusLabel(Status: EventOperationalStatus): string
{
    if (Status === 'scheduled')
    {
        return Strings.StatusScheduled;
    }

    if (Status === 'active')
    {
        return Strings.StatusActive;
    }

    return Strings.StatusCompleted;
}

function FormatInstallationDateTime(Value: string): string
{
    if (Value === '')
    {
        return '—';
    }

    const [DatePart, TimePart = '00:00'] = Value.split('T');
    const [, Month, Day] = DatePart.split('-').map(Number);
    const [Hour, Minute] = TimePart.split(':').map(Number);
    const Period = Hour < 12 ? '오전' : '오후';
    const DisplayHour = Hour % 12 || 12;

    return `${Month}월 ${Day}일 ${Period} ${DisplayHour}:${String(Minute).padStart(2, '0')}`;
}

function CompletionButton(Completed: boolean, OnClick: () => void)
{
    return (
        <button
            aria-pressed={Completed}
            className={Completed ? 'CompletionChip CompletionChip--done' : 'CompletionChip CompletionChip--attention'}
            onClick={OnClick}
            type="button"
        >
            {Completed ? Strings.Paid : Strings.Unpaid}
        </button>
    );
}

function AssignedKiosksCell(KioskIds: string[], Kiosks: ManagedKiosk[])
{
    const AssignedNames = KioskIds
        .map((KioskId) => Kiosks.find((Kiosk) => Kiosk.Id === KioskId)?.Name)
        .filter((Name): Name is string => Name != null);

    if (AssignedNames.length === 0)
    {
        return '—';
    }

    const FullNameList = AssignedNames.join(',');
    return (
        <>
            <strong>{AssignedNames.length}{Strings.KioskCountUnit}</strong>
            <span title={FullNameList}>{FullNameList}</span>
        </>
    );
}

export function EventLedgerSection(Properties: EventLedgerSectionProps)
{
    const [VisibleRecordCount, SetVisibleRecordCount] = useState(5);
    const VisibleRecords = Properties.Records.slice(0, VisibleRecordCount);
    const HasMoreRecords = VisibleRecordCount < Properties.Records.length;
    const NextRecordCount = Math.min(5, Properties.Records.length - VisibleRecordCount);

    useEffect(() =>
    {
        SetVisibleRecordCount(5);
    }, [Properties.StatusFilter]);

    return (
        <section
            className="ContentSection"
            data-ue-component="EventLedgerSection"
            data-ue-root="true"
        >
            <div className="ContentSection__toolbar">
                <div>
                    <h2>{Strings.ViewLedger}</h2>
                    <p>{Strings.ProgressLedgerDescription}</p>
                </div>
                <ProgressStatusFilter
                    OnChange={Properties.OnChangeFilter}
                    Value={Properties.StatusFilter}
                />
            </div>

            {Properties.Records.length === 0 ? (
                <div className="EmptyState">
                    <div className="EmptyState__icon" aria-hidden="true">☷</div>
                    <h3>{Properties.HasAnyRecords ? Strings.EmptyFilterTitle : Strings.EmptyProgressTitle}</h3>
                    <p>{Properties.HasAnyRecords ? Strings.EmptyFilterDescription : Strings.EmptyProgressDescription}</p>
                    {Properties.HasAnyRecords === false && (
                        <button className="Button Button--primary" onClick={Properties.OnAddEvent} type="button">
                            {Strings.AddEvent}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="TableViewport">
                        <table className="EventLedgerTable">
                        <thead>
                            <tr>
                                <th className="EventIdentityColumn">{Strings.CompanyName}</th>
                                <th className="EventScheduleColumn">{Strings.EventSchedule}</th>
                                <th>{Strings.Status}</th>
                                <th className="AssignedKiosksColumn">{Strings.AssignedKiosks}</th>
                                <th>{Strings.ContractCompleted}</th>
                                <th>{Strings.DepositPaid}</th>
                                <th>{Strings.BalancePaid}</th>
                                <th>{Strings.InstallationDateTime}</th>
                                <th>{Strings.RecoveryDateTime}</th>
                                <th>{Strings.Management}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VisibleRecords.map((Record) => (
                                <tr key={Record.Id}>
                                    <td className="EventIdentityCell" data-label={Strings.CompanyName}>
                                        <strong title={Record.CompanyName}>{Record.CompanyName}</strong>
                                        <span title={Record.EventName}>{Record.EventName}</span>
                                    </td>
                                    <td className="EventScheduleCell" data-label={Strings.EventSchedule}>
                                        <span>{FormatDateRange(Record.EventStartDate, Record.EventEndDate)}</span>
                                    </td>
                                    <td data-label={Strings.Status}>
                                        <span className={`StatusBadge StatusBadge--${Record.OperationalStatus}`}>
                                            {GetStatusLabel(Record.OperationalStatus)}
                                        </span>
                                    </td>
                                    <td className="AssignedKiosksCell" data-label={Strings.AssignedKiosks}>
                                        {AssignedKiosksCell(Record.AssignedKioskIds, Properties.Kiosks)}
                                    </td>
                                    <td data-label={Strings.ContractCompleted}>{CompletionButton(
                                        Record.ContractCompleted,
                                        () => Properties.OnToggleCompletion(Record.Id, 'ContractCompleted'),
                                    )}</td>
                                    <td data-label={Strings.DepositPaid}>{CompletionButton(
                                        Record.DepositPaid,
                                        () => Properties.OnToggleCompletion(Record.Id, 'DepositPaid'),
                                    )}</td>
                                    <td data-label={Strings.BalancePaid}>{CompletionButton(
                                        Record.BalancePaid,
                                        () => Properties.OnToggleCompletion(Record.Id, 'BalancePaid'),
                                    )}</td>
                                    <td data-label={Strings.InstallationDateTime}>{FormatInstallationDateTime(Record.InstallationDateTime)}</td>
                                    <td data-label={Strings.RecoveryDateTime}>{FormatInstallationDateTime(Record.RecoveryDateTime)}</td>
                                    <td data-label={Strings.Management}>
                                        <div className="TableActions">
                                            <button onClick={() => Properties.OnEdit(Record)} type="button">{Strings.Edit}</button>
                                            <button className="TableActions__delete" onClick={() => Properties.OnDelete(Record)} type="button">
                                                {Strings.Delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    {HasMoreRecords && (
                        <div className="LedgerLoadMore">
                            <button
                                onClick={() => SetVisibleRecordCount((CurrentCount) => CurrentCount + 5)}
                                type="button"
                            >
                                {Strings.LoadMore} +{NextRecordCount}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
