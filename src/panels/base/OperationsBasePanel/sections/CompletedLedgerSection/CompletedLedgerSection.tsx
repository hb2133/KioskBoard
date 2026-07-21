import { useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import { FormatDateRange } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelState';
import type {
    EventCompletionField,
    EventRecordWithStatus,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface CompletedLedgerSectionProps
{
    Records: EventRecordWithStatus[];
    OnToggleCompletion: (RecordId: string, Field: EventCompletionField) => void;
}

function ResultButton(IsComplete: boolean, OnClick: () => void)
{
    return (
        <button
            aria-pressed={IsComplete}
            className={IsComplete ? 'CompletionChip CompletionChip--done' : 'CompletionChip CompletionChip--attention'}
            onClick={OnClick}
            type="button"
        >
            {IsComplete ? Strings.Paid : Strings.Unpaid}
        </button>
    );
}

export function CompletedLedgerSection(Properties: CompletedLedgerSectionProps)
{
    const [VisibleRecordCount, SetVisibleRecordCount] = useState(5);
    const VisibleRecords = Properties.Records.slice(0, VisibleRecordCount);
    const HasMoreRecords = VisibleRecordCount < Properties.Records.length;
    const NextRecordCount = Math.min(5, Properties.Records.length - VisibleRecordCount);

    return (
        <section
            className="ContentSection"
            data-ue-component="CompletedLedgerSection"
            data-ue-root="true"
        >
            <div className="ContentSection__toolbar">
                <div>
                    <h2>{Strings.ViewCompleted}</h2>
                    <p>{Strings.EmptyCompletedDescription}</p>
                </div>
            </div>
            {Properties.Records.length === 0 ? (
                <div className="EmptyState">
                    <div className="EmptyState__icon" aria-hidden="true">✓</div>
                    <h3>{Strings.EmptyCompletedTitle}</h3>
                    <p>{Strings.EmptyCompletedDescription}</p>
                </div>
            ) : (
                <>
                    <div className="TableViewport">
                        <table className="CompletedLedgerTable">
                        <thead>
                            <tr>
                                <th>{Strings.CompanyName}</th>
                                <th>{Strings.EventSchedule}</th>
                                <th>{Strings.DepositPaid}</th>
                                <th>{Strings.BalancePaid}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VisibleRecords.map((Record) => (
                                <tr key={Record.Id}>
                                    <td className="CompletedLedgerTable__identity">
                                        <strong>{Record.CompanyName}</strong>
                                        <span>{Record.EventName}</span>
                                    </td>
                                    <td>{FormatDateRange(Record.EventStartDate, Record.EventEndDate)}</td>
                                    <td>{ResultButton(
                                        Record.DepositPaid,
                                        () => Properties.OnToggleCompletion(Record.Id, 'DepositPaid'),
                                    )}</td>
                                    <td>{ResultButton(
                                        Record.BalancePaid,
                                        () => Properties.OnToggleCompletion(Record.Id, 'BalancePaid'),
                                    )}</td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    {HasMoreRecords && (
                        <div className="LedgerLoadMore">
                            <button
                                onClick={() => SetVisibleRecordCount((CurrentCount) => CurrentCount + 5)}
                                type="button"
                            >
                                {Strings.LoadMore} +{NextRecordCount}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
