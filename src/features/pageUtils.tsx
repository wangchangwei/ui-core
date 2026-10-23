import type { ReactNode } from 'react';
import { Stack } from '@mui/material';
import { AsyncState } from '../shared/ui';
import type { ProjectStatus, UserRole, UserStatus } from '../domain/types';
export const statusLabels: Record<ProjectStatus | UserStatus | UserRole, string> = {
    active: 'Active', planned: 'Planned', 'on-hold': 'On hold', completed: 'Completed',
    invited: 'Invited', suspended: 'Suspended', admin: 'Admin', editor: 'Editor', viewer: 'Viewer',
};
export function EmptyState({ title, description, action }: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return <Stack><AsyncState empty emptyTitle={title} emptyDescription={description}/>{action}</Stack>;
}
export function ErrorState({ message, onRetry }: {
    message: string;
    onRetry?: () => void;
}) {
    return <AsyncState error={message} onRetry={onRetry}/>;
}
export function LoadingState() { return <AsyncState loading/>; }
