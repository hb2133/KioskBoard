import { GlobalStyles } from '@/design/GlobalDesign.global';
import { OperationsBasePanel } from '@/panels/base/OperationsBasePanel/OperationsBasePanel';
import { UseAppThemeController } from './AppThemeController';
import { DesktopTitleBar } from './DesktopTitleBar';

export function AppShell()
{
    const ThemeController = UseAppThemeController();

    return (
        <>
            <GlobalStyles />
            <DesktopTitleBar />
            <div className="DesktopContentViewport">
                <OperationsBasePanel
                    OnToggleTheme={ThemeController.ToggleTheme}
                    Theme={ThemeController.Theme}
                />
            </div>
        </>
    );
}
