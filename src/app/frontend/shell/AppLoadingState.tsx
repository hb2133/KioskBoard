export interface AppLoadingStateProps
{
    Message: string;
}

export function AppLoadingState(Properties: AppLoadingStateProps)
{
    return (
        <main
            aria-busy="true"
            aria-live="polite"
            className="AppLoadingState"
            role="status"
        >
            <div className="AppLoadingState__content">
                <span aria-hidden="true" className="AppLoadingState__brand">K</span>
                <span aria-hidden="true" className="AppLoadingState__spinner" />
                <strong>{Properties.Message}</strong>
                <p>잠시만 기다려 주세요.</p>
            </div>
        </main>
    );
}
