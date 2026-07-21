import type { ManagedKiosk } from '@/core/models/ManagedKiosk';

export interface KioskSettingsLayeredPanelProps
{
    Kiosks: ManagedKiosk[];
    OnAddKiosk: (Name: string) => boolean;
    OnDeleteKiosk: (KioskId: string) => void;
    OnRequestClose: () => void;
}
