interface WorkbenchBridgeApi
{
    SetWindowTheme: (Theme: 'light' | 'dark') => void;
}

interface Window
{
    WorkbenchBridge: WorkbenchBridgeApi;
}
