import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GetSupabaseRuntimeConfig } from '@/core/config/SupabaseConfig';

let Client: SupabaseClient | null = null;

export function GetSupabaseClient(): SupabaseClient | null
{
    const Config = GetSupabaseRuntimeConfig();

    if (Config.IsConfigured === false)
    {
        return null;
    }

    if (Client == null)
    {
        Client = createClient(Config.Url, Config.PublishableKey, {
            auth: {
                autoRefreshToken: true,
                detectSessionInUrl: false,
                persistSession: true,
            },
        });
    }

    return Client;
}
