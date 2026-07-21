import { SaveLocalStorageJson } from '@/core/infra/local_storage/LocalStorageJsonStore';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';
import { ManagedKiosksStorageKey } from './LoadManagedKiosksAction';

export function SaveManagedKiosksAction(Kiosks: ManagedKiosk[]): void
{
    SaveLocalStorageJson(ManagedKiosksStorageKey, Kiosks);
}
