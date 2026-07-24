import { PanelLayerHost } from '@/app/frontend/panel_layer/PanelLayerHost';
import type { PanelLayerItem } from '@/app/frontend/panel_layer/PanelLayerHost';
import { AppLoadingState } from '@/app/frontend/shell/AppLoadingState';
import { Strings } from '@/core/localization/Strings';
import { DeleteConfirmLayeredPanel } from '@/panels/layered/DeleteConfirmLayeredPanel/DeleteConfirmLayeredPanel';
import { EventEditorLayeredPanel } from '@/panels/layered/EventEditorLayeredPanel/EventEditorLayeredPanel';
import { KioskSettingsLayeredPanel } from '@/panels/layered/KioskSettingsLayeredPanel/KioskSettingsLayeredPanel';
import { EventDetailsLayeredPanel } from '@/panels/layered/EventDetailsLayeredPanel/EventDetailsLayeredPanel';
import { UseOperationsBasePanelController } from './controller/OperationsBasePanelController';
import type { OperationsBasePanelProps } from './OperationsBasePanelInterface';
import { CalendarSection } from './sections/CalendarSection/CalendarSection';
import { CompletedLedgerSection } from './sections/CompletedLedgerSection/CompletedLedgerSection';
import { EventLedgerSection } from './sections/EventLedgerSection/EventLedgerSection';
import { HeaderSection } from './sections/HeaderSection/HeaderSection';
import { SummarySection } from './sections/SummarySection/SummarySection';
import { ViewNavigationSection } from './sections/ViewNavigationSection/ViewNavigationSection';

const OperationsBasePanelStyles = `
    .OperationsBasePanel {
        margin: 0 auto;
        max-width: 1680px;
        min-height: 100%;
        padding: 32px 40px 48px;
    }

    .HeaderSection {
        align-items: flex-end;
        display: flex;
        justify-content: space-between;
        margin-bottom: 28px;
    }

    .HeaderSection h1 {
        font-size: clamp(26px, 2.2vw, 36px);
        letter-spacing: -0.04em;
        margin: 9px 0 8px;
    }

    .HeaderSection__date,
    .ContentSection__toolbar p,
    .LayeredDialog__header p {
        color: var(--color-text-muted);
        margin: 0;
    }

    .HeaderActions {
        align-items: center;
        display: flex;
        gap: 10px;
    }

    .ThemeToggleButton {
        align-items: center;
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        color: var(--color-text);
        display: inline-flex;
        font-size: 12px;
        font-weight: 750;
        gap: 7px;
        min-height: 46px;
        padding: 0 15px;
    }

    .SummarySection {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-bottom: 22px;
    }

    .SummaryCard {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 14px;
        box-shadow: var(--shadow-panel);
        min-height: 116px;
        padding: 20px 22px;
        position: relative;
    }

    .SummaryCard p {
        color: var(--color-text-muted);
        font-size: 14px;
        font-weight: 650;
        margin: 0 0 10px;
    }

    .SummaryCard strong {
        font-size: 32px;
        letter-spacing: -0.04em;
    }

    .SummaryCard__indicator {
        background: var(--color-text);
        border-radius: 99px;
        height: 8px;
        position: absolute;
        right: 20px;
        top: 20px;
        width: 8px;
    }

    .SummaryCard--scheduled .SummaryCard__indicator { background: var(--color-scheduled); }
    .SummaryCard--active .SummaryCard__indicator { background: var(--color-active); }
    .SummaryCard--completed .SummaryCard__indicator { background: var(--color-completed); }

    .ViewNavigationSection {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        display: inline-flex;
        gap: 4px;
        margin-bottom: 16px;
        padding: 4px;
    }

    .ViewTab {
        align-items: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 9px;
        color: var(--color-text-muted);
        display: flex;
        font-weight: 700;
        gap: 8px;
        min-height: 39px;
        padding: 0 18px;
        position: relative;
        transition: background 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
    }

    .ViewTab:hover:not(.ViewTab--active) {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .ViewTab > span {
        align-items: center;
        border-radius: 6px;
        display: inline-flex;
        font-size: 14px;
        height: 23px;
        justify-content: center;
        width: 23px;
    }

    .ViewTab--active {
        background: var(--color-primary-soft);
        border-color: var(--color-primary);
        box-shadow: 0 3px 10px rgba(51, 92, 255, 0.14);
        color: var(--color-primary);
    }

    .ViewTab--active > span {
        background: var(--color-primary);
        color: #ffffff;
    }

    .ViewTab--active::after {
        background: var(--color-primary);
        border-radius: 99px;
        bottom: 3px;
        content: "";
        height: 2px;
        left: 18px;
        position: absolute;
        right: 18px;
    }

    .ContentSection {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-panel);
        box-shadow: var(--shadow-panel);
        min-height: 410px;
        overflow: hidden;
    }

    .ContentSection__toolbar {
        align-items: center;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        min-height: 84px;
        padding: 18px 22px;
    }

    .ContentSection__toolbar h2 {
        font-size: 20px;
        letter-spacing: -0.025em;
        margin: 0 0 5px;
    }

    .ContentSection__toolbar p {
        font-size: 13px;
    }

    .ContentSection__toolbar select,
    .FormField input,
    .FormField textarea {
        background: var(--color-surface-control);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
    }

    .ContentSection__toolbar select {
        min-height: 40px;
        padding: 0 34px 0 12px;
    }

    .ProgressStatusFilter {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        display: grid;
        gap: 4px;
        grid-template-columns: repeat(3, auto);
        padding: 4px;
    }

    .ProgressStatusFilter__button {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 7px;
        color: var(--color-text-muted);
        font-size: 12px;
        font-weight: 750;
        min-height: 32px;
        padding: 0 11px;
        white-space: nowrap;
    }

    .ProgressStatusFilter__button:hover,
    .ProgressStatusFilter__button--active {
        background: var(--color-primary-soft);
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    .ProgressStatusFilter__button--active {
        box-shadow: 0 3px 9px rgba(51, 92, 255, 0.12);
        font-weight: 850;
    }

    .TableViewport {
        overflow-x: hidden;
    }

    table {
        border-collapse: collapse;
        font-size: 13px;
        table-layout: fixed;
        width: 100%;
    }

    th {
        background: var(--color-surface-muted);
        color: var(--color-text-muted);
        font-size: 12px;
        font-weight: 750;
        padding: 12px 15px;
        text-align: left;
        white-space: nowrap;
    }

    td {
        border-top: 1px solid var(--color-border-subtle);
        padding: 14px 15px;
        white-space: nowrap;
    }

    .EventIdentityColumn,
    .EventIdentityCell {
        min-width: 0;
        width: calc((100% - 794px) / 2 - 10px);
    }

    .AssignedKiosksColumn,
    .AssignedKiosksCell {
        min-width: 0;
        width: calc((100% - 794px) / 2 + 10px);
    }

    .EventLedgerTable th:nth-child(2) { width: 118px; }
    .EventLedgerTable th:nth-child(3) { width: 74px; }
    .EventLedgerTable th:nth-child(5),
    .EventLedgerTable th:nth-child(6),
    .EventLedgerTable th:nth-child(7) { width: 78px; }
    .EventLedgerTable th:nth-child(8),
    .EventLedgerTable th:nth-child(9) { width: 132px; }
    .EventLedgerTable th:nth-child(10) { width: 104px; }

    .EventScheduleColumn,
    .EventScheduleCell {
        padding-left: 8px;
        padding-right: 8px;
    }

    .EventScheduleCell > span {
        display: block;
        text-align: center;
        width: 100%;
    }

    .EventLedgerTable th:nth-child(1),
    .EventLedgerTable th:nth-child(2),
    .EventLedgerTable th:nth-child(3),
    .EventLedgerTable th:nth-child(4),
    .EventLedgerTable th:nth-child(8),
    .EventLedgerTable th:nth-child(9),
    .EventLedgerTable th:nth-child(10),
    .EventLedgerTable td:nth-child(1),
    .EventLedgerTable td:nth-child(2),
    .EventLedgerTable td:nth-child(3),
    .EventLedgerTable td:nth-child(4),
    .EventLedgerTable td:nth-child(8),
    .EventLedgerTable td:nth-child(9),
    .EventLedgerTable td:nth-child(10) {
        text-align: center;
    }

    .CompletedLedgerTable th,
    .CompletedLedgerTable td {
        text-align: center;
    }

    .CompletedLedgerTable th:nth-child(1) { width: 40%; }
    .CompletedLedgerTable th:nth-child(2) { width: 24%; }
    .CompletedLedgerTable th:nth-child(3),
    .CompletedLedgerTable th:nth-child(4) { width: 18%; }

    .CompletedLedgerTable__identity strong,
    .CompletedLedgerTable__identity span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .EventIdentityCell strong,
    .EventIdentityCell span,
    .AssignedKiosksCell span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    td strong,
    td span {
        display: block;
    }

    td > span:not(.StatusBadge):not(.CompletionChip),
    td strong + span {
        color: var(--color-text-muted);
        font-size: 12px;
        margin-top: 4px;
    }

    tbody tr:hover {
        background: var(--color-surface-hover);
    }

    .StatusBadge,
    .CompletionChip {
        border-radius: 99px;
        display: inline-flex;
        font-size: 11px;
        font-weight: 800;
        justify-content: center;
        padding: 5px 9px;
        width: 52px;
    }

    .StatusBadge--scheduled { background: #fff6df; color: #9c6200; }
    .StatusBadge--active { background: #e5f7f1; color: #08705a; }
    .StatusBadge--completed { background: #edf0f3; color: #5f6876; }
    .CompletionChip { background: #f0f2f5; color: #7a8493; }
    .CompletionChip--done { background: #e7f6ef; color: #08705a; }
    .CompletionChip--attention { background: #fff0ee; color: #b7373d; }

    button.CompletionChip {
        border: 0;
        transition: filter 120ms ease, transform 120ms ease;
    }

    button.CompletionChip:hover {
        filter: brightness(0.96);
        transform: translateY(-1px);
    }

    .TableActions {
        display: flex;
        gap: 6px;
        justify-content: center;
    }

    .TableActions button {
        background: transparent;
        border: 0;
        color: var(--color-primary);
        font-size: 12px;
        font-weight: 750;
        padding: 5px;
    }

    .TableActions .TableActions__delete {
        color: var(--color-danger);
    }

    .LedgerLoadMore {
        align-items: center;
        border-top: 1px solid var(--color-border-subtle);
        display: flex;
        justify-content: center;
        min-height: 58px;
        padding: 9px 16px;
    }

    .LedgerLoadMore button {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: 9px;
        color: var(--color-primary);
        font-size: 12px;
        font-weight: 800;
        min-height: 38px;
        padding: 0 22px;
        transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    .LedgerLoadMore button:hover {
        background: var(--color-primary-soft);
        border-color: var(--color-primary);
        transform: translateY(-1px);
    }

    .EmptyState {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 325px;
        padding: 40px;
        text-align: center;
    }

    .EmptyState__icon {
        align-items: center;
        background: var(--color-primary-soft);
        border-radius: 16px;
        color: var(--color-primary);
        display: flex;
        font-size: 25px;
        height: 58px;
        justify-content: center;
        margin-bottom: 14px;
        width: 58px;
    }

    .EmptyState h3 { margin: 0 0 7px; }
    .EmptyState p { color: var(--color-text-muted); margin: 0 0 20px; }

    .CalendarToolbar__actions {
        display: flex;
        gap: 6px;
    }

    .CalendarToolbar__actions button {
        background: var(--color-surface-control);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-weight: 750;
        min-height: 36px;
        padding: 0 12px;
    }

    .CalendarGrid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .CalendarGrid--weekdays {
        background: var(--color-surface-muted);
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text-muted);
        font-size: 12px;
        font-weight: 750;
        text-align: center;
    }

    .CalendarGrid--weekdays div { padding: 10px; }

    .CalendarWeeks { display: grid; }

    .MobileCalendarAgenda { display: none; }

    .CalendarWeek {
        border-bottom: 1px solid var(--color-border-subtle);
        position: relative;
    }

    .CalendarWeek:last-child { border-bottom: 0; }

    .CalendarWeek__days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        inset: 0;
        position: absolute;
    }

    .CalendarDay {
        border-right: 1px solid var(--color-border-subtle);
        padding: 9px;
    }

    .CalendarDay:nth-child(7n) { border-right: 0; }
    .CalendarDay--muted { background: var(--color-surface-muted); color: var(--color-text-muted); }

    .CalendarDay__date {
        align-items: center;
        display: flex;
        gap: 5px;
        min-width: 0;
    }

    .CalendarDay__number {
        align-items: center;
        display: flex;
        font-size: 12px;
        font-weight: 750;
        height: 24px;
        justify-content: center;
        width: 24px;
    }

    .CalendarDay--weekend .CalendarDay__number,
    .CalendarDay--holiday .CalendarDay__number,
    .CalendarDay__holiday {
        color: var(--color-danger);
    }

    .CalendarDay__holiday {
        font-size: 10px;
        font-weight: 750;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .CalendarDay--today .CalendarDay__number {
        background: var(--color-primary);
        border-radius: 50%;
        color: white;
    }

    .CalendarWeek__events {
        left: 0;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 38px;
    }

    .CalendarEvent {
        align-items: center;
        border: 0;
        border-left: 3px solid currentColor;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        font-size: 10px;
        font-weight: 700;
        height: 21px;
        overflow: hidden;
        padding: 0 6px;
        pointer-events: auto;
        position: absolute;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .CalendarEvent--scheduled { background: #fff7e3; color: #94600a; }
    .CalendarEvent--active { background: #e8f7f2; color: #08705a; }
    .CalendarEvent--completed { background: #eef0f3; color: #687180; }
    .CalendarEvent--continued { border-left: 0; }

    .CalendarEvent:hover,
    .CalendarEvent--highlighted {
        filter: brightness(0.96);
        outline: 1px solid currentColor;
        z-index: 2;
    }

    .LayeredDialog--details {
        margin: 0 auto;
        max-width: 680px;
        overflow: hidden;
    }

    .EventDetailsBody {
        display: grid;
        gap: 20px;
        padding: 22px 26px 26px;
    }

    .EventDetailsGrid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .EventDetailItem {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border-subtle);
        border-radius: 10px;
        display: grid;
        gap: 7px;
        min-width: 0;
        padding: 13px 14px;
    }

    .EventDetailItem--wide {
        grid-column: 1 / -1;
    }

    .EventDetailItem > span:first-child,
    .EventDetailsNotes > span,
    .EventDetailsCompletion > div > span:first-child {
        color: var(--color-text-muted);
        font-size: 11px;
        font-weight: 800;
    }

    .EventDetailItem strong {
        font-size: 13px;
        overflow-wrap: anywhere;
    }

    .EventDetailsCompletion {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .EventDetailsCompletion > div {
        align-items: center;
        border: 1px solid var(--color-border-subtle);
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        min-width: 0;
        padding: 11px 12px;
    }

    .EventDetailsNotes {
        border-top: 1px solid var(--color-border);
        padding-top: 18px;
    }

    .EventDetailsNotes p {
        background: var(--color-surface-muted);
        border-radius: 10px;
        line-height: 1.65;
        margin: 8px 0 0;
        max-height: 150px;
        overflow: auto;
        padding: 12px 14px;
        white-space: pre-wrap;
    }

    .StorageBanner {
        background: #fff0ee;
        border: 1px solid #ffd1cc;
        border-radius: 10px;
        color: #9f2f35;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 16px;
        padding: 11px 14px;
    }

    .LoadingState {
        align-items: center;
        display: flex;
        justify-content: center;
        min-height: 300px;
    }

    .PanelLayer {
        align-items: center;
        display: flex;
        inset: 0;
        justify-content: center;
        padding: 24px 28px;
        position: fixed;
        top: 42px;
    }

    .PanelLayer__backdrop {
        background: rgba(17, 24, 39, 0.5);
        border: 0;
        inset: 0;
        padding: 0;
        position: absolute;
    }

    .PanelLayer__content {
        max-height: calc(100vh - 90px);
        max-width: 760px;
        overflow: visible;
        position: relative;
        width: 100%;
    }

    .LayeredDialog {
        background: var(--color-panel);
        border: 2px solid var(--color-dialog-border);
        border-radius: 18px;
        box-shadow: 0 24px 80px rgba(12, 18, 28, 0.3);
        max-height: inherit;
        overflow: auto;
        position: relative;
    }

    .LayeredDialog--shake {
        animation: DialogShake 300ms ease;
    }

    @keyframes DialogShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        50% { transform: translateX(3px); }
        75% { transform: translateX(-1px); }
    }

    .KioskAvailabilityNotice {
        animation: AvailabilityNoticeLife 3s ease forwards;
        background: #c73842;
        border: 1px solid #e06a72;
        border-radius: 10px;
        box-shadow: 0 10px 28px rgba(104, 18, 27, 0.25);
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        left: 50%;
        max-width: calc(100% - 110px);
        padding: 10px 14px;
        pointer-events: none;
        position: absolute;
        text-align: center;
        top: 13px;
        transform: translateX(-50%);
        z-index: 10;
    }

    @keyframes AvailabilityNoticeLife {
        0% { opacity: 0; transform: translate(-50%, -7px); }
        8%, 72% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -4px); }
    }

    .LayeredDialog--editor {
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .LayeredDialog__header {
        align-items: flex-start;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        padding: 24px 26px 20px;
    }

    .LayeredDialog__header h2 { margin: 2px 0; }
    .IconButton {
        background: var(--color-surface-muted);
        border: 0;
        border-radius: 9px;
        font-size: 23px;
        height: 36px;
        line-height: 1;
        width: 36px;
    }

    .EventForm {
        min-height: 0;
        overflow-y: auto;
        padding: 22px 26px 24px;
        scroll-behavior: smooth;
        scrollbar-color: var(--color-dialog-border) transparent;
        scrollbar-width: thin;
    }

    .EventForm::-webkit-scrollbar { width: 10px; }
    .EventForm::-webkit-scrollbar-track { background: transparent; }
    .EventForm::-webkit-scrollbar-thumb {
        background: var(--color-dialog-border);
        background-clip: padding-box;
        border: 3px solid transparent;
        border-radius: 99px;
    }

    .LayeredDialog--editor .LayeredDialog__header { flex: 0 0 auto; }

    .LayeredDialog--settings {
        margin: 0 auto;
        max-width: 580px;
        overflow: hidden;
    }

    .KioskSettingsBody {
        max-height: min(680px, calc(100vh - 170px));
        overflow-y: auto;
        padding: 22px 26px 26px;
        scrollbar-color: var(--color-dialog-border) transparent;
        scrollbar-width: thin;
    }

    .KioskRegistrationForm {
        border-bottom: 1px solid var(--color-border);
        margin-bottom: 20px;
        padding-bottom: 20px;
    }

    .KioskRegistrationForm .FormField {
        margin-bottom: 0;
    }

    .KioskRegistrationForm__row {
        display: grid;
        gap: 10px;
        grid-template-columns: minmax(0, 1fr) auto;
    }

    .KioskRegistrationForm__row .Button {
        min-width: 76px;
    }

    .ManagedKioskListHeader {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 11px;
    }

    .ManagedKioskListHeader span {
        background: var(--color-primary-soft);
        border-radius: 99px;
        color: var(--color-primary);
        font-size: 12px;
        font-weight: 800;
        padding: 4px 9px;
    }

    .ManagedKioskList {
        display: grid;
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-color: var(--color-dialog-border) transparent;
        scrollbar-width: thin;
    }

    .ManagedKioskItem {
        align-items: center;
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border-subtle);
        border-radius: 10px;
        display: grid;
        gap: 11px;
        grid-template-columns: 30px minmax(0, 1fr) auto;
        min-height: 48px;
        padding: 7px 9px;
    }

    .ManagedKioskItem__index {
        align-items: center;
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        color: var(--color-text-muted);
        display: inline-flex;
        font-size: 11px;
        font-weight: 800;
        height: 28px;
        justify-content: center;
        width: 28px;
    }

    .ManagedKioskItem > button {
        background: transparent;
        border: 0;
        color: var(--color-danger);
        font-size: 12px;
        font-weight: 800;
        padding: 7px 8px;
    }

    .ManagedKioskItem > strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .BackupRestoreSection {
        border-top: 1px solid var(--color-border);
        margin-top: 22px;
        padding-top: 20px;
    }

    .BackupRestoreSection__header {
        align-items: flex-start;
        display: flex;
        gap: 18px;
        justify-content: space-between;
    }

    .BackupRestoreSection__header p {
        color: var(--color-text-muted);
        font-size: 12px;
        line-height: 1.55;
        margin: 5px 0 0;
    }

    .BackupRestoreEmpty,
    .BackupRestorePreview {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border-subtle);
        border-radius: 11px;
        margin-top: 13px;
        padding: 14px;
    }

    .BackupRestoreEmpty {
        color: var(--color-text-muted);
        font-size: 13px;
    }

    .BackupRestorePreview {
        display: grid;
        gap: 9px;
    }

    .BackupRestorePreview > strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .BackupRestorePreview > span,
    .BackupRestorePreview > div {
        color: var(--color-text-muted);
        display: flex;
        font-size: 12px;
        gap: 14px;
    }

    .BackupRestorePreview > button { justify-self: end; }
    .BackupRestoreMessage { font-size: 12px; margin: 0; }
    .BackupRestoreMessage--warning { color: var(--color-danger); font-weight: 750; }

    .ManagedKioskEmpty {
        align-items: center;
        background: var(--color-surface-muted);
        border: 1px dashed var(--color-border);
        border-radius: 11px;
        color: var(--color-text-muted);
        display: flex;
        justify-content: center;
        min-height: 110px;
    }

    .EventForm__grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .FormField {
        display: grid;
        gap: 7px;
        margin-bottom: 16px;
    }

    .FormField > span,
    .CheckGroup legend {
        font-size: 12px;
        font-weight: 800;
    }

    .FormField > span small {
        color: var(--color-primary);
        float: right;
        font-size: 11px;
    }

    .KioskSelectionGrid {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .KioskSelectionItem {
        align-items: center;
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        color: var(--color-text);
        display: flex;
        font-size: 12px;
        font-weight: 750;
        gap: 8px;
        min-height: 42px;
        overflow: hidden;
        padding: 7px 10px;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .KioskSelectionItem > span {
        align-items: center;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        display: inline-flex;
        flex: 0 0 auto;
        height: 22px;
        justify-content: center;
        width: 22px;
    }

    .KioskSelectionItem > strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .KioskSelectionItem--selected {
        background: var(--color-primary-soft);
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    .KioskSelectionItem--selected > span {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #ffffff;
    }

    .KioskSelectionItem--unavailable {
        background: var(--color-surface-muted);
        border-color: var(--color-border-subtle);
        color: var(--color-text-muted);
        cursor: not-allowed;
        opacity: 0.68;
    }

    .KioskSelectionItem--unavailable > span {
        background: transparent;
        border-color: currentColor;
        color: currentColor;
    }

    .KioskSelectionItem--rejected {
        animation: RejectedKioskFlash 1.35s ease-out;
    }

    @keyframes RejectedKioskFlash {
        0%, 12% {
            background: #ffdddd;
            border-color: #d63842;
            box-shadow: 0 0 0 3px rgba(214, 56, 66, 0.18);
            color: #b2222c;
            opacity: 1;
        }
        100% {
            background: var(--color-surface-muted);
            border-color: var(--color-border-subtle);
            box-shadow: 0 0 0 0 rgba(214, 56, 66, 0);
            color: var(--color-text-muted);
            opacity: 0.68;
        }
    }

    .KioskSelectionEmpty {
        align-items: center;
        background: var(--color-surface-muted);
        border: 1px dashed var(--color-border);
        border-radius: 10px;
        color: var(--color-text-muted);
        display: flex;
        font-size: 12px;
        justify-content: center;
        min-height: 58px;
    }

    .FormField input,
    .FormField textarea {
        min-height: 42px;
        padding: 9px 11px;
    }

    .LocalizedPickerRoot {
        position: relative;
    }

    .LocalizedPickerField {
        align-items: center;
        background: var(--color-surface-control);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        color: var(--color-text);
        cursor: pointer;
        display: flex;
        font-weight: 500;
        min-height: 42px;
        padding: 9px 11px;
        text-align: left;
        width: 100%;
    }

    .LocalizedPickerField--empty {
        color: var(--color-text-muted);
    }

    .LocalizedPickerField__icon {
        color: var(--color-text-muted);
        margin-left: auto;
    }

    .LocalizedPickerPopover {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        box-shadow: 0 18px 45px rgba(18, 27, 43, 0.2);
        padding: 14px;
        position: fixed;
        width: 320px;
        z-index: 1200;
    }

    .LocalizedPickerPopover--datetime {
        width: 340px;
    }

    .PickerHeader {
        align-items: center;
        display: grid;
        grid-template-columns: 34px 1fr 34px;
        margin-bottom: 10px;
        text-align: center;
    }

    .PickerHeader button,
    .PickerFooter button {
        background: transparent;
        border: 0;
        border-radius: 7px;
        color: var(--color-text-muted);
        font-weight: 750;
        min-height: 32px;
    }

    .PickerHeader button:hover,
    .PickerFooter button:hover {
        background: var(--color-primary-soft);
        color: var(--color-primary);
    }

    .PickerWeekdays,
    .PickerDays {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .PickerWeekdays {
        color: var(--color-text-muted);
        font-size: 11px;
        font-weight: 750;
        margin-bottom: 4px;
        text-align: center;
    }

    .PickerWeekdays span {
        padding: 6px 0;
    }

    .PickerDay {
        background: transparent;
        border: 0;
        border-radius: 8px;
        font-size: 12px;
        height: 34px;
        padding: 0;
    }

    .PickerDay:hover:not(:disabled) {
        background: var(--color-primary-soft);
        color: var(--color-primary);
    }

    .PickerDay--muted {
        color: #b5bbc4;
    }

    .PickerDay--today {
        box-shadow: inset 0 0 0 1px var(--color-primary);
        color: var(--color-primary);
    }

    .PickerDay--selected {
        background: var(--color-primary);
        color: white;
        font-weight: 800;
    }

    .PickerDay:disabled {
        color: #d9dde3;
        cursor: not-allowed;
    }

    .PickerTime {
        border-top: 1px solid var(--color-border);
        display: grid;
        gap: 8px;
        grid-template-columns: 1fr 1fr;
        margin-top: 10px;
        padding-top: 12px;
    }

    .TimeComboBox { position: relative; }

    .TimeComboBox > button {
        align-items: center;
        background: var(--color-surface-control);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        min-height: 36px;
        padding: 0 9px;
        width: 100%;
    }

    .TimeComboBox__list {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        bottom: calc(100% + 4px);
        border-radius: 8px;
        box-shadow: 0 12px 30px rgba(18, 27, 43, 0.18);
        left: 0;
        max-height: 180px;
        overflow-y: auto;
        padding: 4px;
        position: absolute;
        top: auto;
        width: 100%;
        z-index: 40;
    }

    .TimeComboBox__list button {
        background: transparent;
        border: 0;
        border-radius: 6px;
        display: block;
        font-size: 12px;
        min-height: 30px;
        text-align: left;
        width: 100%;
    }

    .TimeComboBox__list button:hover,
    .TimeComboBox__list .TimeComboBox__option--selected {
        background: var(--color-primary-soft);
        color: var(--color-primary);
        font-weight: 800;
    }

    .PickerFooter {
        border-top: 1px solid var(--color-border);
        display: flex;
        gap: 3px;
        justify-content: flex-end;
        margin-top: 10px;
        padding-top: 9px;
    }

    .PickerFooter .PickerFooter__apply {
        background: var(--color-primary);
        color: white;
        padding: 0 12px;
    }

    .PickerFooter button:first-child { margin-left: auto; }

    .FormField textarea { resize: vertical; }
    .FormField--wide { grid-column: 1 / -1; }

    .CheckGroup {
        border: 1px solid var(--color-border);
        border-radius: 12px;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin: 0 0 16px;
        padding: 14px;
    }

    .CheckGroup legend { padding: 0 4px; }

    .CheckField {
        align-items: center;
        display: flex;
        font-size: 12px;
        font-weight: 650;
        gap: 7px;
    }

    .CheckField input { accent-color: var(--color-primary); height: 16px; width: 16px; }

    .FormError {
        background: #fff0ee;
        border-radius: 8px;
        color: #a93238;
        font-size: 13px;
        padding: 10px 12px;
    }

    .LayeredDialog__footer {
        display: flex;
        gap: 9px;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .LayeredDialog--confirm {
        margin: 0 auto;
        max-width: 430px;
        padding: 30px;
        text-align: center;
    }

    .LayeredDialog--confirm h2 { margin: 14px 0 9px; }
    .LayeredDialog--confirm p { color: var(--color-text-muted); margin: 6px 0; }
    .LayeredDialog--confirm .DeleteConfirmLabel { color: var(--color-text); font-weight: 800; }
    .LayeredDialog--confirm .LayeredDialog__footer { justify-content: center; }

    .DeleteConfirmIcon {
        align-items: center;
        background: #fff0ee;
        border-radius: 50%;
        color: var(--color-danger);
        display: flex;
        font-size: 24px;
        font-weight: 900;
        height: 58px;
        justify-content: center;
        margin: 0 auto;
        width: 58px;
    }

    [data-theme="dark"] .StatusBadge--scheduled,
    [data-theme="dark"] .CalendarEvent--scheduled,
    [data-theme="dark"] .MobileCalendarEvent--scheduled {
        background: #453715;
        color: #ffd477;
    }

    [data-theme="dark"] .StatusBadge--completed,
    [data-theme="dark"] .CalendarEvent--completed,
    [data-theme="dark"] .MobileCalendarEvent--completed,
    [data-theme="dark"] .CompletionChip {
        background: #2a3442;
        color: #b6c0cd;
    }

    [data-theme="dark"] .StatusBadge--active,
    [data-theme="dark"] .CalendarEvent--active,
    [data-theme="dark"] .MobileCalendarEvent--active,
    [data-theme="dark"] .CompletionChip--done {
        background: #153d35;
        color: #72dec3;
    }

    [data-theme="dark"] .CompletionChip--attention,
    [data-theme="dark"] .StorageBanner,
    [data-theme="dark"] .FormError,
    [data-theme="dark"] .DeleteConfirmIcon {
        background: #49282d;
        border-color: #6b363d;
        color: #ff9ca1;
    }


    @media (max-width: 1279px) {
        .OperationsBasePanel { padding: 24px 28px 36px; }
        .CheckGroup { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .CalendarDay { min-height: 88px; }
    }

    @media (max-width: 767px) {
        html[data-runtime="web"] .OperationsBasePanel {
            padding: 18px 14px 32px;
        }

        html[data-runtime="web"] .HeaderSection {
            align-items: stretch;
            flex-direction: column;
            gap: 18px;
            margin-bottom: 20px;
        }

        html[data-runtime="web"] .HeaderSection h1 {
            font-size: 27px;
            margin-top: 0;
        }

        html[data-runtime="web"] .HeaderActions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
        }

        html[data-runtime="web"] .HeaderActions > button {
            justify-content: center;
            min-width: 0;
            padding-left: 10px;
            padding-right: 10px;
            width: 100%;
        }

        html[data-runtime="web"] .SummarySection {
            gap: 9px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-bottom: 16px;
        }

        html[data-runtime="web"] .SummaryCard {
            min-height: 92px;
            padding: 16px;
        }

        html[data-runtime="web"] .SummaryCard p {
            font-size: 12px;
            margin-bottom: 6px;
        }

        html[data-runtime="web"] .SummaryCard strong { font-size: 27px; }

        html[data-runtime="web"] .ViewNavigationSection {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            width: 100%;
        }

        html[data-runtime="web"] .ViewTab {
            gap: 3px;
            justify-content: center;
            padding: 0 5px;
        }

        html[data-runtime="web"] .ViewTab > span { display: none; }

        html[data-runtime="web"] .ContentSection {
            border-radius: 14px;
            min-height: 320px;
        }

        html[data-runtime="web"] .ContentSection__toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 14px;
            min-height: 0;
            padding: 17px 16px;
        }

        html[data-runtime="web"] .ProgressStatusFilter {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            width: 100%;
        }

        html[data-runtime="web"] .ProgressStatusFilter__button {
            padding-left: 5px;
            padding-right: 5px;
        }

        html[data-runtime="web"] .TableViewport { padding: 12px; }
        html[data-runtime="web"] table,
        html[data-runtime="web"] tbody { display: block; }
        html[data-runtime="web"] thead { display: none; }
        html[data-runtime="web"] tbody {
            display: grid;
            gap: 12px;
        }

        html[data-runtime="web"] tbody tr {
            background: var(--color-panel);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            display: block;
            overflow: hidden;
        }

        html[data-runtime="web"] tbody td {
            align-items: center;
            border-top: 1px solid var(--color-border-subtle);
            display: flex;
            gap: 12px;
            justify-content: space-between;
            min-height: 46px;
            padding: 10px 12px;
            text-align: right;
            white-space: normal;
            width: auto !important;
        }

        html[data-runtime="web"] tbody td:first-child { border-top: 0; }
        html[data-runtime="web"] tbody td::before {
            color: var(--color-text-muted);
            content: attr(data-label);
            flex: 0 0 92px;
            font-size: 11px;
            font-weight: 800;
            text-align: left;
        }

        html[data-runtime="web"] .EventIdentityCell,
        html[data-runtime="web"] .AssignedKiosksCell,
        html[data-runtime="web"] .CompletedLedgerTable__identity {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
        }

        html[data-runtime="web"] .EventIdentityCell::before,
        html[data-runtime="web"] .AssignedKiosksCell::before,
        html[data-runtime="web"] .CompletedLedgerTable__identity::before {
            grid-row: 1 / 3;
        }

        html[data-runtime="web"] .EventIdentityCell > *,
        html[data-runtime="web"] .AssignedKiosksCell > *,
        html[data-runtime="web"] .CompletedLedgerTable__identity > * {
            grid-column: 2;
            justify-self: end;
            max-width: 100%;
        }

        html[data-runtime="web"] .EventScheduleCell > span { text-align: right; }
        html[data-runtime="web"] .TableActions { justify-content: flex-end; }

        html[data-runtime="web"] .CalendarGrid--weekdays,
        html[data-runtime="web"] .CalendarWeeks { display: none; }

        html[data-runtime="web"] .MobileCalendarAgenda {
            display: grid;
            gap: 10px;
            padding: 12px;
        }

        html[data-runtime="web"] .MobileCalendarAgenda__empty {
            color: var(--color-text-muted);
            margin: 36px 0;
            text-align: center;
        }

        html[data-runtime="web"] .MobileCalendarDay {
            border: 1px solid var(--color-border);
            border-radius: 12px;
            overflow: hidden;
        }

        html[data-runtime="web"] .MobileCalendarDay--today { border-color: var(--color-primary); }
        html[data-runtime="web"] .MobileCalendarDay > header {
            align-items: center;
            background: var(--color-surface-muted);
            display: flex;
            justify-content: space-between;
            padding: 10px 12px;
        }

        html[data-runtime="web"] .MobileCalendarDay > header span {
            background: var(--color-primary);
            border-radius: 99px;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 7px;
        }

        html[data-runtime="web"] .MobileCalendarDay__date {
            align-items: baseline;
            display: flex;
            gap: 7px;
            min-width: 0;
        }

        html[data-runtime="web"] .MobileCalendarDay__date--holiday strong,
        html[data-runtime="web"] .MobileCalendarDay__date--holiday small {
            color: var(--color-danger);
        }

        html[data-runtime="web"] .MobileCalendarDay__date small {
            font-size: 10px;
            font-weight: 750;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        html[data-runtime="web"] .MobileCalendarDay > p {
            color: var(--color-text-muted);
            font-size: 12px;
            margin: 0;
            padding: 14px 12px;
        }

        html[data-runtime="web"] .MobileCalendarDay__events {
            display: grid;
            gap: 7px;
            padding: 10px;
        }

        html[data-runtime="web"] .MobileCalendarEvent {
            border: 0;
            border-left: 4px solid currentColor;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 750;
            min-height: 40px;
            overflow: hidden;
            padding: 8px 10px;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        html[data-runtime="web"] .MobileCalendarEvent--scheduled { background: #fff7e3; color: #94600a; }
        html[data-runtime="web"] .MobileCalendarEvent--active { background: #e8f7f2; color: #08705a; }
        html[data-runtime="web"] .MobileCalendarEvent--completed { background: #eef0f3; color: #687180; }

        html[data-runtime="web"] .PanelLayer {
            align-items: stretch;
            padding: 8px;
        }

        html[data-runtime="web"] .PanelLayer__content {
            max-height: calc(100vh - 58px);
            max-width: none;
        }

        html[data-runtime="web"] .LayeredDialog {
            border-radius: 14px;
            max-height: calc(100vh - 58px);
        }

        html[data-runtime="web"] .LayeredDialog__header { padding: 18px 16px 15px; }
        html[data-runtime="web"] .EventForm,
        html[data-runtime="web"] .KioskSettingsBody,
        html[data-runtime="web"] .EventDetailsBody { padding: 16px; }

        html[data-runtime="web"] .EventForm__grid,
        html[data-runtime="web"] .EventDetailsGrid,
        html[data-runtime="web"] .EventDetailsCompletion,
        html[data-runtime="web"] .KioskRegistrationForm__row,
        html[data-runtime="web"] .BackupRestoreSection__header {
            grid-template-columns: 1fr;
        }

        html[data-runtime="web"] .BackupRestoreSection__header {
            align-items: stretch;
            flex-direction: column;
        }

        html[data-runtime="web"] .KioskSelectionGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        html[data-runtime="web"] .CheckGroup { grid-template-columns: 1fr; }
        html[data-runtime="web"] .FormField--wide,
        html[data-runtime="web"] .EventDetailItem--wide { grid-column: auto; }

        html[data-runtime="web"] .LocalizedPickerPopover,
        html[data-runtime="web"] .LocalizedPickerPopover--datetime {
            left: 12px !important;
            max-height: calc(100vh - 82px);
            overflow-y: auto;
            right: 12px !important;
            top: 54px !important;
            width: auto;
        }

        html[data-runtime="web"] .LayeredDialog__footer {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        html[data-runtime="web"] .LayeredDialog__footer .Button { width: 100%; }
        html[data-runtime="web"] .LayeredDialog--confirm { padding: 24px 18px; }
    }
`;

export function OperationsBasePanel(Properties: OperationsBasePanelProps)
{
    const Controller = UseOperationsBasePanelController();
    const Layers: PanelLayerItem[] = [];

    if (Controller.IsReady === false)
    {
        return <AppLoadingState Message={Strings.Loading} />;
    }

    if (Controller.LayeredPanel?.Kind === 'event-editor')
    {
        Layers.push({
            Id: 'event-editor',
            Dismissible: true,
            OnRequestClose: Controller.CloseLayeredPanel,
            Content: (
                <EventEditorLayeredPanel
                    Kiosks={Controller.ManagedKiosks}
                    Records={Controller.Records}
                    OnComplete={Controller.SaveEvent}
                    OnRequestClose={Controller.CloseLayeredPanel}
                    Record={Controller.LayeredPanel.Record}
                />
            ),
        });
    }
    else if (Controller.LayeredPanel?.Kind === 'delete-confirm')
    {
        Layers.push({
            Id: 'delete-confirm',
            Dismissible: true,
            OnRequestClose: Controller.CloseLayeredPanel,
            Content: (
                <DeleteConfirmLayeredPanel
                    OnConfirm={Controller.DeleteEvent}
                    OnRequestClose={Controller.CloseLayeredPanel}
                    RecordLabel={Controller.LayeredPanel.RecordLabel}
                />
            ),
        });
    }
    else if (Controller.LayeredPanel?.Kind === 'kiosk-settings')
    {
        Layers.push({
            Id: 'kiosk-settings',
            Dismissible: true,
            OnRequestClose: Controller.CloseLayeredPanel,
            Content: (
                <KioskSettingsLayeredPanel
                    Kiosks={Controller.ManagedKiosks}
                    OnAddKiosk={Controller.AddManagedKiosk}
                    OnDeleteKiosk={Controller.DeleteManagedKiosk}
                    OnRestoreBackup={Controller.RestoreBackup}
                    OnRequestClose={Controller.CloseLayeredPanel}
                    OnSelectBackupFile={Controller.SelectBackupFile}
                />
            ),
        });
    }
    else if (Controller.LayeredPanel?.Kind === 'event-details')
    {
        Layers.push({
            Id: 'event-details',
            Dismissible: true,
            OnRequestClose: Controller.CloseLayeredPanel,
            Content: (
                <EventDetailsLayeredPanel
                    Kiosks={Controller.ManagedKiosks}
                    OnRequestClose={Controller.CloseLayeredPanel}
                    Record={Controller.LayeredPanel.Record}
                />
            ),
        });
    }

    return (
        <main
            className="OperationsBasePanel"
            data-ue-page="OperationsBasePanel"
        >
            <style>{OperationsBasePanelStyles}</style>
            <HeaderSection
                OnAddEvent={Controller.OpenCreateEvent}
                OnOpenSettings={Controller.OpenKioskSettings}
                OnSignOut={Properties.OnSignOut}
                OnToggleTheme={Properties.OnToggleTheme}
                Theme={Properties.Theme}
                TodayKey={Controller.TodayKey}
            />
            <SummarySection Summary={Controller.Summary} />
            <ViewNavigationSection
                CurrentView={Controller.CurrentView}
                OnChangeView={Controller.SetCurrentView}
            />

            {Controller.StorageError != null && (
                <div className="StorageBanner" role="alert">{Controller.StorageError}</div>
            )}

            {Controller.CurrentView === 'ledger' && (
                <EventLedgerSection
                    HasAnyRecords={Controller.Records.some((Record) => Record.OperationalStatus !== 'completed')}
                    Kiosks={Controller.ManagedKiosks}
                    OnAddEvent={Controller.OpenCreateEvent}
                    OnChangeFilter={Controller.SetStatusFilter}
                    OnDelete={Controller.OpenDeleteEvent}
                    OnEdit={Controller.OpenEditEvent}
                    OnToggleCompletion={Controller.ToggleEventCompletion}
                    Records={Controller.FilteredRecords}
                    StatusFilter={Controller.StatusFilter}
                />
            )}
            {Controller.CurrentView === 'calendar' && (
                <CalendarSection
                    Days={Controller.CalendarDays}
                    Holidays={Controller.CalendarHolidays}
                    MonthKey={Controller.CalendarMonth}
                    OnMoveMonth={Controller.MoveCalendarMonth}
                    OnMoveToToday={Controller.MoveCalendarToToday}
                    OnOpenEvent={Controller.OpenEventDetails}
                />
            )}
            {Controller.CurrentView === 'completed' && (
                <CompletedLedgerSection
                    OnToggleCompletion={Controller.ToggleEventCompletion}
                    Records={Controller.CompletedRecords}
                />
            )}

            <PanelLayerHost Layers={Layers} />
        </main>
    );
}
