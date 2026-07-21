import { Strings } from '@/core/localization/Strings';

export interface DeleteConfirmLayeredPanelProps
{
    RecordLabel: string;
    OnConfirm: () => void;
    OnRequestClose: () => void;
}

export function DeleteConfirmLayeredPanel(Properties: DeleteConfirmLayeredPanelProps)
{
    return (
        <section
            aria-labelledby="DeleteConfirmTitle"
            aria-modal="true"
            className="LayeredDialog LayeredDialog--confirm"
            data-ue-component="DeleteConfirmLayeredPanel"
            data-ue-root="true"
            role="alertdialog"
        >
            <div className="DeleteConfirmIcon" aria-hidden="true">!</div>
            <h2 id="DeleteConfirmTitle">{Strings.DeleteDialogTitle}</h2>
            <p className="DeleteConfirmLabel">{Properties.RecordLabel}</p>
            <p>{Strings.DeleteDialogDescription}</p>
            <footer className="LayeredDialog__footer">
                <button
                    autoFocus
                    className="Button Button--secondary"
                    onClick={Properties.OnRequestClose}
                    type="button"
                >
                    {Strings.Cancel}
                </button>
                <button className="Button Button--danger" onClick={Properties.OnConfirm} type="button">
                    {Strings.ConfirmDelete}
                </button>
            </footer>
        </section>
    );
}
