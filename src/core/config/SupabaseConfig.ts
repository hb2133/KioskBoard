declare const __SUPABASE_URL__: string;
declare const __SUPABASE_PUBLISHABLE_KEY__: string;

export interface SupabaseRuntimeConfig
{
    Url: string;
    PublishableKey: string;
    IsConfigured: boolean;
}

export function GetSupabaseRuntimeConfig(): SupabaseRuntimeConfig
{
    const Url = __SUPABASE_URL__.trim();
    const PublishableKey = __SUPABASE_PUBLISHABLE_KEY__.trim();

    return {
        Url,
        PublishableKey,
        IsConfigured: Url !== '' && PublishableKey !== '',
    };
}
