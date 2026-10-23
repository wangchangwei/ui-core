import { useMemo, useState } from 'react';
import { Button, IconButton, MenuItem, Stack, TextField, Tooltip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Link as RouterLink } from 'react-router-dom';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { api } from '../domain/api';
import type { User } from '../domain/types';
import { useApp } from '../app/AppContext';
import { DataTable } from '../shared/DataTable';
import { AsyncState, ConfirmDialog, FilterBar, PageLayout, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
export function UsersPage() {
    const { settings, notify } = useApp();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const [chosenPageSize, setPageSize] = useState<number | null>(null);
    const pageSize = chosenPageSize ?? settings.pageSize;
    const [sort, setSort] = useState<GridSortModel>([]);
    const [selection, setSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
    const [confirm, setConfirm] = useState(false);
    const [pending, setPending] = useState(false);
    const query = { search, role, status, page: page + 1, pageSize, sortBy: sort[0]?.field, sortDirection: sort[0]?.sort ?? undefined };
    const { data, loading, error, reload } = useAsync(() => api.listUsers(query), [query]);
    const clearSelection = () => setSelection({ type: 'include', ids: new Set() });
    const resetFilters = (update: () => void) => { update(); setPage(0); clearSelection(); };
    const columns = useMemo<GridColDef<User>[]>(() => [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 170 },
        { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 210 },
        { field: 'role', headerName: 'Role', width: 110, renderCell: ({ row }) => <StatusBadge status={row.role}/> },
        { field: 'status', headerName: 'Status', width: 130, renderCell: ({ row }) => <StatusBadge status={row.status}/> },
        { field: 'actions', headerName: 'Actions', sortable: false, width: 100, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Tooltip title="View user"><IconButton component={RouterLink} to={`/users/${row.id}`} aria-label={`View ${row.name}`} size="small"><VisibilityOutlined fontSize="small"/></IconButton></Tooltip><Tooltip title="Edit user"><IconButton component={RouterLink} to={`/users/${row.id}/edit`} aria-label={`Edit ${row.name}`} size="small"><EditOutlined fontSize="small"/></IconButton></Tooltip></Stack> },
    ], []);
    const remove = async () => {
        if (pending)
            return;
        setPending(true);
        try {
            await api.deleteUsers(Array.from(selection.ids, String));
            if (page > 0 && selection.ids.size >= (data?.items.length ?? 0))
                setPage(page - 1);
            clearSelection();
            setConfirm(false);
            reload();
            notify('Users deleted');
        }
        catch (error) {
            setConfirm(false);
            notify(error instanceof Error ? error.message : 'Unable to delete users', 'error');
        }
        finally {
            setPending(false);
        }
    };
    return <PageLayout title="Users" description="Manage workspace members and access." actions={<Button component={RouterLink} to="/users/new" variant="contained" startIcon={<Add />}>Add user</Button>}>
    <FilterBar>
      <TextField label="Search users" placeholder="Search by name or email" value={search} onChange={event => resetFilters(() => setSearch(event.target.value))}/>
      <TextField select label="Role" value={role} onChange={event => resetFilters(() => setRole(event.target.value))}><MenuItem value="">All roles</MenuItem>{['admin', 'editor', 'viewer'].map(value => <MenuItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem>)}</TextField>
      <TextField select label="Status" value={status} onChange={event => resetFilters(() => setStatus(event.target.value))}><MenuItem value="">All statuses</MenuItem>{['active', 'invited', 'suspended'].map(value => <MenuItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem>)}</TextField>
      <Button color="error" disabled={!selection.ids.size} startIcon={<DeleteOutlined />} onClick={() => setConfirm(true)}>Delete selected{selection.ids.size ? ` (${selection.ids.size})` : ''}</Button>
    </FilterBar>
    <AsyncState loading={!data && loading} error={error} onRetry={reload}>
      <DataTable rows={data?.items ?? []} columns={columns} rowCount={data?.total ?? 0} loading={loading} paginationMode="server" sortingMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={model => { setPage(model.page); setPageSize(model.pageSize); clearSelection(); }} sortModel={sort} onSortModelChange={model => resetFilters(() => setSort(model))} rowSelectionModel={selection} onRowSelectionModelChange={setSelection} checkboxSelection/>
    </AsyncState>
    <ConfirmDialog open={confirm} title="Delete selected users?" description="This action cannot be undone. Users assigned to projects cannot be deleted; remove their project assignments first." onClose={() => setConfirm(false)} onConfirm={() => void remove()} pending={pending} destructive/>
  </PageLayout>;
}
