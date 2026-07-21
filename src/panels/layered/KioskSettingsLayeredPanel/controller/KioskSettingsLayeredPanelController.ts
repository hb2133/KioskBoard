import { useState } from 'react';
import { Strings } from '@/core/localization/Strings';

export interface KioskSettingsLayeredPanelControllerModel
{
    Name: string;
    ErrorMessage: string | null;
    SetName: (Name: string) => void;
    Submit: () => void;
}

export function UseKioskSettingsLayeredPanelController(
    OnAddKiosk: (Name: string) => boolean,
): KioskSettingsLayeredPanelControllerModel
{
    const [Name, SetNameValue] = useState('');
    const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);

    function SetName(NextName: string): void
    {
        SetNameValue(NextName);
        SetErrorMessage(null);
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
        SetName,
        Submit,
    };
}
