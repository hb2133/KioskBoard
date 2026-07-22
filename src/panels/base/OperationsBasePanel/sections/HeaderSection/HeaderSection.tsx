import { Strings } from '@/core/localization/Strings';
import type { AppTheme } from '@/core/config/AppTheme';

export interface HeaderSectionProps
{
    TodayKey: string;
    Theme: AppTheme;
    OnAddEvent: () => void;
    OnOpenSettings: () => void;
    OnToggleTheme: () => void;
    OnSignOut: () => void;
}

export function HeaderSection(Properties: HeaderSectionProps)
{
    const Today = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    }).format(new Date(`${Properties.TodayKey}T00:00:00`));

    return (
        <header
            className="HeaderSection"
            data-ue-component="HeaderSection"
            data-ue-root="true"
        >
            <div>
                <h1>{Strings.AppDescription}</h1>
                <p className="HeaderSection__date">{Strings.TodayLabel} · {Today}</p>
            </div>
            <div className="HeaderActions">
                <button
                    className="ThemeToggleButton"
                    onClick={Properties.OnSignOut}
                    type="button"
                >
                    {Strings.SignOut}
                </button>
                <button
                    aria-label={Strings.KioskSettingsTitle}
                    className="ThemeToggleButton SettingsButton"
                    onClick={Properties.OnOpenSettings}
                    type="button"
                >
                    <span aria-hidden="true">⚙</span>
                    {Strings.Settings}
                </button>
                <button
                    aria-label={Properties.Theme === 'light'
                        ? Strings.SwitchToDarkMode
                        : Strings.SwitchToLightMode}
                    className="ThemeToggleButton"
                    onClick={Properties.OnToggleTheme}
                    type="button"
                >
                    <span aria-hidden="true">{Properties.Theme === 'light' ? '☾' : '☀'}</span>
                    {Properties.Theme === 'light' ? Strings.DarkMode : Strings.LightMode}
                </button>
                <button className="Button Button--primary Button--large" onClick={Properties.OnAddEvent} type="button">
                    <span aria-hidden="true">＋</span>
                    {Strings.AddEvent}
                </button>
            </div>
        </header>
    );
}
