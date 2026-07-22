import { GlobalStyles } from '@/design/GlobalDesign.global';
import { OperationsBasePanel } from '@/panels/base/OperationsBasePanel/OperationsBasePanel';
import { AuthenticationBasePanel } from '@/panels/base/AuthenticationBasePanel/AuthenticationBasePanel';
import { UseAuthManager } from '@/managers/auth/AuthManager';
import { UseAppThemeController } from './AppThemeController';
import { DesktopTitleBar } from './DesktopTitleBar';

export function AppShell()
{
    const ThemeController = UseAppThemeController();
    const AuthManager = UseAuthManager();

    return (
        <>
            <GlobalStyles />
            <DesktopTitleBar />
            <div className="DesktopContentViewport">
                {AuthManager.IsReady === true && AuthManager.Session != null ? (
                    <OperationsBasePanel
                        OnSignOut={() => void AuthManager.SignOut()}
                        OnToggleTheme={ThemeController.ToggleTheme}
                        Theme={ThemeController.Theme}
                    />
                ) : AuthManager.IsReady === true ? (
                    <AuthenticationBasePanel
                        ErrorMessage={AuthManager.ErrorMessage}
                        IsConfigured={AuthManager.IsConfigured}
                        IsSubmitting={AuthManager.IsSubmitting}
                        OnSignIn={AuthManager.SignIn}
                    />
                ) : null}
            </div>
        </>
    );
}
