export interface AuthenticationBasePanelProps
{
    ErrorMessage: string | null;
    IsConfigured: boolean;
    IsSubmitting: boolean;
    OnSignIn: (Email: string, Password: string) => Promise<boolean>;
}
