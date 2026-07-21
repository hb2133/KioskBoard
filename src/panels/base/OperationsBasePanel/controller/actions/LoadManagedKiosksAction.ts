import { LoadLocalStorageJson } from '@/core/infra/local_storage/LocalStorageJsonStore';
import type { ManagedKiosk } from '@/core/models/ManagedKiosk';

const ManagedKiosksStorageKey = 'kioskboard.managed-kiosks.v1';

function IsManagedKiosk(Value: unknown): Value is ManagedKiosk
{
    if (typeof Value !== 'object' || Value == null)
    {
        return false;
    }

    const Candidate = Value as Partial<ManagedKiosk>;

    return typeof Candidate.Id === 'string'
        && typeof Candidate.Name === 'string'
        && typeof Candidate.CreatedAt === 'string';
}

export function LoadManagedKiosksAction(): ManagedKiosk[]
{
    const StoredValue = LoadLocalStorageJson(ManagedKiosksStorageKey);

    if (Array.isArray(StoredValue) === false)
    {
        return [];
    }

    return StoredValue.filter(IsManagedKiosk);
}

export { ManagedKiosksStorageKey };
