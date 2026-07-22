import { useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import type { SelectedBackupFile } from '@/core/infra/backup/BackupTypes';

export interface KioskSettingsLayeredPanelControllerModel
{
    Name: string;
    ErrorMessage: string | null;
    BackupFile: SelectedBackupFile | null;
    BackupMessage: string | null;
    IsSelectingBackup: boolean;
    IsRestoringBackup: boolean;
    IsRestoreConfirmationPending: boolean;
    SetName: (Name: string) => void;
    Submit: () => void;
    SelectBackup: () => Promise<void>;
    RestoreBackup: () => Promise<void>;
}

export function UseKioskSettingsLayeredPanelController(
    OnAddKiosk: (Name: string) => boolean,
    OnSelectBackupFile: () => Promise<SelectedBackupFile | null>,
    OnRestoreBackup: (BackupFile: SelectedBackupFile) => Promise<boolean>,
): KioskSettingsLayeredPanelControllerModel
{
    const [Name, SetNameValue] = useState('');
    const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);
    const [BackupFile, SetBackupFile] = useState<SelectedBackupFile | null>(null);
    const [BackupMessage, SetBackupMessage] = useState<string | null>(null);
    const [IsSelectingBackup, SetIsSelectingBackup] = useState(false);
    const [IsRestoringBackup, SetIsRestoringBackup] = useState(false);
    const [IsRestoreConfirmationPending, SetIsRestoreConfirmationPending] = useState(false);

    function SetName(NextName: string): void
    {
        SetNameValue(NextName);
        SetErrorMessage(null);
    }

    async function SelectBackup(): Promise<void>
    {
        SetIsSelectingBackup(true);
        SetBackupMessage(null);
        SetIsRestoreConfirmationPending(false);
        const SelectedFile = await OnSelectBackupFile();
        SetIsSelectingBackup(false);
        if (SelectedFile != null)
        {
            SetBackupFile(SelectedFile);
        }
    }

    async function RestoreBackup(): Promise<void>
    {
        if (BackupFile == null)
        {
            return;
        }
        if (IsRestoreConfirmationPending === false)
        {
            SetIsRestoreConfirmationPending(true);
            SetBackupMessage(Strings.BackupRestoreWarning);
            return;
        }

        SetIsRestoringBackup(true);
        const DidRestore = await OnRestoreBackup(BackupFile);
        SetIsRestoringBackup(false);
        SetIsRestoreConfirmationPending(false);
        SetBackupMessage(DidRestore === true
            ? Strings.BackupRestoreCompleted
            : Strings.BackupRestoreFailed);
    }

    function Submit(): void
    {
        if (Name.trim() === '')
        {
            SetErrorMessage(Strings.ManagedKioskRequiredError);
            return;
        }

        if (OnAddKiosk(Name) === false)
        {
            SetErrorMessage(Strings.DuplicateManagedKioskError);
            return;
        }

        SetNameValue('');
        SetErrorMessage(null);
    }

    return {
        Name,
        ErrorMessage,
        BackupFile,
        BackupMessage,
        IsSelectingBackup,
        IsRestoringBackup,
        IsRestoreConfirmationPending,
        SetName,
        Submit,
        SelectBackup,
        RestoreBackup,
    };
}
