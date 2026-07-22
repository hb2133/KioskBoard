import { useState } from 'react';

export interface AuthenticationBasePanelControllerModel
{
    Email: string;
    Password: string;
    IsPasswordVisible: boolean;
    ValidationError: string | null;
    SetEmail: (Value: string) => void;
    SetPassword: (Value: string) => void;
    TogglePasswordVisibility: () => void;
    Validate: () => boolean;
}

export function UseAuthenticationBasePanelController(): AuthenticationBasePanelControllerModel
{
    const [Email, SetEmail] = useState('');
    const [Password, SetPassword] = useState('');
    const [IsPasswordVisible, SetIsPasswordVisible] = useState(false);
    const [ValidationError, SetValidationError] = useState<string | null>(null);

    function Validate(): boolean
    {
        const IsValid = Email.trim() !== '' && Password !== '';
        SetValidationError(IsValid ? null : '이메일과 비밀번호를 입력해 주세요.');
        return IsValid;
    }

    return {
        Email,
        Password,
        IsPasswordVisible,
        ValidationError,
        SetEmail,
        SetPassword,
        TogglePasswordVisibility: () => SetIsPasswordVisible((CurrentValue) => CurrentValue === false),
        Validate,
    };
}
