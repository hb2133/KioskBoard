import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface PanelLayerItem
{
    Id: string;
    Content: ReactNode;
    Dismissible: boolean;
    OnRequestClose: () => void;
}

export interface PanelLayerHostProps
{
    Layers: PanelLayerItem[];
}

export function PanelLayerHost(Properties: PanelLayerHostProps)
{
    const TopLayer = Properties.Layers.at(-1);

    useEffect(() =>
    {
        function HandleKeyDown(Event: KeyboardEvent): void
        {
            if (Event.key === 'Escape' && TopLayer?.Dismissible === true)
            {
                Event.preventDefault();
                TopLayer.OnRequestClose();
            }
        }

        document.addEventListener('keydown', HandleKeyDown);
        return () => document.removeEventListener('keydown', HandleKeyDown);
    }, [TopLayer]);

    useEffect(() =>
    {
        if (Properties.Layers.length === 0)
        {
            return undefined;
        }

        const ScrollViewport = document.querySelector<HTMLElement>('.DesktopContentViewport');

        if (ScrollViewport == null)
        {
            return undefined;
        }

        const LockedScrollLeft = ScrollViewport.scrollLeft;
        const LockedScrollTop = ScrollViewport.scrollTop;

        function RestoreBackgroundScroll(): void
        {
            if (
                ScrollViewport.scrollLeft !== LockedScrollLeft
                || ScrollViewport.scrollTop !== LockedScrollTop
            )
            {
                ScrollViewport.scrollTo(LockedScrollLeft, LockedScrollTop);
            }
        }

        ScrollViewport.addEventListener('scroll', RestoreBackgroundScroll, { passive: true });

        return () =>
        {
            ScrollViewport.removeEventListener('scroll', RestoreBackgroundScroll);
        };
    }, [Properties.Layers.length]);

    if (Properties.Layers.length === 0)
    {
        return null;
    }

    return (
        <div className="PanelLayerHost" aria-live="polite">
            {Properties.Layers.map((Layer, Index) =>
            {
                const IsTopLayer = Index === Properties.Layers.length - 1;

                return (
                    <div
                        className="PanelLayer"
                        key={Layer.Id}
                        style={{ zIndex: 1000 + Index }}
                    >
                        <button
                            aria-hidden="true"
                            className="PanelLayer__backdrop"
                            onClick={IsTopLayer && Layer.Dismissible ? Layer.OnRequestClose : undefined}
                            onWheel={(Event) => Event.preventDefault()}
                            tabIndex={-1}
                            type="button"
                        />
                        <div className="PanelLayer__content">
                            {Layer.Content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
