import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import type { SelectedBackupFile } from '@/core/infra/backup/BackupTypes';

export interface KioskSettingsLayeredPanelProps
{
    Kiosks: ManagedKiosk[];
    OnAddKiosk: (Name: string) => boolean;
    OnDeleteKiosk: (KioskId: string) => void;
    OnSelectBackupFile: () => Promise<SelectedBackupFile | null>;
    OnRestoreBackup: (BackupFile: SelectedBackupFile) => Promise<boolean>;
    OnRequestClose: () => void;
}
