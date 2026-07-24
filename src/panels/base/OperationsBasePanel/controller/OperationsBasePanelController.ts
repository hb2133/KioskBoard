import { useEffect, useMemo, useRef, useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import type { KoreanHoliday } from '@/core/models/KoreanHoliday';
import type { SelectedBackupFile } from '@/core/infra/backup/BackupTypes';
import { LoadKoreanHolidays } from '@/core/infra/holidays/KoreanHolidayRepository';
import {
    DeleteSharedEvent,
    DeleteSharedKiosk,
    LoadSharedOperationsSnapshot,
    ReplaceSharedOperationsSnapshot,
    SeedSharedOperationsSnapshot,
    SubscribeToSharedOperations,
    UpsertSharedEvent,
    UpsertSharedKiosk,
} from '@/core/infra/supabase/SharedOperationsRepository';
import { GetSupabaseClient } from '@/core/infra/supabase/SupabaseClient';
import { LoadEventRecordsAction, NormalizeEventRecord } from './actions/LoadEventRecordsAction';
import { LoadManagedKiosksAction } from './actions/LoadManagedKiosksAction';
import { SaveEventRecordsAction } from './actions/SaveEventRecordsAction';
import { SaveManagedKiosksAction } from './actions/SaveManagedKiosksAction';
import { SaveLatestBackupAction } from './actions/SaveLatestBackupAction';
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
const InitialLoadRetryDelayMilliseconds = 500;

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
    CalendarHolidays: KoreanHoliday[];
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
    SelectBackupFile: () => Promise<SelectedBackupFile | null>;
    RestoreBackup: (BackupFile: SelectedBackupFile) => Promise<boolean>;
}

export function UseOperationsBasePanelController(): OperationsBasePanelControllerModel
{
    const InitialToday = GetLocalDateKey(new Date());
    const [Records, SetRecords] = useState<EventRecord[]>([]);
    const [TodayKey, SetTodayKey] = useState(InitialToday);
    const [CurrentView, SetCurrentView] = useState<OperationsView>('ledger');
    const [StatusFilter, SetStatusFilter] = useState<EventStatusFilter>('upcoming');
    const [CalendarMonth, SetCalendarMonth] = useState(GetMonthKey(new Date()));
    const [CalendarHolidays, SetCalendarHolidays] = useState<KoreanHoliday[]>([]);
    const [IsReady, SetIsReady] = useState(false);
    const [StorageError, SetStorageError] = useState<string | null>(null);
    const [LayeredPanel, SetLayeredPanel] = useState<OperationsLayeredPanel | null>(null);
    const [ManagedKiosks, SetManagedKiosks] = useState<ManagedKiosk[]>([]);
    const IsRestoringBackup = useRef(false);

    useEffect(() =>
    {
        let IsMounted = true;
        let IsSynchronizing = false;
        let HasCheckedInitialMigration = false;
        let HasCompletedInitialLoad = false;
        const LocalRecords = LoadEventRecordsAction();
        const LocalKiosks = LoadManagedKiosksAction();

        async function LoadSnapshotWithInitialRetry()
        {
            try
            {
                return await LoadSharedOperationsSnapshot();
            }
            catch (ErrorValue)
            {
                if (HasCompletedInitialLoad === true)
                {
                    throw ErrorValue;
                }

                await new Promise((Resolve) =>
                    window.setTimeout(Resolve, InitialLoadRetryDelayMilliseconds));
                return LoadSharedOperationsSnapshot();
            }
        }

        async function ApplySharedSnapshot(): Promise<void>
        {
            if (IsSynchronizing === true || IsRestoringBackup.current === true)
            {
                return;
            }

            IsSynchronizing = true;
            try
            {
                let Snapshot = await LoadSnapshotWithInitialRetry();
                const ShouldMigrateLocalSnapshot = HasCheckedInitialMigration === false
                    && Snapshot.Records.length === 0
                    && Snapshot.Kiosks.length === 0
                    && (LocalRecords.length > 0 || LocalKiosks.length > 0);

                HasCheckedInitialMigration = true;
                if (ShouldMigrateLocalSnapshot === true)
                {
                    await SeedSharedOperationsSnapshot({ Records: LocalRecords, Kiosks: LocalKiosks });
                    Snapshot = await LoadSharedOperationsSnapshot();
                    if (
                        Snapshot.Records.length < LocalRecords.length
                        || Snapshot.Kiosks.length < LocalKiosks.length
                    )
                    {
                        throw new Error('Shared migration did not copy every local record.');
                    }
                }

                if (IsMounted === true)
                {
                    SetRecords(Snapshot.Records);
                    SetManagedKiosks(Snapshot.Kiosks);
                    SaveEventRecordsAction(Snapshot.Records);
                    SaveManagedKiosksAction(Snapshot.Kiosks);
                    void SaveLatestBackupAction(Snapshot).catch(() => SetStorageError(Strings.StorageError));
                    SetStorageError(null);
                }
            }
            catch
            {
                if (IsMounted === true)
                {
                    SetRecords(LocalRecords);
                    SetManagedKiosks(LocalKiosks);
                    SetStorageError(Strings.SharedStorageError);
                }
            }
            finally
            {
                HasCompletedInitialLoad = true;
                IsSynchronizing = false;
                if (IsMounted === true) SetIsReady(true);
            }
        }

        void ApplySharedSnapshot();
        const Channel = SubscribeToSharedOperations(() => void ApplySharedSnapshot());

        return () =>
        {
            IsMounted = false;
            const Client = GetSupabaseClient();
            if (Client != null) void Client.removeChannel(Channel);
        };
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
        let IsCurrent = true;
        const [Year, Month] = CalendarMonth.split('-').map(Number);
        const Years = Month === 1
            ? [Year - 1, Year]
            : Month === 12
                ? [Year, Year + 1]
                : [Year];

        void LoadKoreanHolidays(Years).then((Holidays) =>
        {
            if (IsCurrent === true)
            {
                SetCalendarHolidays(Holidays);
            }
        });

        return () =>
        {
            IsCurrent = false;
        };
    }, [CalendarMonth]);

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
            Record.OperationalStatus !== 'completed'
            && (StatusFilter === 'upcoming' || Record.OperationalStatus === StatusFilter)
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
            void SaveLatestBackupAction({ Records: NextRecords, Kiosks: ManagedKiosks })
                .catch(() => SetStorageError(Strings.StorageError));
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
            void SaveLatestBackupAction({ Records, Kiosks: NextKiosks })
                .catch(() => SetStorageError(Strings.StorageError));
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

        const Kiosk: ManagedKiosk = {
            Id: globalThis.crypto.randomUUID(),
            Name: NormalizedName,
            CreatedAt: new Date().toISOString(),
        };
        const DidPersist = PersistManagedKiosks([
            ...ManagedKiosks,
            Kiosk,
        ]);
        if (DidPersist === true)
        {
            void UpsertSharedKiosk(Kiosk).catch(() => SetStorageError(Strings.SharedStorageError));
        }
        return DidPersist;
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
            void UpsertSharedEvent(SavedRecord).catch(() => SetStorageError(Strings.SharedStorageError));
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
            void DeleteSharedEvent(LayeredPanel.RecordId).catch(() => SetStorageError(Strings.SharedStorageError));
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

        if (PersistRecords(NextRecords) === true)
        {
            const ChangedRecord = NextRecords.find((Record) => Record.Id === RecordId);
            if (ChangedRecord != null)
            {
                void UpsertSharedEvent(ChangedRecord).catch(() => SetStorageError(Strings.SharedStorageError));
            }
        }
    }

    async function SelectBackupFile(): Promise<SelectedBackupFile | null>
    {
        try
        {
            return await window.WorkbenchBridge.SelectBackupFile();
        }
        catch
        {
            SetStorageError('백업 파일을 읽지 못했습니다.');
            return null;
        }
    }

    async function RestoreBackup(BackupFile: SelectedBackupFile): Promise<boolean>
    {
        const Snapshot = BackupFile.Snapshot as {
            Records?: unknown[];
            Kiosks?: ManagedKiosk[];
        };
        if (Array.isArray(Snapshot.Records) === false || Array.isArray(Snapshot.Kiosks) === false)
        {
            SetStorageError('올바른 KioskBoard 백업 파일이 아닙니다.');
            return false;
        }

        const NormalizedRecords = Snapshot.Records
            .map(NormalizeEventRecord)
            .filter((Record): Record is EventRecord => Record != null);
        if (NormalizedRecords.length !== Snapshot.Records.length)
        {
            SetStorageError('백업 파일에 올바르지 않은 행사 정보가 있습니다.');
            return false;
        }

        IsRestoringBackup.current = true;
        try
        {
            await ReplaceSharedOperationsSnapshot({
                Records: NormalizedRecords,
                Kiosks: Snapshot.Kiosks,
            });
            const RestoredSnapshot = await LoadSharedOperationsSnapshot();
            SaveEventRecordsAction(RestoredSnapshot.Records);
            SaveManagedKiosksAction(RestoredSnapshot.Kiosks);
            await SaveLatestBackupAction(RestoredSnapshot);
            SetRecords(RestoredSnapshot.Records);
            SetManagedKiosks(RestoredSnapshot.Kiosks);
            SetStorageError(null);
            return true;
        }
        catch
        {
            SetStorageError('백업 복구에 실패했습니다. 기존 서버 데이터는 복원되었습니다.');
            return false;
        }
        finally
        {
            IsRestoringBackup.current = false;
        }
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
        CalendarHolidays,
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
        DeleteManagedKiosk: (KioskId) =>
        {
            if (PersistManagedKiosks(ManagedKiosks.filter((Kiosk) => Kiosk.Id !== KioskId)) === true)
            {
                void DeleteSharedKiosk(KioskId).catch(() => SetStorageError(Strings.SharedStorageError));
            }
        },
        SelectBackupFile,
        RestoreBackup,
    };
}
