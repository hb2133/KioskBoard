import { Strings } from '@/core/localization/Strings';
import type { OperationsView } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface ViewNavigationSectionProps
{
    CurrentView: OperationsView;
    OnChangeView: (View: OperationsView) => void;
}

export function ViewNavigationSection(Properties: ViewNavigationSectionProps)
{
    const Views: Array<{ Id: OperationsView; Label: string; Icon: string }> = [
        { Id: 'ledger', Label: Strings.ViewLedger, Icon: '☷' },
        { Id: 'calendar', Label: Strings.ViewCalendar, Icon: '▦' },
        { Id: 'completed', Label: Strings.ViewCompleted, Icon: '✓' },
    ];

    return (
        <nav
            aria-label={Strings.AppDescription}
            className="ViewNavigationSection"
            data-ue-component="ViewNavigationSection"
            data-ue-root="true"
        >
            {Views.map((View) => (
                <button
                    aria-current={Properties.CurrentView === View.Id ? 'page' : undefined}
                    className={Properties.CurrentView === View.Id ? 'ViewTab ViewTab--active' : 'ViewTab'}
                    key={View.Id}
                    onClick={() => Properties.OnChangeView(View.Id)}
                    type="button"
                >
                    <span aria-hidden="true">{View.Icon}</span>
                    {View.Label}
                </button>
            ))}
        </nav>
    );
}
