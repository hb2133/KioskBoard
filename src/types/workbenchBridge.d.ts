interface WorkbenchBridgeApi
{
    SetWindowTheme: (Theme: 'light' | 'dark') => void;
    SaveLatestBackup: (Snapshot: unknown) => Promise<void>;
    SelectBackupFile: () => Promise<{
        Path: string;
        SavedAt: string;
        RecordCount: number;
        KioskCount: number;
        Snapshot: unknown;
    } | null>;
}

interface Window
{
    WorkbenchBridge: WorkbenchBridgeApi;
}
