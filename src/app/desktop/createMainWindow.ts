import { BrowserWindow, Menu, nativeImage } from 'electron';

import AppIconDataUrl from '@/assets/app-icon.png';

export type CreateMainWindowOptions = {
    MainWindowEntry: string;
    PreloadEntry: string;
};

export function CreateMainWindow(options: CreateMainWindowOptions): BrowserWindow
{
    Menu.setApplicationMenu(null);

    const AppIcon = nativeImage.createFromDataURL(AppIconDataUrl);
    const MainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        backgroundMaterial: 'none',
        backgroundColor: '#ffffff',
        icon: AppIcon,
        titleBarOverlay: {
            color: '#ffffff',
            height: 41,
            symbolColor: '#18212f',
        },
        titleBarStyle: 'hidden',
        width: 1280,
        height: 800,
        minWidth: 1180,
        minHeight: 720,
        show: false,
        webPreferences: {
            preload: options.PreloadEntry,
        },
    });

    MainWindow.setMenu(null);
    MainWindow.setIcon(AppIcon);

    MainWindow.loadURL(options.MainWindowEntry);
    MainWindow.once('ready-to-show', () =>
    {
        MainWindow.setIcon(AppIcon);
        MainWindow.show();
    });

    return MainWindow;
}
