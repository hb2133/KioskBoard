const MaximumBackupFileSize = 10 * 1024 * 1024;

interface BackupFileCandidate
{
    Version?: unknown;
    SavedAt?: unknown;
    Records?: unknown;
    Kiosks?: unknown;
}

async function SelectBackupFile(): ReturnType<WorkbenchBridgeApi['SelectBackupFile']>
{
    const File = await SelectJsonFile();
    if (File == null)
    {
        return null;
    }
    if (File.size > MaximumBackupFileSize)
    {
        throw new Error('Backup file is too large.');
    }

    const Snapshot = JSON.parse(await File.text()) as BackupFileCandidate;
    if (
        Snapshot.Version !== 1
        || typeof Snapshot.SavedAt !== 'string'
        || Array.isArray(Snapshot.Records) === false
        || Array.isArray(Snapshot.Kiosks) === false
    )
    {
        throw new Error('올바른 KioskBoard 백업 파일이 아닙니다.');
    }

    return {
        Path: File.name,
        SavedAt: Snapshot.SavedAt,
        RecordCount: Snapshot.Records.length,
        KioskCount: Snapshot.Kiosks.length,
        Snapshot: {
            Records: Snapshot.Records,
            Kiosks: Snapshot.Kiosks,
        },
    };
}

function SelectJsonFile(): Promise<File | null>
{
    return new Promise((Resolve) =>
    {
        const Input = document.createElement('input');
        let DidFinish = false;

        function Finish(FileValue: File | null): void
        {
            if (DidFinish === true)
            {
                return;
            }

            DidFinish = true;
            Input.remove();
            Resolve(FileValue);
        }

        Input.type = 'file';
        Input.accept = 'application/json,.json';
        Input.hidden = true;
        Input.addEventListener('change', () => Finish(Input.files?.[0] ?? null), { once: true });
        Input.addEventListener('cancel', () => Finish(null), { once: true });
        document.body.append(Input);
        Input.click();
    });
}

export function InstallWebWorkbenchBridge(): void
{
    window.WorkbenchBridge = {
        SetWindowTheme: () => undefined,
        SaveLatestBackup: () => Promise.resolve(),
        SelectBackupFile,
    };
}
