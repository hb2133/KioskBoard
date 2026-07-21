import type { AppTheme } from '@/core/config/AppTheme';

export interface OperationsBasePanelProps
{
    Theme: AppTheme;
    OnToggleTheme: () => void;
}
