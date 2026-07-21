import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
    FormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    WheelEvent as ReactWheelEvent,
} from 'react';
import { Strings } from '@/core/localization/Strings';
import { UseEventEditorLayeredPanelController } from './controller/EventEditorLayeredPanelController';
import {
    GetKioskScheduleConflicts,
} from './controller/EventEditorLayeredPanelState';
import type { KioskScheduleConflict } from './controller/EventEditorLayeredPanelState';
import type { EventEditorLayeredPanelProps } from './EventEditorLayeredPanelInterface';
import {
    HangulTextArea,
    HangulTextInput,
} from '@/panels/shared/HangulTextField/HangulTextField';

interface LocalizedPickerFieldProps
{
    Label: string;
    Type: 'date' | 'datetime-local';
    Value: string;
    Minimum?: string;
    OnChange: (Value: string) => void;
}

interface PickerCalendarDay
{
    DateKey: string;
    DayNumber: number;
    IsCurrentMonth: boolean;
    IsToday: boolean;
}

interface PickerPopoverPosition
{
    Top: number;
    Left: number;
}

function GetLocalDateKey(DateValue: Date): string
{
    const Year = DateValue.getFullYear();
    const Month = String(DateValue.getMonth() + 1).padStart(2, '0');
    const Day = String(DateValue.getDate()).padStart(2, '0');

    return `${Year}-${Month}-${Day}`;
}

function GetPickerMonthKey(Value: string): string
{
    if (Value !== '')
    {
        return Value.slice(0, 7);
    }

    return GetLocalDateKey(new Date()).slice(0, 7);
}

function ShiftPickerMonth(MonthKey: string, Offset: number): string
{
    const [Year, Month] = MonthKey.split('-').map(Number);
    const ShiftedDate = new Date(Year, Month - 1 + Offset, 1);

    return GetLocalDateKey(ShiftedDate).slice(0, 7);
}

function BuildPickerCalendarDays(MonthKey: string): PickerCalendarDay[]
{
    const [Year, Month] = MonthKey.split('-').map(Number);
    const FirstDay = new Date(Year, Month - 1, 1);
    const GridStart = new Date(Year, Month - 1, 1 - FirstDay.getDay());
    const TodayKey = GetLocalDateKey(new Date());

    return Array.from({ length: 42 }, (_, Index) =>
    {
        const DayDate = new Date(
            GridStart.getFullYear(),
            GridStart.getMonth(),
            GridStart.getDate() + Index,
        );
        const DateKey = GetLocalDateKey(DayDate);

        return {
            DateKey,
            DayNumber: DayDate.getDate(),
            IsCurrentMonth: DayDate.getMonth() === Month - 1,
            IsToday: DateKey === TodayKey,
        };
    });
}

function FormatMonthDay(Value: string): string
{
    if (Value === '')
    {
        return Strings.MonthDayPlaceholder;
    }

    const [, Month, Day] = Value.split('-').map(Number);

    return `${Month}월 ${Day}일`;
}

function FormatInstallationDateTime(Value: string): string
{
    if (Value === '')
    {
        return Strings.InstallationDateTimePlaceholder;
    }

    const [DatePart, TimePart = '00:00'] = Value.split('T');
    const [Year, Month, Day] = DatePart.split('-').map(Number);
    const [Hour, Minute] = TimePart.split(':').map(Number);

    const Period = Hour < 12 ? '오전' : '오후';
    const DisplayHour = Hour % 12 || 12;

    return `${Year}년 ${Month}월 ${Day}일 · ${Period} ${DisplayHour}:${String(Minute).padStart(2, '0')}`;
}

function LocalizedPickerField(Properties: LocalizedPickerFieldProps)
{
    const PickerRoot = useRef<HTMLDivElement>(null);
    const PickerPopover = useRef<HTMLDivElement>(null);
    const [IsOpen, SetIsOpen] = useState(false);
    const [OpenTimeCombo, SetOpenTimeCombo] = useState<'hour' | 'minute' | null>(null);
    const [PopoverPosition, SetPopoverPosition] = useState<PickerPopoverPosition | null>(null);
    const [VisibleMonth, SetVisibleMonth] = useState(() => GetPickerMonthKey(Properties.Value));
    const DisplayValue = Properties.Type === 'date'
        ? FormatMonthDay(Properties.Value)
        : FormatInstallationDateTime(Properties.Value);
    const SelectedDate = Properties.Value.slice(0, 10);
    const CalendarDays = BuildPickerCalendarDays(VisibleMonth);
    const [VisibleYear, VisibleMonthNumber] = VisibleMonth.split('-').map(Number);
    const MonthLabel = `${VisibleYear}년 ${VisibleMonthNumber}월`;
    const TimePart = Properties.Value.split('T')[1] ?? '09:00';
    const [SelectedHour, SelectedMinute] = TimePart.split(':');

    useEffect(() =>
    {
        if (IsOpen === false)
        {
            return undefined;
        }

        function HandleOutsidePointerDown(Event: PointerEvent): void
        {
            const EventTarget = Event.target as Node;
            const IsInsideTrigger = PickerRoot.current?.contains(EventTarget) === true;
            const IsInsidePopover = PickerPopover.current?.contains(EventTarget) === true;

            if (IsInsideTrigger === false && IsInsidePopover === false)
            {
                SetIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', HandleOutsidePointerDown);
        return () => document.removeEventListener('pointerdown', HandleOutsidePointerDown);
    }, [IsOpen]);

    useLayoutEffect(() =>
    {
        if (IsOpen === false)
        {
            SetPopoverPosition(null);
            return undefined;
        }

        let AnimationFrame = 0;

        function UpdatePopoverPosition(): void
        {
            const TriggerElement = PickerRoot.current;
            const PopoverElement = PickerPopover.current;

            if (TriggerElement == null || PopoverElement == null)
            {
                return;
            }

            const TriggerBounds = TriggerElement.getBoundingClientRect();
            const PopoverWidth = PopoverElement.offsetWidth;
            const PopoverHeight = PopoverElement.offsetHeight;
            const ViewportMargin = 12;
            const PopoverGap = 6;
            const SpaceBelow = window.innerHeight - TriggerBounds.bottom - ViewportMargin;
            const OpenBelow = SpaceBelow >= PopoverHeight;
            const Top = OpenBelow
                ? TriggerBounds.bottom + PopoverGap
                : Math.max(ViewportMargin, TriggerBounds.top - PopoverHeight - PopoverGap);
            const Left = Math.min(
                Math.max(ViewportMargin, TriggerBounds.left),
                window.innerWidth - PopoverWidth - ViewportMargin,
            );

            SetPopoverPosition({ Top, Left });
        }

        AnimationFrame = window.requestAnimationFrame(UpdatePopoverPosition);
        window.addEventListener('resize', UpdatePopoverPosition);
        document.addEventListener('scroll', UpdatePopoverPosition, true);

        return () =>
        {
            window.cancelAnimationFrame(AnimationFrame);
            window.removeEventListener('resize', UpdatePopoverPosition);
            document.removeEventListener('scroll', UpdatePopoverPosition, true);
        };
    }, [IsOpen, Properties.Type]);

    function TogglePicker(): void
    {
        if (IsOpen === false)
        {
            SetVisibleMonth(GetPickerMonthKey(Properties.Value));
        }
        else
        {
            SetOpenTimeCombo(null);
        }

        SetIsOpen((CurrentValue) => CurrentValue === false);
    }

    function SelectDate(DateKey: string): void
    {
        if (Properties.Minimum != null && DateKey < Properties.Minimum)
        {
            return;
        }

        if (Properties.Type === 'date')
        {
            Properties.OnChange(DateKey);
            SetIsOpen(false);
            return;
        }

        Properties.OnChange(`${DateKey}T${SelectedHour}:${SelectedMinute}`);
    }

    function UpdateTime(Hour: string, Minute: string): void
    {
        const DateKey = SelectedDate === '' ? GetLocalDateKey(new Date()) : SelectedDate;

        Properties.OnChange(`${DateKey}T${Hour}:${Minute}`);
    }

    function SelectToday(): void
    {
        const Now = new Date();
        const TodayKey = GetLocalDateKey(Now);

        if (Properties.Type === 'date')
        {
            Properties.OnChange(TodayKey);
        }
        else
        {
            const Hour = String(Now.getHours()).padStart(2, '0');
            const Minute = String(Now.getMinutes()).padStart(2, '0');
            Properties.OnChange(`${TodayKey}T${Hour}:${Minute}`);
        }

        SetIsOpen(false);
    }

    function HandlePickerKeyDown(Event: ReactKeyboardEvent<HTMLDivElement>): void
    {
        if (Event.key === 'Escape' && IsOpen === true)
        {
            Event.preventDefault();
            Event.stopPropagation();
            SetIsOpen(false);
        }
    }

    return (
        <div
            className="LocalizedPickerRoot"
            onKeyDown={HandlePickerKeyDown}
            ref={PickerRoot}
        >
            <button
                aria-label={Properties.Label}
                aria-expanded={IsOpen}
                className={Properties.Value === ''
                    ? 'LocalizedPickerField LocalizedPickerField--empty'
                    : 'LocalizedPickerField'}
                onClick={TogglePicker}
                type="button"
            >
                <span>{DisplayValue}</span>
                <span className="LocalizedPickerField__icon" aria-hidden="true">▦</span>
            </button>

            {IsOpen === true && createPortal((
                <div
                    aria-label={Properties.Label}
                    className={Properties.Type === 'datetime-local'
                        ? 'LocalizedPickerPopover LocalizedPickerPopover--datetime'
                        : 'LocalizedPickerPopover'}
                    ref={PickerPopover}
                    role="dialog"
                    style={{
                        left: PopoverPosition?.Left ?? 0,
                        top: PopoverPosition?.Top ?? 0,
                        visibility: PopoverPosition == null ? 'hidden' : 'visible',
                    }}
                >
                    <div className="PickerHeader">
                        <button
                            aria-label={Strings.PreviousMonth}
                            onClick={() => SetVisibleMonth((Month) => ShiftPickerMonth(Month, -1))}
                            type="button"
                        >
                            ‹
                        </button>
                        <strong>{MonthLabel}</strong>
                        <button
                            aria-label={Strings.NextMonth}
                            onClick={() => SetVisibleMonth((Month) => ShiftPickerMonth(Month, 1))}
                            type="button"
                        >
                            ›
                        </button>
                    </div>

                    <div className="PickerWeekdays">
                        {Strings.Weekdays.map((Weekday) => <span key={Weekday}>{Weekday}</span>)}
                    </div>
                    <div className="PickerDays">
                        {CalendarDays.map((Day) =>
                        {
                            const IsDisabled = Properties.Minimum != null
                                && Day.DateKey < Properties.Minimum;
                            const DayClasses = [
                                'PickerDay',
                                Day.IsCurrentMonth ? '' : 'PickerDay--muted',
                                Day.IsToday ? 'PickerDay--today' : '',
                                Day.DateKey === SelectedDate ? 'PickerDay--selected' : '',
                            ].filter(Boolean).join(' ');

                            return (
                                <button
                                    className={DayClasses}
                                    disabled={IsDisabled}
                                    key={Day.DateKey}
                                    onClick={() => SelectDate(Day.DateKey)}
                                    type="button"
                                >
                                    {Day.DayNumber}
                                </button>
                            );
                        })}
                    </div>

                    {Properties.Type === 'datetime-local' && (
                        <div className="PickerTime">
                            <div className="TimeComboBox">
                                <button
                                    aria-expanded={OpenTimeCombo === 'hour'}
                                    onClick={() => SetOpenTimeCombo((CurrentCombo) => (
                                        CurrentCombo === 'hour' ? null : 'hour'
                                    ))}
                                    type="button"
                                >
                                    {Number(SelectedHour)}시
                                    <span aria-hidden="true">⌄</span>
                                </button>
                                {OpenTimeCombo === 'hour' && (
                                    <div className="TimeComboBox__list">
                                        {Array.from({ length: 24 }, (_, Hour) => String(Hour).padStart(2, '0'))
                                            .map((Hour) => (
                                                <button
                                                    className={Hour === SelectedHour ? 'TimeComboBox__option--selected' : undefined}
                                                    key={Hour}
                                                    onClick={() =>
                                                    {
                                                        UpdateTime(Hour, SelectedMinute);
                                                        SetOpenTimeCombo(null);
                                                    }}
                                                    type="button"
                                                >
                                                    {Number(Hour)}시
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className="TimeComboBox">
                                <button
                                    aria-expanded={OpenTimeCombo === 'minute'}
                                    onClick={() => SetOpenTimeCombo((CurrentCombo) => (
                                        CurrentCombo === 'minute' ? null : 'minute'
                                    ))}
                                    type="button"
                                >
                                    {Number(SelectedMinute)}분
                                    <span aria-hidden="true">⌄</span>
                                </button>
                                {OpenTimeCombo === 'minute' && (
                                    <div className="TimeComboBox__list">
                                        {Array.from({ length: 60 }, (_, Minute) => String(Minute).padStart(2, '0'))
                                            .map((Minute) => (
                                                <button
                                                    className={Minute === SelectedMinute ? 'TimeComboBox__option--selected' : undefined}
                                                    key={Minute}
                                                    onClick={() =>
                                                    {
                                                        UpdateTime(SelectedHour, Minute);
                                                        SetOpenTimeCombo(null);
                                                    }}
                                                    type="button"
                                                >
                                                    {Number(Minute)}분
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="PickerFooter">
                        <button
                            onClick={() =>
                            {
                                Properties.OnChange('');
                                SetIsOpen(false);
                            }}
                            type="button"
                        >
                            {Strings.PickerClear}
                        </button>
                        <button onClick={SelectToday} type="button">{Strings.PickerToday}</button>
                        {Properties.Type === 'datetime-local' && (
                            <button className="PickerFooter__apply" onClick={() => SetIsOpen(false)} type="button">
                                {Strings.PickerApply}
                            </button>
                        )}
                    </div>
                </div>
            ), document.body)}
        </div>
    );
}

export function EventEditorLayeredPanel(Properties: EventEditorLayeredPanelProps)
{
    const [IsHangulMode, SetIsHangulMode] = useState(false);
    const [AvailabilityNotice, SetAvailabilityNotice] = useState<{
        Id: number;
        Message: string;
    } | null>(null);
    const [RejectedKiosk, SetRejectedKiosk] = useState<{ Id: string; Token: number } | null>(null);
    const [IsShaking, SetIsShaking] = useState(false);
    const NoticeTimer = useRef<number | null>(null);
    const FeedbackSequence = useRef(0);
    const Controller = UseEventEditorLayeredPanelController(
        Properties.Record,
        Properties.OnComplete,
    );
    const KioskConflicts = useMemo(
        () => GetKioskScheduleConflicts(
            Controller.Draft,
            Properties.Records,
            Properties.Record?.Id ?? null,
        ),
        [Controller.Draft, Properties.Record?.Id, Properties.Records],
    );

    useEffect(() => () =>
    {
        if (NoticeTimer.current != null)
        {
            window.clearTimeout(NoticeTimer.current);
        }
    }, []);

    useEffect(() =>
    {
        const AvailableSelections = Controller.Draft.AssignedKioskIds.filter(
            (KioskId) => KioskConflicts.has(KioskId) === false,
        );

        if (AvailableSelections.length !== Controller.Draft.AssignedKioskIds.length)
        {
            Controller.UpdateField('AssignedKioskIds', AvailableSelections);
        }
    }, [Controller, KioskConflicts]);

    function FormatConflictDateRange(Conflict: KioskScheduleConflict): string
    {
        const [, StartMonth, StartDay] = Conflict.EventStartDate.split('-').map(Number);
        const [, EndMonth, EndDay] = Conflict.EventEndDate.split('-').map(Number);
        const StartLabel = `${StartMonth}월 ${StartDay}일`;
        const EndLabel = Conflict.EventStartDate === Conflict.EventEndDate
            ? ''
            : ` ~ ${EndMonth}월 ${EndDay}일`;

        return `${StartLabel}${EndLabel}`;
    }

    function ShowKioskConflict(KioskId: string, Conflict: KioskScheduleConflict): void
    {
        FeedbackSequence.current += 1;
        const FeedbackId = FeedbackSequence.current;
        const Message = `${Strings.KioskUnavailablePrefix} ${Conflict.EventLabel} (${FormatConflictDateRange(Conflict)}) ${Strings.KioskUnavailableBecause}`;

        SetAvailabilityNotice({ Id: FeedbackId, Message });
        SetRejectedKiosk({ Id: KioskId, Token: FeedbackId });
        SetIsShaking(false);
        window.requestAnimationFrame(() => SetIsShaking(true));

        if (NoticeTimer.current != null)
        {
            window.clearTimeout(NoticeTimer.current);
        }

        NoticeTimer.current = window.setTimeout(() =>
        {
            SetAvailabilityNotice(null);
            NoticeTimer.current = null;
        }, 3000);
    }

    function HandleSubmit(Event: FormEvent<HTMLFormElement>): void
    {
        Event.preventDefault();
        Controller.Submit();
    }

    function HandleEditorWheel(Event: ReactWheelEvent<HTMLElement>): void
    {
        const EventTarget = Event.target as HTMLElement;
        const TimeList = EventTarget.closest<HTMLElement>('.TimeComboBox__list');

        if (TimeList != null)
        {
            const CanScrollUp = Event.deltaY < 0 && TimeList.scrollTop > 0;
            const CanScrollDown = Event.deltaY > 0
                && TimeList.scrollTop + TimeList.clientHeight < TimeList.scrollHeight;

            if (CanScrollUp === true || CanScrollDown === true)
            {
                return;
            }
        }

        const ScrollContainer = Event.currentTarget.closest<HTMLElement>('.PanelLayer__content');

        if (ScrollContainer != null)
        {
            Event.preventDefault();
            ScrollContainer.scrollTop += Event.deltaY;
        }
    }

    return (
        <section
            aria-labelledby="EventEditorTitle"
            aria-modal="true"
            className={IsShaking
                ? 'LayeredDialog LayeredDialog--editor LayeredDialog--shake'
                : 'LayeredDialog LayeredDialog--editor'}
            data-ue-component="EventEditorLayeredPanel"
            data-ue-root="true"
            onWheel={HandleEditorWheel}
            role="dialog"
            onAnimationEnd={() => SetIsShaking(false)}
        >
            {AvailabilityNotice != null && (
                <div className="KioskAvailabilityNotice" key={AvailabilityNotice.Id} role="status">
                    {AvailabilityNotice.Message}
                </div>
            )}
            <header className="LayeredDialog__header">
                <div>
                    <h2 id="EventEditorTitle">
                        {Properties.Record == null ? Strings.NewEventTitle : Strings.EditEventTitle}
                    </h2>
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

            <form className="EventForm" onSubmit={HandleSubmit}>
                <div className="EventForm__grid">
                    <label className="FormField">
                        <span>{Strings.CompanyName}</span>
                        <HangulTextInput
                            autoFocus
                            IsHangulMode={IsHangulMode}
                            OnToggleMode={() => SetIsHangulMode((CurrentMode) => CurrentMode === false)}
                            OnValueChange={(Value) => Controller.UpdateField('CompanyName', Value)}
                            required
                            Value={Controller.Draft.CompanyName}
                        />
                    </label>
                    <label className="FormField">
                        <span>{Strings.EventName}</span>
                        <HangulTextInput
                            IsHangulMode={IsHangulMode}
                            OnToggleMode={() => SetIsHangulMode((CurrentMode) => CurrentMode === false)}
                            OnValueChange={(Value) => Controller.UpdateField('EventName', Value)}
                            required
                            Value={Controller.Draft.EventName}
                        />
                    </label>
                    <div className="FormField">
                        <span>{Strings.EventStartDate}</span>
                        <LocalizedPickerField
                            Label={Strings.EventStartDate}
                            OnChange={(Value) => Controller.UpdateField('EventStartDate', Value)}
                            Type="date"
                            Value={Controller.Draft.EventStartDate}
                        />
                    </div>
                    <div className="FormField">
                        <span>{Strings.EventEndDate}</span>
                        <LocalizedPickerField
                            Label={Strings.EventEndDate}
                            Minimum={Controller.Draft.EventStartDate}
                            OnChange={(Value) => Controller.UpdateField('EventEndDate', Value)}
                            Type="date"
                            Value={Controller.Draft.EventEndDate}
                        />
                    </div>
                    <div className="FormField">
                        <span>{Strings.InstallationDateTime}</span>
                        <LocalizedPickerField
                            Label={Strings.InstallationDateTime}
                            OnChange={(Value) => Controller.UpdateField('InstallationDateTime', Value)}
                            Type="datetime-local"
                            Value={Controller.Draft.InstallationDateTime}
                        />
                    </div>
                    <div className="FormField">
                        <span>{Strings.RecoveryDateTime}</span>
                        <LocalizedPickerField
                            Label={Strings.RecoveryDateTime}
                            Minimum={Controller.Draft.EventEndDate}
                            OnChange={(Value) => Controller.UpdateField('RecoveryDateTime', Value)}
                            Type="datetime-local"
                            Value={Controller.Draft.RecoveryDateTime}
                        />
                    </div>
                    <div className="FormField FormField--wide">
                        <span>
                            {Strings.AssignedKiosks}
                            <small>{Controller.Draft.AssignedKioskIds.length}{Strings.KioskCountUnit} {Strings.Selected}</small>
                        </span>
                        {Properties.Kiosks.length === 0 ? (
                            <div className="KioskSelectionEmpty">{Strings.NoManagedKiosksForSelection}</div>
                        ) : (
                            <div className="KioskSelectionGrid">
                                {Properties.Kiosks.map((Kiosk) =>
                                {
                                    const IsSelected = Controller.Draft.AssignedKioskIds.includes(Kiosk.Id);
                                    const Conflict = KioskConflicts.get(Kiosk.Id);
                                    const IsRejected = RejectedKiosk?.Id === Kiosk.Id;
                                    const ItemClasses = [
                                        'KioskSelectionItem',
                                        IsSelected ? 'KioskSelectionItem--selected' : '',
                                        Conflict != null ? 'KioskSelectionItem--unavailable' : '',
                                        IsRejected ? 'KioskSelectionItem--rejected' : '',
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <button
                                            aria-disabled={Conflict != null}
                                            aria-pressed={IsSelected}
                                            className={ItemClasses}
                                            key={`${Kiosk.Id}-${IsRejected ? RejectedKiosk.Token : 0}`}
                                            onClick={() =>
                                            {
                                                if (Conflict != null)
                                                {
                                                    ShowKioskConflict(Kiosk.Id, Conflict);
                                                    return;
                                                }

                                                Controller.UpdateField(
                                                    'AssignedKioskIds',
                                                    IsSelected
                                                        ? Controller.Draft.AssignedKioskIds.filter((Id) => Id !== Kiosk.Id)
                                                        : [...Controller.Draft.AssignedKioskIds, Kiosk.Id],
                                                );
                                            }}
                                            type="button"
                                        >
                                            <span>{Conflict != null ? '×' : IsSelected ? '✓' : '+'}</span>
                                            <strong title={Kiosk.Name}>{Kiosk.Name}</strong>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <fieldset className="CheckGroup">
                    <legend>{Strings.Status}</legend>
                    {([
                        ['ContractCompleted', Strings.ContractCompleted],
                        ['DepositPaid', Strings.DepositPaid],
                        ['BalancePaid', Strings.BalancePaid],
                    ] as const).map(([Field, Label]) => (
                        <label className="CheckField" key={Field}>
                            <input
                                checked={Controller.Draft[Field]}
                                onChange={(Event) => Controller.UpdateField(Field, Event.target.checked)}
                                type="checkbox"
                            />
                            <span>{Label}</span>
                        </label>
                    ))}
                </fieldset>

                <label className="FormField">
                    <span>{Strings.Notes}</span>
                    <HangulTextArea
                        IsHangulMode={IsHangulMode}
                        OnToggleMode={() => SetIsHangulMode((CurrentMode) => CurrentMode === false)}
                        OnValueChange={(Value) => Controller.UpdateField('Notes', Value)}
                        rows={3}
                        Value={Controller.Draft.Notes}
                    />
                </label>

                {Controller.ErrorMessage != null && (
                    <p className="FormError" role="alert">{Controller.ErrorMessage}</p>
                )}

                <footer className="LayeredDialog__footer">
                    <button className="Button Button--secondary" onClick={Properties.OnRequestClose} type="button">
                        {Strings.Cancel}
                    </button>
                    <button className="Button Button--primary" type="submit">
                        {Strings.Save}
                    </button>
                </footer>
            </form>
        </section>
    );
}
