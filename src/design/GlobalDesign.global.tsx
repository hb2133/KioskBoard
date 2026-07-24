export const Tokens = {
    ColorBackground: '#f4f6f8',
    ColorPanel: '#ffffff',
    ColorText: '#18212f',
    ColorTextMuted: '#657084',
    ColorPrimary: '#335cff',
    ColorDanger: '#d64045',
    RadiusPanel: '18px',
};

export function GlobalStyles()
{
    return (
        <style>{`
            :root {
                --color-background: ${Tokens.ColorBackground};
                --color-panel: ${Tokens.ColorPanel};
                --color-text: ${Tokens.ColorText};
                --color-text-muted: ${Tokens.ColorTextMuted};
                --color-primary: ${Tokens.ColorPrimary};
                --color-primary-soft: #edf1ff;
                --color-danger: ${Tokens.ColorDanger};
                --color-border: #e4e8ee;
                --color-border-subtle: #edf0f4;
                --color-dialog-border: #aeb9c9;
                --color-surface-muted: #fafbfc;
                --color-surface-control: #ffffff;
                --color-surface-hover: #fafbff;
                --color-titlebar: rgba(255, 255, 255, 0.9);
                --color-scheduled: #e19718;
                --color-active: #16866c;
                --color-completed: #6e7786;
                --radius-panel: ${Tokens.RadiusPanel};
                --radius-control: 10px;
                --shadow-panel: 0 10px 35px rgba(35, 43, 58, 0.06);
                color-scheme: light;
                color: var(--color-text);
                font-family: "Noto Sans KR Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-synthesis: none;
            }

            :root[data-theme="dark"] {
                --color-background: #111722;
                --color-panel: #19212e;
                --color-text: #edf2f8;
                --color-text-muted: #9da9ba;
                --color-primary: #7792ff;
                --color-primary-soft: #25345f;
                --color-danger: #ff777d;
                --color-border: #303b4b;
                --color-border-subtle: #283342;
                --color-dialog-border: #5f6f85;
                --color-surface-muted: #151d29;
                --color-surface-control: #202a38;
                --color-surface-hover: #212c3c;
                --color-titlebar: rgba(25, 33, 46, 0.9);
                --shadow-panel: 0 14px 40px rgba(0, 0, 0, 0.24);
                color-scheme: dark;
            }

            * {
                box-sizing: border-box;
            }

            html,
            body,
            #root {
                height: 100%;
                min-height: 100%;
                margin: 0;
            }

            body {
                background: var(--color-panel);
                color: var(--color-text);
                min-width: 1180px;
                overflow: hidden;
                transition: background 160ms ease, color 160ms ease;
            }

            .DesktopTitleBar {
                -webkit-app-region: drag;
                align-items: center;
                backdrop-filter: blur(18px);
                background: var(--color-titlebar);
                border-bottom: 1px solid var(--color-border);
                display: flex;
                height: 42px;
                justify-content: space-between;
                position: sticky;
                top: 0;
                user-select: none;
                z-index: 2000;
            }

            .DesktopContentViewport {
                background: var(--color-background);
                height: calc(100% - 42px);
                overflow-x: hidden;
                overflow-y: auto;
                overscroll-behavior: contain;
                scroll-behavior: smooth;
                scrollbar-color: var(--color-dialog-border) transparent;
                scrollbar-width: thin;
            }

            .DesktopContentViewport::-webkit-scrollbar { width: 10px; }
            .DesktopContentViewport::-webkit-scrollbar-track { background: transparent; }
            .DesktopContentViewport::-webkit-scrollbar-thumb {
                background: var(--color-dialog-border);
                background-clip: padding-box;
                border: 3px solid transparent;
                border-radius: 99px;
            }

            .AppLoadingState {
                align-items: center;
                display: flex;
                justify-content: center;
                min-height: 100%;
                padding: 48px 24px;
            }

            .AppLoadingState__content {
                align-items: center;
                display: flex;
                flex-direction: column;
                text-align: center;
            }

            .AppLoadingState__brand {
                align-items: center;
                background: var(--color-primary);
                border-radius: 14px;
                box-shadow: 0 12px 28px rgba(51, 92, 255, 0.24);
                color: #ffffff;
                display: flex;
                font-size: 24px;
                font-weight: 900;
                height: 54px;
                justify-content: center;
                margin-bottom: 28px;
                width: 54px;
            }

            .AppLoadingState__spinner {
                animation: AppLoadingStateSpin 800ms linear infinite;
                border: 3px solid var(--color-border);
                border-radius: 50%;
                border-top-color: var(--color-primary);
                height: 34px;
                margin-bottom: 18px;
                width: 34px;
            }

            .AppLoadingState strong {
                font-size: 17px;
                letter-spacing: -0.02em;
            }

            .AppLoadingState p {
                color: var(--color-text-muted);
                font-size: 13px;
                margin: 8px 0 0;
            }

            @keyframes AppLoadingStateSpin {
                to { transform: rotate(360deg); }
            }

            @media (prefers-reduced-motion: reduce) {
                .AppLoadingState__spinner { animation-duration: 1600ms; }
            }

            .DesktopTitleBar__brand {
                align-items: center;
                display: flex;
                height: 100%;
                padding-left: 12px;
            }

            .DesktopTitleBar__brand span {
                align-items: center;
                background: #335cff;
                border-radius: 7px;
                color: #ffffff;
                display: inline-flex;
                font-size: 13px;
                font-weight: 900;
                height: 25px;
                justify-content: center;
                width: 25px;
            }

            button,
            input,
            select,
            textarea {
                color: inherit;
                font: inherit;
            }

            button {
                cursor: pointer;
            }

            button:focus-visible,
            input:focus-visible,
            select:focus-visible,
            textarea:focus-visible {
                outline: 3px solid rgba(51, 92, 255, 0.24);
                outline-offset: 2px;
            }

            .Button {
                align-items: center;
                border: 1px solid transparent;
                border-radius: var(--radius-control);
                display: inline-flex;
                font-weight: 700;
                gap: 8px;
                justify-content: center;
                min-height: 40px;
                padding: 0 16px;
                transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
            }

            .Button:hover {
                transform: translateY(-1px);
            }

            .Button--primary {
                background: var(--color-primary);
                box-shadow: 0 8px 18px rgba(51, 92, 255, 0.2);
                color: white;
            }

            .Button--secondary {
                background: var(--color-surface-control);
                border-color: var(--color-border);
            }

            .Button--danger {
                background: var(--color-danger);
                color: white;
            }

            .Button--large {
                min-height: 46px;
                padding: 0 20px;
            }

            @media (max-width: 767px) {
                html[data-runtime="web"] body {
                    min-width: 0;
                }

                html[data-runtime="web"] .DesktopContentViewport {
                    height: calc(100% - 42px);
                    overflow-x: hidden;
                }
            }
        `}</style>
    );
}
