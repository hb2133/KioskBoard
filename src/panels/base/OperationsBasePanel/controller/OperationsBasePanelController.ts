import { useEffect, useMemo, useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import { LoadEventRecordsAction } from './actions/LoadEventRecordsAction';
import { LoadManagedKiosksAction } from './actions/LoadManagedKiosksAction';
import { SaveEventRecordsAction } from './actions/SaveEventRecordsAction';
import { SaveManagedKiosksAction } from './actions/SaveManagedKiosksAction';
import {
    AddOperationalStatus,
    BuildCalendarDays,
    GetLocalDateKey,
    GetMonthKey,
    GetOperationsSummary,
    ShiftMonth,
} from './OperationsBasePanelState';
import type {
    CalendarDay,
    EventCompletionField,
    EventRecord,
    EventRecordDraft,
    EventRecordWithStatus,
    EventStatusFilter,
    OperationsLayeredPanel,
    OperationsSummary,
    OperationsView,
} from './OperationsBasePanelTypes';

const OperationsViewOrder: OperationsView[] = ['ledger', 'calendar', 'completed'];

export interface OperationsBasePanelControllerModel
{
    Records: EventRecordWithStatus[];
    FilteredRecords: EventRecordWithStatus[];
    CompletedRecords: EventRecordWithStatus[];
    Summary: OperationsSummary;
    CurrentView: OperationsView;
    StatusFilter: EventStatusFilter;
    CalendarMonth: string;
    CalendarDays: CalendarDay[];
    TodayKey: string;
    IsReady: boolean;
    StorageError: string | null;
    LayeredPanel: OperationsLayeredPanel | null;
    ManagedKiosks: ManagedKiosk[];
    SetCurrentView: (View: OperationsView) => void;
    SetStatusFilter: (Filter: EventStatusFilter) => void;
    MoveCalendarMonth: (Offset: number) => void;
    MoveCalendarToToday: () => void;
    OpenCreateEvent: () => void;
    OpenEditEvent: (Record: EventRecord) => void;
    OpenDeleteEvent: (Record: EventRecord) => void;
    OpenEventDetails: (RecordId: string) => void;
    OpenKioskSettings: () => void;
    CloseLayeredPanel: () => void;
    SaveEvent: (Draft: EventRecordDraft) => void;
    DeleteEvent: () => void;
    ToggleEventCompletion: (RecordId: string, Field: EventCompletionField) => void;
    AddManagedKiosk: (Name: string) => boolean;
    DeleteManagedKiosk: (KioskId: string) => void;
}

export function UseOperationsBasePanelController(): OperationsBasePanelControllerModel
{
    const InitialToday = GetLocalDateKey(new Date());
    const [Records, SetRecords] = useState<EventRecord[]>([]);
    const [TodayKey, SetTodayKey] = useState(InitialToday);
    const [CurrentView, SetCurrentView] = useState<OperationsView>('ledger');
    const [StatusFilter, SetStatusFilter] = useState<EventStatusFilter>('all');
    const [CalendarMonth, SetCalendarMonth] = useState(GetMonthKey(new Date()));
    const [IsReady, SetIsReady] = useState(false);
    const [StorageError, SetStorageError] = useState<string | null>(null);
    const [LayeredPanel, SetLayeredPanel] = useState<OperationsLayeredPanel | null>(null);
    const [ManagedKiosks, SetManagedKiosks] = useState<ManagedKiosk[]>([]);

    useEffect(() =>
    {
        try
        {
            SetRecords(LoadEventRecordsAction());
            SetManagedKiosks(LoadManagedKiosksAction());
        }
        catch
        {
            SetStorageError(Strings.StorageError);
        }
        finally
        {
            SetIsReady(true);
        }
    }, []);

    useEffect(() =>
    {
        const Timer = window.setInterval(() =>
        {
            SetTodayKey(GetLocalDateKey(new Date()));
        }, 60_000);

        return () => window.clearInterval(Timer);
    }, []);

    useEffect(() =>
    {
        function HandleViewShortcut(Event: KeyboardEvent): void
        {
            if (
                LayeredPanel != null
                || Event.key !== 'Tab'
                || Event.shiftKey === true
                || Event.ctrlKey === true
                || Event.metaKey === true
                || Event.altKey === true
            )
            {
                return;
            }

            Event.preventDefault();
            SetCurrentView((CurrentValue) =>
            {
                const CurrentIndex = OperationsViewOrder.indexOf(CurrentValue);
                const NextIndex = (CurrentIndex + 1) % OperationsViewOrder.length;

                return OperationsViewOrder[NextIndex];
            });
        }

        document.addEventListener('keydown', HandleViewShortcut);
        return () => document.removeEventListener('keydown', HandleViewShortcut);
    }, [LayeredPanel]);

    const RecordsWithStatus = useMemo(
        () => AddOperationalStatus(Records, TodayKey),
        [Records, TodayKey],
    );
    const FilteredRecords = useMemo(
        () => RecordsWithStatus.filter((Record) => (
            StatusFilter === 'all' || Record.OperationalStatus === StatusFilter
        )),
        [RecordsWithStatus, StatusFilter],
    );
    const CompletedRecords = useMemo(
        () => RecordsWithStatus.filter((Record) => Record.OperationalStatus === 'completed'),
        [RecordsWithStatus],
    );
    const Summary = useMemo(
        () => GetOperationsSummary(RecordsWithStatus),
        [RecordsWithStatus],
    );
    const CalendarDays = useMemo(
        () => BuildCalendarDays(RecordsWithStatus, CalendarMonth, TodayKey),
        [RecordsWithStatus, CalendarMonth, TodayKey],
    );

    function PersistRecords(NextRecords: EventRecord[]): boolean
    {
        try
        {
            SaveEventRecordsAction(NextRecords);
            SetRecords(NextRecords);
            SetStorageError(null);
            return true;
        }
        catch
        {
            SetStorageError(Strings.StorageError);
            return false;
        }
    }

    function MoveCalendarMonth(Offset: number): void
    {
        SetCalendarMonth((CurrentMonth) => ShiftMonth(CurrentMonth, Offset));
    }

    function OpenCreateEvent(): void
    {
        SetLayeredPanel({
            Kind: 'event-editor',
            Record: null,
        });
    }

    function OpenEditEvent(Record: EventRecord): void
    {
        SetLayeredPanel({
            Kind: 'event-editor',
            Record,
        });
    }

    function OpenDeleteEvent(Record: EventRecord): void
    {
        SetLayeredPanel({
            Kind: 'delete-confirm',
            RecordId: Record.Id,
            RecordLabel: `${Record.CompanyName} · ${Record.EventName}`,
        });
    }

    function OpenEventDetails(RecordId: string): void
    {
        const Record = RecordsWithStatus.find((Candidate) => Candidate.Id === RecordId);

        if (Record == null)
        {
            return;
        }

        SetLayeredPanel({
            Kind: 'event-details',
            Record,
        });
    }

    function PersistManagedKiosks(NextKiosks: ManagedKiosk[]): boolean
    {
        try
        {
            SaveManagedKiosksAction(NextKiosks);
            SetManagedKiosks(NextKiosks);
            SetStorageError(null);
            return true;
        }
        catch
        {
            SetStorageError(Strings.StorageError);
            return false;
        }
    }

    function AddManagedKiosk(Name: string): boolean
    {
        const NormalizedName = Name.trim();

        if (ManagedKiosks.some((Kiosk) => Kiosk.Name.toLocaleLowerCase() === NormalizedName.toLocaleLowerCase()))
        {
            return false;
        }

        return PersistManagedKiosks([
            ...ManagedKiosks,
            {
                Id: globalThis.crypto.randomUUID(),
                Name: NormalizedName,
                CreatedAt: new Date().toISOString(),
            },
        ]);
    }

    function SaveEvent(Draft: EventRecordDraft): void
    {
        const CurrentTime = new Date().toISOString();
        const EditingRecord = LayeredPanel?.Kind === 'event-editor'
            ? LayeredPanel.Record
            : null;
        const SavedRecord: EventRecord = EditingRecord == null
            ? {
                ...Draft,
                Id: globalThis.crypto.randomUUID(),
                CreatedAt: CurrentTime,
                UpdatedAt: CurrentTime,
            }
            : {
                ...EditingRecord,
                ...Draft,
                UpdatedAt: CurrentTime,
            };
        const NextRecords = EditingRecord == null
            ? [...Records, SavedRecord]
            : Records.map((Record) => Record.Id === SavedRecord.Id ? SavedRecord : Record);

        if (PersistRecords(NextRecords) === true)
        {
            SetLayeredPanel(null);
        }
    }

    function DeleteEvent(): void
    {
        if (LayeredPanel?.Kind !== 'delete-confirm')
        {
            return;
        }

        const NextRecords = Records.filter((Record) => Record.Id !== LayeredPanel.RecordId);

        if (PersistRecords(NextRecords) === true)
        {
            SetLayeredPanel(null);
        }
    }

    function ToggleEventCompletion(RecordId: string, Field: EventCompletionField): void
    {
        const CurrentTime = new Date().toISOString();
        const NextRecords = Records.map((Record) => Record.Id === RecordId
            ? {
                ...Record,
                [Field]: !Record[Field],
                UpdatedAt: CurrentTime,
            }
            : Record);

        PersistRecords(NextRecords);
    }

    return {
        Records: RecordsWithStatus,
        FilteredRecords,
        CompletedRecords,
        Summary,
        CurrentView,
        StatusFilter,
        CalendarMonth,
        CalendarDays,
        TodayKey,
        IsReady,
        StorageError,
        LayeredPanel,
        ManagedKiosks,
        SetCurrentView,
        SetStatusFilter,
        MoveCalendarMonth,
        MoveCalendarToToday: () => SetCalendarMonth(GetMonthKey(new Date())),
        OpenCreateEvent,
        OpenEditEvent,
        OpenDeleteEvent,
        OpenEventDetails,
        OpenKioskSettings: () => SetLayeredPanel({ Kind: 'kiosk-settings' }),
        CloseLayeredPanel: () => SetLayeredPanel(null),
        SaveEvent,
        DeleteEvent,
        ToggleEventCompletion,
        AddManagedKiosk,
        DeleteManagedKiosk: (KioskId) => PersistManagedKiosks(
            ManagedKiosks.filter((Kiosk) => Kiosk.Id !== KioskId),
        ),
    };
}
