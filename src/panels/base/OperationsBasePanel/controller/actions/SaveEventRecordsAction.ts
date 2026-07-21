import { SaveLocalStorageJson } from '@/core/infra/local_storage/LocalStorageJsonStore';
import type { EventRecord } from '@/panels/base/OperationsBasePanel/controller/OperationsBasePanelTypes';
import { EventRecordsStorageKey } from './LoadEventRecordsAction';

export function SaveEventRecordsAction(Records: EventRecord[]): void
{
    SaveLocalStorageJson(EventRecordsStorageKey, Records);
}
