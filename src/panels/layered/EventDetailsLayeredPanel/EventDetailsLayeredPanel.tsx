import { Strings } from '@/core/localization/Strings';
import { FormatDateRange } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelState';
import type { EventOperationalStatus } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';
import type { EventDetailsLayeredPanelProps } from './EventDetailsLayeredPanelInterface';

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

function FormatDateTime(Value: string): string
{
    if (Value === '')
    {
        return '—';
    }

    const [DatePart, TimePart = '00:00'] = Value.split('T');
    const [Year, Month, Day] = DatePart.split('-').map(Number);
    const [Hour, Minute] = TimePart.split(':').map(Number);
    const Period = Hour < 12 ? '오전' : '오후';
    const DisplayHour = Hour % 12 || 12;

    return `${Year}년 ${Month}월 ${Day}일 · ${Period} ${DisplayHour}:${String(Minute).padStart(2, '0')}`;
}

function CompletionLabel(IsComplete: boolean)
{
    return (
        <span className={IsComplete ? 'CompletionChip CompletionChip--done' : 'CompletionChip CompletionChip--attention'}>
            {IsComplete ? Strings.Paid : Strings.Unpaid}
        </span>
    );
}

export function EventDetailsLayeredPanel(Properties: EventDetailsLayeredPanelProps)
{
    const AssignedKioskNames = Properties.Record.AssignedKioskIds
        .map((KioskId) => Properties.Kiosks.find((Kiosk) => Kiosk.Id === KioskId)?.Name)
        .filter((Name): Name is string => Name != null);

    return (
        <section
            aria-labelledby="EventDetailsTitle"
            aria-modal="true"
            className="LayeredDialog LayeredDialog--details"
            data-ue-component="EventDetailsLayeredPanel"
            data-ue-root="true"
            role="dialog"
        >
            <header className="LayeredDialog__header">
                <div>
                    <h2 id="EventDetailsTitle">{Strings.EventDetailsTitle}</h2>
                    <p>{Properties.Record.CompanyName} · {Properties.Record.EventName}</p>
                </div>
                <button
                    aria-label={Strings.CloseDialog}
                    className="IconButton"
                    onClick={Properties.OnRequestClose}
                    type="button"
                >
                    ×
                </button>
            </header>

            <div className="EventDetailsBody">
                <div className="EventDetailsGrid">
                    <div className="EventDetailItem">
                        <span>{Strings.CompanyName}</span>
                        <strong>{Properties.Record.CompanyName}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.EventName}</span>
                        <strong>{Properties.Record.EventName}</strong>
                    </div>
                    <div className="EventDetailItem EventDetailItem--wide">
                        <span>{Strings.Content}</span>
                        <strong>{Properties.Record.Content || '—'}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.ManagerName}</span>
                        <strong>{Properties.Record.ManagerName || '—'}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.ManagerContact}</span>
                        <strong>{Properties.Record.ManagerContact || '—'}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.EventSchedule}</span>
                        <strong>{FormatDateRange(Properties.Record.EventStartDate, Properties.Record.EventEndDate)}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.Status}</span>
                        <span className={`StatusBadge StatusBadge--${Properties.Record.OperationalStatus}`}>
                            {GetStatusLabel(Properties.Record.OperationalStatus)}
                        </span>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.InstallationDateTime}</span>
                        <strong>{FormatDateTime(Properties.Record.InstallationDateTime)}</strong>
                    </div>
                    <div className="EventDetailItem">
                        <span>{Strings.RecoveryDateTime}</span>
                        <strong>{FormatDateTime(Properties.Record.RecoveryDateTime)}</strong>
                    </div>
                    <div className="EventDetailItem EventDetailItem--wide">
                        <span>{Strings.AssignedKiosks}</span>
                        <strong>{AssignedKioskNames.length === 0
                            ? Strings.AssignedKiosksEmpty
                            : AssignedKioskNames.join(', ')}</strong>
                    </div>
                </div>

                <div className="EventDetailsCompletion">
                    <div><span>{Strings.ContractCompleted}</span>{CompletionLabel(Properties.Record.ContractCompleted)}</div>
                    <div><span>{Strings.DepositPaid}</span>{CompletionLabel(Properties.Record.DepositPaid)}</div>
                    <div><span>{Strings.BalancePaid}</span>{CompletionLabel(Properties.Record.BalancePaid)}</div>
                </div>

                {Properties.Record.Notes !== '' && (
                    <div className="EventDetailsNotes">
                        <span>{Strings.Notes}</span>
                        <p>{Properties.Record.Notes}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
