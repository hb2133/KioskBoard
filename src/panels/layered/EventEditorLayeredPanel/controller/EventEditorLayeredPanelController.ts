import { useState } from 'react';
import { Strings } from '@/core/localization/Strings';
import type {
    EventRecord,
    EventRecordDraft,
} from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';

export interface EventEditorLayeredPanelControllerModel
{
    Draft: EventRecordDraft;
    ErrorMessage: string | null;
    UpdateField: <FieldName extends keyof EventRecordDraft>(
        Field: FieldName,
        Value: EventRecordDraft[FieldName],
    ) => void;
    Submit: () => void;
}

function CreateInitialDraft(Record: EventRecord | null): EventRecordDraft
{
    if (Record != null)
    {
        return {
            CompanyName: Record.CompanyName,
            EventName: Record.EventName,
            Content: Record.Content,
            ManagerName: Record.ManagerName,
            ManagerContact: Record.ManagerContact,
            EventStartDate: Record.EventStartDate,
            EventEndDate: Record.EventEndDate,
            AssignedKioskIds: Record.AssignedKioskIds,
            ContractCompleted: Record.ContractCompleted,
            DepositPaid: Record.DepositPaid,
            BalancePaid: Record.BalancePaid,
            DeliveryCompleted: Record.DeliveryCompleted,
            InstallationDateTime: Record.InstallationDateTime,
            RecoveryDateTime: Record.RecoveryDateTime,
            Notes: Record.Notes,
        };
    }

    return {
        CompanyName: '',
        EventName: '',
        Content: '',
        ManagerName: '',
        ManagerContact: '',
        EventStartDate: '',
        EventEndDate: '',
        AssignedKioskIds: [],
        ContractCompleted: false,
        DepositPaid: false,
        BalancePaid: false,
        DeliveryCompleted: false,
        InstallationDateTime: '',
        RecoveryDateTime: '',
        Notes: '',
    };
}

export function UseEventEditorLayeredPanelController(
    Record: EventRecord | null,
    OnComplete: (Draft: EventRecordDraft) => void,
): EventEditorLayeredPanelControllerModel
{
    const [Draft, SetDraft] = useState<EventRecordDraft>(() => CreateInitialDraft(Record));
    const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);

    function UpdateField<FieldName extends keyof EventRecordDraft>(
        Field: FieldName,
        Value: EventRecordDraft[FieldName],
    ): void
    {
        SetDraft((CurrentDraft) => ({
            ...CurrentDraft,
            [Field]: Value,
        }));
        SetErrorMessage(null);
    }

    function Submit(): void
    {
        if (
            Draft.CompanyName.trim() === ''
            || Draft.EventName.trim() === ''
            || Draft.EventStartDate === ''
            || Draft.EventEndDate === ''
        )
        {
            SetErrorMessage(Strings.RequiredFieldsError);
            return;
        }

        if (Draft.EventEndDate < Draft.EventStartDate)
        {
            SetErrorMessage(Strings.InvalidDateRangeError);
            return;
        }

        if (
            Draft.RecoveryDateTime !== ''
            && Draft.RecoveryDateTime.slice(0, 10) < Draft.EventEndDate
        )
        {
            SetErrorMessage(Strings.InvalidRecoveryDateTimeError);
            return;
        }

        OnComplete({
            ...Draft,
            CompanyName: Draft.CompanyName.trim(),
            EventName: Draft.EventName.trim(),
            Content: Draft.Content.trim(),
            ManagerName: Draft.ManagerName.trim(),
            ManagerContact: Draft.ManagerContact.trim(),
            Notes: Draft.Notes.trim(),
        });
    }

    return {
        Draft,
        ErrorMessage,
        UpdateField,
        Submit,
    };
}
