import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import type { EventRecordWithStatus } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface EventDetailsLayeredPanelProps
{
    Record: EventRecordWithStatus;
    Kiosks: ManagedKiosk[];
    OnRequestClose: () => void;
}
