import type {
    EventRecord,
    EventRecordDraft,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';

export interface EventEditorLayeredPanelProps
{
    Record: EventRecord | null;
    Records: EventRecord[];
    Kiosks: ManagedKiosk[];
    OnComplete: (Draft: EventRecordDraft) => void;
    OnRequestClose: () => void;
}
