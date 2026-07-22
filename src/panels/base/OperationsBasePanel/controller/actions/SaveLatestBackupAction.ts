import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import type { EventRecord } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface LatestBackupSnapshot
{
    Records: EventRecord[];
    Kiosks: ManagedKiosk[];
}

export async function SaveLatestBackupAction(Snapshot: LatestBackupSnapshot): Promise<void>
{
    await window.WorkbenchBridge.SaveLatestBackup(Snapshot);
}
