export function LoadLocalStorageJson(StorageKey: string): unknown
{
    const StoredValue = window.localStorage.getItem(StorageKey);

    if (StoredValue == null)
    {
        return null;
    }

    return JSON.parse(StoredValue) as unknown;
}

export function SaveLocalStorageJson(StorageKey: string, Value: unknown): void
{
    window.localStorage.setItem(StorageKey, JSON.stringify(Value));
}
