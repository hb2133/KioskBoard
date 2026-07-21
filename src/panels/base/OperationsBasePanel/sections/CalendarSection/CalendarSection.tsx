import { Strings } from '@/core/localization/Strings';
import type {
    CalendarDay,
    EventOperationalStatus,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface CalendarSectionProps
{
    MonthKey: string;
    Days: CalendarDay[];
    OnMoveMonth: (Offset: number) => void;
    OnMoveToToday: () => void;
    OnOpenEvent: (RecordId: string) => void;
}

interface CalendarEventSegment
{
    Id: string;
    Label: string;
    OperationalStatus: EventOperationalStatus;
    IsStart: boolean;
    StartPosition: number;
    EndPosition: number;
    Track: number;
}

function BuildWeekSegments(Days: CalendarDay[]): CalendarEventSegment[]
{
    const SegmentMap = new Map<string, Omit<CalendarEventSegment, 'Track'>>();

    Days.forEach((Day, DayIndex) =>
    {
        Day.Events.forEach((CalendarEvent) =>
        {
            const ExistingSegment = SegmentMap.get(CalendarEvent.Id);

            if (ExistingSegment == null)
            {
                SegmentMap.set(CalendarEvent.Id, {
                    Id: CalendarEvent.Id,
                    Label: CalendarEvent.Label,
                    OperationalStatus: CalendarEvent.OperationalStatus,
                    IsStart: CalendarEvent.IsStart,
                    StartPosition: DayIndex + CalendarEvent.StartMinute / 1440,
                    EndPosition: DayIndex + CalendarEvent.EndMinute / 1440,
                });
            }
            else
            {
                ExistingSegment.EndPosition = DayIndex + CalendarEvent.EndMinute / 1440;
            }
        });
    });

    const TrackEndColumns: number[] = [];

    return Array.from(SegmentMap.values())
        .sort((Left, Right) => Left.StartPosition - Right.StartPosition)
        .map((Segment) =>
        {
            let Track = TrackEndColumns.findIndex((EndPosition) => EndPosition <= Segment.StartPosition);

            if (Track === -1)
            {
                Track = TrackEndColumns.length;
                TrackEndColumns.push(Segment.EndPosition);
            }
            else
            {
                TrackEndColumns[Track] = Segment.EndPosition;
            }

            return {
                Id: Segment.Id,
                Label: Segment.Label,
                OperationalStatus: Segment.OperationalStatus,
                IsStart: Segment.IsStart,
                StartPosition: Segment.StartPosition,
                EndPosition: Segment.EndPosition,
                Track,
            };
        });
}

export function CalendarSection(Properties: CalendarSectionProps)
{
    const [Year, Month] = Properties.MonthKey.split('-').map(Number);
    const MonthLabel = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
    }).format(new Date(Year, Month - 1, 1));
    const Weeks = Array.from({ length: 6 }, (_, WeekIndex) =>
    {
        const Days = Properties.Days.slice(WeekIndex * 7, WeekIndex * 7 + 7);

        return {
            Days,
            Segments: BuildWeekSegments(Days),
        };
    });

    return (
        <section
            className="ContentSection CalendarSection"
            data-ue-component="CalendarSection"
            data-ue-root="true"
        >
            <div className="ContentSection__toolbar CalendarToolbar">
                <div>
                    <h2>{Strings.ViewCalendar}</h2>
                    <p>{MonthLabel}</p>
                </div>
                <div className="CalendarToolbar__actions">
                    <button aria-label={Strings.PreviousMonth} onClick={() => Properties.OnMoveMonth(-1)} type="button">‹</button>
                    <button onClick={Properties.OnMoveToToday} type="button">{Strings.CalendarToday}</button>
                    <button aria-label={Strings.NextMonth} onClick={() => Properties.OnMoveMonth(1)} type="button">›</button>
                </div>
            </div>
            <div className="CalendarGrid CalendarGrid--weekdays">
                {Strings.Weekdays.map((Weekday) => <div key={Weekday}>{Weekday}</div>)}
            </div>
            <div className="CalendarWeeks">
                {Weeks.map((Week, WeekIndex) =>
                {
                    const TrackCount = Week.Segments.reduce(
                        (Maximum, Segment) => Math.max(Maximum, Segment.Track + 1),
                        0,
                    );
                    const WeekHeight = Math.max(104, 42 + TrackCount * 25);

                    return (
                        <div className="CalendarWeek" key={Week.Days[0]?.DateKey} style={{ minHeight: WeekHeight }}>
                            <div className="CalendarWeek__days">
                                {Week.Days.map((Day) => (
                                    <div
                                        className={[
                                            'CalendarDay',
                                            Day.IsCurrentMonth ? '' : 'CalendarDay--muted',
                                            Day.IsToday ? 'CalendarDay--today' : '',
                                        ].filter(Boolean).join(' ')}
                                        key={Day.DateKey}
                                    >
                                        <span className="CalendarDay__number">{Day.DayNumber}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="CalendarWeek__events">
                                {Week.Segments.map((Segment) => (
                                    <button
                                        className={[
                                            'CalendarEvent',
                                            `CalendarEvent--${Segment.OperationalStatus}`,
                                            Segment.IsStart ? '' : 'CalendarEvent--continued',
                                        ].filter(Boolean).join(' ')}
                                        key={`${WeekIndex}-${Segment.Id}`}
                                        onClick={() => Properties.OnOpenEvent(Segment.Id)}
                                        style={{
                                            left: `calc(${Segment.StartPosition / 7 * 100}% + 2px)`,
                                            top: Segment.Track * 25,
                                            width: `calc(${(Segment.EndPosition - Segment.StartPosition) / 7 * 100}% - 4px)`,
                                        }}
                                        title={Segment.Label}
                                        type="button"
                                    >
                                        {Segment.Label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
