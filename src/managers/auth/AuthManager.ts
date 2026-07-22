import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { GetSupabaseRuntimeConfig } from '@/core/config/SupabaseConfig';
import { GetSupabaseClient } from '@/core/infra/supabase/SupabaseClient';

export interface AuthManagerModel
{
    IsConfigured: boolean;
    IsReady: boolean;
    IsSubmitting: boolean;
    Session: Session | null;
    ErrorMessage: string | null;
    SignIn: (Email: string, Password: string) => Promise<boolean>;
    SignOut: () => Promise<void>;
}

export function UseAuthManager(): AuthManagerModel
{
    const Config = GetSupabaseRuntimeConfig();
    const Client = GetSupabaseClient();
    const [SessionValue, SetSessionValue] = useState<Session | null>(null);
    const [IsReady, SetIsReady] = useState(Config.IsConfigured === false);
    const [IsSubmitting, SetIsSubmitting] = useState(false);
    const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);

    useEffect(() =>
    {
        if (Client == null)
        {
            return undefined;
        }

        void Client.auth.getSession().then(({ data, error }) =>
        {
            SetSessionValue(data.session);
            SetErrorMessage(error?.message ?? null);
            SetIsReady(true);
        });

        const { data: Subscription } = Client.auth.onAuthStateChange((_Event, NextSession) =>
        {
            SetSessionValue(NextSession);
            SetIsReady(true);
        });

        return () => Subscription.subscription.unsubscribe();
    }, [Client]);

    async function SignIn(Email: string, Password: string): Promise<boolean>
    {
        if (Client == null)
        {
            SetErrorMessage('Supabase 연결 설정이 없습니다.');
            return false;
        }

        SetIsSubmitting(true);
        SetErrorMessage(null);
        const { error } = await Client.auth.signInWithPassword({ email: Email.trim(), password: Password });
        SetIsSubmitting(false);

        if (error != null)
        {
            SetErrorMessage('이메일 또는 비밀번호를 확인해 주세요.');
            return false;
        }

        return true;
    }

    async function SignOut(): Promise<void>
    {
        if (Client != null)
        {
            await Client.auth.signOut();
        }
    }

    return {
        IsConfigured: Config.IsConfigured,
        IsReady,
        IsSubmitting,
        Session: SessionValue,
        ErrorMessage,
        SignIn,
        SignOut,
    };
}
