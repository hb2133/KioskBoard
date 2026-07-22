import type { FormEvent } from 'react';
import { Strings } from '@/core/localization/Strings';
import { UseAuthenticationBasePanelController } from './controller/AuthenticationBasePanelController';
import type { AuthenticationBasePanelProps } from './AuthenticationBasePanelInterface';

const AuthenticationBasePanelStyles = `
    .AuthenticationBasePanel {
        align-items: center;
        display: flex;
        justify-content: center;
        min-height: 100%;
        padding: 36px;
    }
    .AuthenticationCard {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 20px;
        box-shadow: var(--shadow-panel);
        max-width: 430px;
        padding: 34px;
        width: 100%;
    }
    .AuthenticationBrand {
        align-items: center;
        background: var(--color-primary);
        border-radius: 10px;
        color: #fff;
        display: flex;
        font-size: 18px;
        font-weight: 900;
        height: 42px;
        justify-content: center;
        margin-bottom: 24px;
        width: 42px;
    }
    .AuthenticationCard h1 { font-size: 26px; margin: 0 0 8px; }
    .AuthenticationCard > p { color: var(--color-text-muted); margin: 0 0 26px; }
    .AuthenticationForm { display: grid; gap: 18px; }
    .AuthenticationForm label { display: grid; font-size: 13px; font-weight: 750; gap: 8px; }
    .AuthenticationForm input {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        color: var(--color-text);
        min-height: 46px;
        padding: 0 14px;
    }
    .AuthenticationForm input:focus { border-color: var(--color-primary); outline: 2px solid var(--color-primary-soft); }
    .AuthenticationPasswordField { position: relative; }
    .AuthenticationPasswordField input {
        padding-right: 48px;
        width: 100%;
    }
    .AuthenticationPasswordToggle {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: 8px;
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        height: 34px;
        justify-content: center;
        padding: 0;
        position: absolute;
        right: 7px;
        top: 50%;
        transform: translateY(-50%);
        width: 34px;
    }
    .AuthenticationPasswordToggle:hover { background: var(--color-primary-soft); color: var(--color-primary); }
    .AuthenticationPasswordToggle:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 1px; }
    .AuthenticationPasswordToggle svg { height: 19px; width: 19px; }
    .AuthenticationError { color: var(--color-danger); font-size: 13px; margin: 0; }
    .AuthenticationSubmit { margin-top: 4px; min-height: 48px; width: 100%; }

    @media (max-width: 767px) {
        html[data-runtime="web"] .AuthenticationBasePanel { padding: 18px; }
        html[data-runtime="web"] .AuthenticationCard {
            border-radius: 16px;
            padding: 26px 20px;
        }
        html[data-runtime="web"] .AuthenticationCard h1 { font-size: 23px; }
    }
`;

export function AuthenticationBasePanel(Properties: AuthenticationBasePanelProps)
{
    const Controller = UseAuthenticationBasePanelController();

    function HandleSubmit(Event: FormEvent<HTMLFormElement>): void
    {
        Event.preventDefault();
        if (Controller.Validate() === true)
        {
            void Properties.OnSignIn(Controller.Email, Controller.Password);
        }
    }

    const ErrorMessage = Properties.IsConfigured === false
        ? Strings.SupabaseNotConfigured
        : Controller.ValidationError ?? Properties.ErrorMessage;

    return (
        <main className="AuthenticationBasePanel" data-ue-page="AuthenticationBasePanel">
            <style>{AuthenticationBasePanelStyles}</style>
            <section className="AuthenticationCard">
                <div className="AuthenticationBrand">K</div>
                <h1>{Strings.SignInTitle}</h1>
                <p>{Strings.SignInDescription}</p>
                <form className="AuthenticationForm" onSubmit={HandleSubmit}>
                    <label>
                        {Strings.Email}
                        <input
                            autoComplete="username"
                            onChange={(Event) => Controller.SetEmail(Event.target.value)}
                            type="email"
                            value={Controller.Email}
                        />
                    </label>
                    <label>
                        {Strings.Password}
                        <div className="AuthenticationPasswordField">
                            <input
                                autoComplete="current-password"
                                onChange={(Event) => Controller.SetPassword(Event.target.value)}
                                type={Controller.IsPasswordVisible ? 'text' : 'password'}
                                value={Controller.Password}
                            />
                            <button
                                aria-label={Controller.IsPasswordVisible ? Strings.HidePassword : Strings.ShowPassword}
                                aria-pressed={Controller.IsPasswordVisible}
                                className="AuthenticationPasswordToggle"
                                onClick={Controller.TogglePasswordVisibility}
                                title={Controller.IsPasswordVisible ? Strings.HidePassword : Strings.ShowPassword}
                                type="button"
                            >
                                {Controller.IsPasswordVisible ? (
                                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                                        <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.9 5.2A10.5 10.5 0 0112 5c5.4 0 9 7 9 7a17 17 0 01-2.1 3M6.6 6.6C4.3 8.1 3 12 3 12s3.6 7 9 7c1.5 0 2.8-.5 4-1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                    </svg>
                                ) : (
                                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                                        <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                                        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </label>
                    {ErrorMessage != null && <p className="AuthenticationError" role="alert">{ErrorMessage}</p>}
                    <button
                        className="Button Button--primary AuthenticationSubmit"
                        disabled={Properties.IsConfigured === false || Properties.IsSubmitting === true}
                        type="submit"
                    >
                        {Properties.IsSubmitting === true ? Strings.Loading : Strings.SignIn}
                    </button>
                </form>
            </section>
        </main>
    );
}
