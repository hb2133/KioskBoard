import { useState } from 'react';
import type { FormEvent } from 'react';
import { Strings } from '@/core/localization/Strings';
import { HangulTextInput } from '@/panels/shared/HangulTextField/HangulTextField';
import { UseKioskSettingsLayeredPanelController } from './controller/KioskSettingsLayeredPanelController';
import type { KioskSettingsLayeredPanelProps } from './KioskSettingsLayeredPanelInterface';

export function KioskSettingsLayeredPanel(Properties: KioskSettingsLayeredPanelProps)
{
    const [IsHangulMode, SetIsHangulMode] = useState(false);
    const Controller = UseKioskSettingsLayeredPanelController(
        Properties.OnAddKiosk,
        Properties.OnSelectBackupFile,
        Properties.OnRestoreBackup,
    );

    function HandleSubmit(Event: FormEvent<HTMLFormElement>): void
    {
        Event.preventDefault();
        Controller.Submit();
    }

    return (
        <section
            aria-labelledby="KioskSettingsTitle"
            aria-modal="true"
            className="LayeredDialog LayeredDialog--settings"
            data-ue-component="KioskSettingsLayeredPanel"
            data-ue-root="true"
            role="dialog"
        >
            <header className="LayeredDialog__header">
                <div>
                    <h2 id="KioskSettingsTitle">{Strings.KioskSettingsTitle}</h2>
                    <p>{Strings.KioskSettingsDescription}</p>
                </div>
                <button
                    aria-label={Strings.CloseDialog}
                    className="IconButton"
                    onClick={Properties.OnRequestClose}
                    type="button"
                >
                    ×
                </button>
            </header>

            <div className="KioskSettingsBody">
                <form className="KioskRegistrationForm" onSubmit={HandleSubmit}>
                    <label className="FormField">
                        <span>{Strings.ManagedKioskName}</span>
                        <div className="KioskRegistrationForm__row">
                            <HangulTextInput
                                autoFocus
                                IsHangulMode={IsHangulMode}
                                OnToggleMode={() => SetIsHangulMode((CurrentMode) => CurrentMode === false)}
                                OnValueChange={Controller.SetName}
                                placeholder={Strings.ManagedKioskPlaceholder}
                                Value={Controller.Name}
                            />
                            <button className="Button Button--primary" type="submit">
                                {Strings.RegisterKiosk}
                            </button>
                        </div>
                    </label>
                    {Controller.ErrorMessage != null && (
                        <p className="FormError" role="alert">{Controller.ErrorMessage}</p>
                    )}
                </form>

                <div className="ManagedKioskListHeader">
                    <strong>{Strings.RegisteredKiosks}</strong>
                    <span>{Properties.Kiosks.length}{Strings.KioskCountUnit}</span>
                </div>

                {Properties.Kiosks.length === 0 ? (
                    <div className="ManagedKioskEmpty">{Strings.EmptyManagedKiosks}</div>
                ) : (
                    <div className="ManagedKioskList">
                        {Properties.Kiosks.map((Kiosk, Index) => (
                            <div className="ManagedKioskItem" key={Kiosk.Id}>
                                <span className="ManagedKioskItem__index">{Index + 1}</span>
                                <strong title={Kiosk.Name}>{Kiosk.Name}</strong>
                                <button
                                    aria-label={`${Kiosk.Name} ${Strings.Delete}`}
                                    onClick={() => Properties.OnDeleteKiosk(Kiosk.Id)}
                                    type="button"
                                >
                                    {Strings.Delete}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <section className="BackupRestoreSection">
                    <div className="BackupRestoreSection__header">
                        <div>
                            <strong>{Strings.BackupAndRestore}</strong>
                            <p>{Strings.BackupDescription}</p>
                        </div>
                        <button
                            className="Button Button--secondary"
                            disabled={Controller.IsSelectingBackup === true || Controller.IsRestoringBackup === true}
                            onClick={() => void Controller.SelectBackup()}
                            type="button"
                        >
                            {Controller.IsSelectingBackup === true ? Strings.Loading : Strings.SelectBackupFile}
                        </button>
                    </div>

                    {Controller.BackupFile == null ? (
                        <div className="BackupRestoreEmpty">{Strings.BackupNotSelected}</div>
                    ) : (
                        <div className="BackupRestorePreview">
                            <strong>{Controller.BackupFile.Path.split(/[\\/]/).pop()}</strong>
                            <span>
                                {new Intl.DateTimeFormat('ko-KR', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                }).format(new Date(Controller.BackupFile.SavedAt))}
                            </span>
                            <div>
                                <span>행사 {Controller.BackupFile.RecordCount}건</span>
                                <span>키오스크 {Controller.BackupFile.KioskCount}대</span>
                            </div>
                            {Controller.BackupMessage != null && (
                                <p className={Controller.IsRestoreConfirmationPending === true
                                    ? 'BackupRestoreMessage BackupRestoreMessage--warning'
                                    : 'BackupRestoreMessage'}>
                                    {Controller.BackupMessage}
                                </p>
                            )}
                            <button
                                className={Controller.IsRestoreConfirmationPending === true
                                    ? 'Button Button--danger'
                                    : 'Button Button--secondary'}
                                disabled={Controller.IsRestoringBackup === true}
                                onClick={() => void Controller.RestoreBackup()}
                                type="button"
                            >
                                {Controller.IsRestoringBackup === true
                                    ? Strings.Loading
                                    : Controller.IsRestoreConfirmationPending === true
                                        ? Strings.ConfirmRestoreBackup
                                        : Strings.RestoreBackup}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}
