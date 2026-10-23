import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AsyncState, ConfirmDialog, FormField, StatusBadge } from './ui';
import { useForm } from 'react-hook-form';
import { MenuItem } from '@mui/material';
describe('shared page patterns', () => {
    it('explains an empty result and offers recovery from a failed request', async () => {
        const retry = vi.fn();
        const { rerender } = render(<AsyncState empty emptyTitle="No projects found"><div>Records</div></AsyncState>);
        expect(screen.getByText('No projects found')).toBeInTheDocument();
        expect(screen.queryByText('Records')).not.toBeInTheDocument();
        rerender(<AsyncState error="Request failed" onRetry={retry}/>);
        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(retry).toHaveBeenCalledOnce();
    });
    it('locks destructive confirmation while a mutation is pending', () => {
        render(<ConfirmDialog open pending title="Delete project?" description="This removes the project." onConfirm={vi.fn()} onClose={vi.fn()} destructive/>);
        expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
    it('uses a text label for status instead of relying on color', () => {
        render(<StatusBadge status="on-hold"/>);
        expect(screen.getByText('On hold')).toBeInTheDocument();
    });
    it('preserves numeric select values for validated settings forms', async () => {
        const saved = vi.fn();
        function Form() {
            const { control, handleSubmit } = useForm<{
                pageSize: number;
            }>({ defaultValues: { pageSize: 25 } });
            return <form onSubmit={handleSubmit(saved)}><FormField name="pageSize" control={control} label="Page size" select><MenuItem value={25}>25 rows</MenuItem><MenuItem value={50}>50 rows</MenuItem></FormField><button type="submit">Save</button></form>;
        }
        render(<Form />);
        await userEvent.click(screen.getByRole('combobox', { name: 'Page size' }));
        await userEvent.click(screen.getByRole('option', { name: '50 rows' }));
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(saved.mock.calls[0]?.[0]).toEqual({ pageSize: 50 });
    });
});
