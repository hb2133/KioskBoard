import { Strings } from '@/core/localization/Strings';
import type { OperationsSummary } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface SummarySectionProps
{
    Summary: OperationsSummary;
}

export function SummarySection(Properties: SummarySectionProps)
{
    const Cards = [
        { Label: Strings.SummaryAll, Value: Properties.Summary.All, Tone: 'all' },
        { Label: Strings.SummaryScheduled, Value: Properties.Summary.Scheduled, Tone: 'scheduled' },
        { Label: Strings.SummaryActive, Value: Properties.Summary.Active, Tone: 'active' },
        { Label: Strings.SummaryCompleted, Value: Properties.Summary.Completed, Tone: 'completed' },
    ];

    return (
        <section
            aria-label={Strings.Status}
            className="SummarySection"
            data-ue-component="SummarySection"
            data-ue-root="true"
        >
            {Cards.map((Card) => (
                <article className={`SummaryCard SummaryCard--${Card.Tone}`} key={Card.Tone}>
                    <div className="SummaryCard__indicator" aria-hidden="true" />
                    <p>{Card.Label}</p>
                    <strong>{Card.Value}</strong>
                </article>
            ))}
        </section>
    );
}
