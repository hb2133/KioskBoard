import { useEffect, useState } from 'react';
import { LoadLocalStorageJson, SaveLocalStorageJson } from '@/core/infra/local_storage/LocalStorageJsonStore';
import type { AppTheme } from '@/core/config/AppTheme';

const AppThemeStorageKey = 'kioskboard.app-theme.v1';

function LoadInitialTheme(): AppTheme
{
    try
    {
        const StoredTheme = LoadLocalStorageJson(AppThemeStorageKey);

        if (StoredTheme === 'dark' || StoredTheme === 'light')
        {
            return StoredTheme;
        }
    }
    catch
    {
        return 'light';
    }

    return 'light';
}

export interface AppThemeControllerModel
{
    Theme: AppTheme;
    ToggleTheme: () => void;
}

export function UseAppThemeController(): AppThemeControllerModel
{
    const [Theme, SetTheme] = useState<AppTheme>(LoadInitialTheme);

    useEffect(() =>
    {
        document.documentElement.dataset.theme = Theme;
        window.WorkbenchBridge.SetWindowTheme(Theme);

        try
        {
            SaveLocalStorageJson(AppThemeStorageKey, Theme);
        }
        catch
        {
            // 테마 저장 실패는 현재 세션의 화면 전환을 막지 않는다.
        }
    }, [Theme]);

    return {
        Theme,
        ToggleTheme: () => SetTheme((CurrentTheme) => CurrentTheme === 'light' ? 'dark' : 'light'),
    };
}
