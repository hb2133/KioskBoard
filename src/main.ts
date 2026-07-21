import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { CreateMainWindow } from './app/desktop/createMainWindow';
import { WindowControlChannels } from './core/infra/window/WindowControlChannels';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

app.commandLine.appendSwitch('lang', 'ko-KR');

ipcMain.on(WindowControlChannels.SetTheme, (Event, Theme: unknown) =>
{
    if (Theme !== 'light' && Theme !== 'dark')
    {
        return;
    }

    const Window = BrowserWindow.fromWebContents(Event.sender);
    const IsDarkTheme = Theme === 'dark';

    nativeTheme.themeSource = Theme;
    Window?.setBackgroundColor(IsDarkTheme ? '#19212e' : '#ffffff');
    Window?.setTitleBarOverlay({
        color: IsDarkTheme ? '#19212e' : '#ffffff',
        height: 41,
        symbolColor: IsDarkTheme ? '#edf2f8' : '#18212f',
    });
});

if (require('electron-squirrel-startup'))
{
    app.quit();
}

app.on('ready', () =>
{
    CreateMainWindow({
        MainWindowEntry: MAIN_WINDOW_WEBPACK_ENTRY,
        PreloadEntry: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    });
});

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length === 0)
    {
        CreateMainWindow({
            MainWindowEntry: MAIN_WINDOW_WEBPACK_ENTRY,
            PreloadEntry: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        });
    }
});
