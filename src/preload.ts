import { contextBridge, ipcRenderer, webFrame } from 'electron';
import { WindowControlChannels } from '@/core/infra/window/WindowControlChannels';

const MinimumZoomFactor = 0.7;
const MaximumZoomFactor = 1.5;
const ZoomStep = 0.1;
const RepeatedZoomEventInterval = 60;

let CurrentZoomFactor = 1;
let LastZoomDirection = 0;
let LastZoomEventTime = 0;

window.addEventListener('wheel', (Event) =>
{
    if (!Event.ctrlKey || Event.deltaY === 0)
    {
        return;
    }

    Event.preventDefault();
    Event.stopImmediatePropagation();

    const Direction = Event.deltaY < 0 ? 1 : -1;
    const EventTime = performance.now();

    if (
        Direction === LastZoomDirection
        && EventTime - LastZoomEventTime < RepeatedZoomEventInterval
    )
    {
        return;
    }

    if (EventTime - LastZoomEventTime > 500)
    {
        CurrentZoomFactor = Math.round(webFrame.getZoomFactor() * 10) / 10;
    }

    const NextZoomFactor = Math.min(
        MaximumZoomFactor,
        Math.max(
            MinimumZoomFactor,
            Math.round((CurrentZoomFactor + Direction * ZoomStep) * 10) / 10,
        ),
    );

    CurrentZoomFactor = NextZoomFactor;
    LastZoomDirection = Direction;
    LastZoomEventTime = EventTime;
    webFrame.setZoomFactor(NextZoomFactor);
}, { capture: true, passive: false });

contextBridge.exposeInMainWorld('WorkbenchBridge', {
    SetWindowTheme: (Theme: 'light' | 'dark') => ipcRenderer.send(WindowControlChannels.SetTheme, Theme),
});
