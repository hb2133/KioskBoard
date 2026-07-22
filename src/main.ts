import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CreateMainWindow } from './app/desktop/createMainWindow';
import { WindowControlChannels } from './core/infra/window/WindowControlChannels';
import { BackupChannels } from './core/infra/backup/BackupChannels';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

function GetBackupDirectory(): string
{
    const ProjectDirectory = app.isPackaged === true
        ? path.dirname(app.getPath('exe'))
        : app.getAppPath();

    return path.join(ProjectDirectory, 'Saved');
}

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

ipcMain.handle(BackupChannels.SaveLatest, async (_Event, Snapshot: unknown) =>
{
    if (typeof Snapshot !== 'object' || Snapshot == null)
    {
        throw new Error('Invalid backup snapshot.');
    }

    const Candidate = Snapshot as { Records?: unknown; Kiosks?: unknown };
    if (Array.isArray(Candidate.Records) === false || Array.isArray(Candidate.Kiosks) === false)
    {
        throw new Error('Invalid backup snapshot collections.');
    }

    const BackupDirectory = GetBackupDirectory();
    const BackupPath = path.join(BackupDirectory, 'kioskboard-latest-backup.json');
    const BackupJson = JSON.stringify({
        Version: 1,
        SavedAt: new Date().toISOString(),
        Records: Candidate.Records,
        Kiosks: Candidate.Kiosks,
    }, null, 2);

    if (Buffer.byteLength(BackupJson, 'utf8') > 10 * 1024 * 1024)
    {
        throw new Error('Backup snapshot is too large.');
    }

    await mkdir(BackupDirectory, { recursive: true });
    await writeFile(BackupPath, BackupJson, { encoding: 'utf8' });
});

ipcMain.handle(BackupChannels.SelectFile, async (Event) =>
{
    const Window = BrowserWindow.fromWebContents(Event.sender);
    if (Window == null)
    {
        throw new Error('Backup dialog owner was not found.');
    }

    const Result = await dialog.showOpenDialog(Window, {
        title: 'KioskBoard 백업 파일 선택',
        defaultPath: GetBackupDirectory(),
        filters: [{ name: 'KioskBoard JSON 백업', extensions: ['json'] }],
        properties: ['openFile'],
    });
    if (Result.canceled === true || Result.filePaths.length === 0)
    {
        return null;
    }

    const FilePath = Result.filePaths[0];
    const FileContent = await readFile(FilePath, { encoding: 'utf8' });
    if (Buffer.byteLength(FileContent, 'utf8') > 10 * 1024 * 1024)
    {
        throw new Error('Backup file is too large.');
    }

    const Snapshot = JSON.parse(FileContent) as {
        Version?: unknown;
        SavedAt?: unknown;
        Records?: unknown;
        Kiosks?: unknown;
    };
    if (
        Snapshot.Version !== 1
        || typeof Snapshot.SavedAt !== 'string'
        || Array.isArray(Snapshot.Records) === false
        || Array.isArray(Snapshot.Kiosks) === false
    )
    {
        throw new Error('올바른 KioskBoard 백업 파일이 아닙니다.');
    }

    return {
        Path: FilePath,
        SavedAt: Snapshot.SavedAt,
        RecordCount: Snapshot.Records.length,
        KioskCount: Snapshot.Kiosks.length,
        Snapshot: {
            Records: Snapshot.Records,
            Kiosks: Snapshot.Kiosks,
        },
    };
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
