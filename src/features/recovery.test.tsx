import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { AppProvider } from '../app/AppContext';
import { api } from '../domain/api';
import { auth } from '../domain/auth';
import type { User } from '../domain/types';
import { theme } from '../theme';
import { UserDetailPage } from './UserDetailPage';
import { ProjectFormPage } from './ProjectFormPage';

const alpha: User = { id: 'user-1', name: 'Alpha Member', email: 'alpha@example.com', role: 'viewer', status: 'active', createdAt: '2026-01-01' };
function renderPage(element: React.ReactNode, path: string, initial: string) {
  const router = createMemoryRouter([{ path, element }], { initialEntries: [initial] });
  render(<ThemeProvider theme={theme}><AppProvider><RouterProvider router={router} /></AppProvider></ThemeProvider>);
  return router;
}
describe('record loading and recovery', () => {
  beforeEach(async () => { localStorage.clear(); sessionStorage.clear(); await auth.login('admin@example.com', 'Demo123!'); await api.reset(); });
  it('retries a failed detail request without reloading the application', async () => {
    vi.spyOn(api, 'getUser').mockRejectedValueOnce(new Error('Connection interrupted')).mockResolvedValueOnce(alpha);
    renderPage(<UserDetailPage />, '/users/:id', '/users/user-1');
    expect(await screen.findByText('Connection interrupted')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: alpha.name })).toBeInTheDocument();
  });
  it('does not let an old route response replace the current detail', async () => {
    let resolveAlpha!: (value: User) => void;
    let resolveBeta!: (value: User) => void;
    const pendingAlpha = new Promise<User>(resolve => { resolveAlpha = resolve; });
    const pendingBeta = new Promise<User>(resolve => { resolveBeta = resolve; });
    const get = vi.spyOn(api, 'getUser').mockImplementation(id => id === 'user-1' ? pendingAlpha : pendingBeta);
    const router = renderPage(<UserDetailPage />, '/users/:id', '/users/user-1');
    await waitFor(() => expect(get).toHaveBeenCalledWith('user-1'));
    await act(async () => { await router.navigate('/users/user-2'); });
    await act(async () => { resolveBeta({ ...alpha, id: 'user-2', name: 'Beta Member' }); });
    expect(await screen.findByRole('heading', { name: 'Beta Member' })).toBeInTheDocument();
    await act(async () => { resolveAlpha(alpha); });
    expect(screen.queryByRole('heading', { name: alpha.name })).not.toBeInTheDocument();
  });
  it('waits for owners before rendering the project create form', async () => {
    let resolveOwners!: (value: { id: string; name: string }[]) => void;
    vi.spyOn(api, 'listOwners').mockImplementation(() => new Promise(resolve => { resolveOwners = resolve; }));
    renderPage(<ProjectFormPage />, '/projects/new', '/projects/new');
    expect(await screen.findByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
    await act(async () => { resolveOwners([{ id: 'user-1', name: 'Alex Morgan' }]); });
    expect(await screen.findByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });
});
