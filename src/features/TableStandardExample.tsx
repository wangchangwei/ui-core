import { useRef, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Close from '@mui/icons-material/Close';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { createExampleService, exampleCategories, exampleResourceSchema, type ExampleResource, type ExampleResourceInput } from '../domain/page-standard-example';
import { DataTable } from '../shared/DataTable';
import { AsyncState, ConfirmDialog, DetailRow, FilterBar, PageLayout, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useApp } from '../app/AppContext';

const emptyDraft: ExampleResourceInput = { name: '', categoryId: 'campaigns', tag: 'Internal', status: 'planned' };
export function TableStandardExample() {
  const [service] = useState(createExampleService);
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [parentId, setParentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 25 });
  const [sort, setSort] = useState<GridSortModel>([{ field: 'updatedAt', sort: 'desc' }]);
  const [selection, setSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [preview, setPreview] = useState<ExampleResource | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const mutationLock = useRef(false);
  const createSubmitted = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const query = { search, parentId, categoryId, tag, status, ...pagination, sortBy: sort[0]?.field ?? 'updatedAt', sortDirection: sort[0]?.sort ?? 'desc' };
  const result = useAsync(() => service.list(query), [query]);
  const parent = exampleCategories.find(item => item.id === parentId);
  const filtered = Boolean(search || parentId || tag || status);
  const clearSelection = () => setSelection({ type: 'include', ids: new Set() });
  const change = (update: () => void) => { update(); setPagination(value => ({ ...value, page: 0 })); clearSelection(); };
  const clearFilters = () => change(() => { setSearch(''); setParentId(''); setCategoryId(''); setTag(''); setStatus(''); });
  const mutate = async (work: () => Promise<void>) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    try { await work(); result.reload(); clearSelection(); }
    catch (error) { notify(error instanceof Error ? error.message : 'Unable to update example.', 'error'); }
    finally { setPending(false); mutationLock.current = false; }
  };
  const save = () => {
    if (createSubmitted.current) return;
    const parsed = exampleResourceSchema.safeParse(draft);
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? 'Check your input.'); nameRef.current?.focus(); return; }
    createSubmitted.current = true;
    void mutate(async () => {
      try { await service.create(parsed.data); setCreating(false); clearFilters(); notify('Example resource created'); }
      catch (error) { createSubmitted.current = false; throw error; }
    });
  };
  const columns: GridColDef<ExampleResource>[] = [
    { field: 'name', headerName: 'Name', minWidth: 190, flex: 1.4 },
    { field: 'categoryId', headerName: 'Category', minWidth: 170, flex: 1, sortable: false,
      renderCell: ({ row }) => { const branch = exampleCategories.find(item => item.children.some(child => child.id === row.categoryId)); return <Typography variant="body2">{branch?.label} / {branch?.children.find(item => item.id === row.categoryId)?.label}</Typography>; } },
    { field: 'tag', headerName: 'Tag', width: 120, sortable: false, renderCell: ({ row }) => <Chip label={row.tag} variant="outlined"/> },
    { field: 'status', headerName: 'Status', width: 120, sortable: false, renderCell: ({ row }) => <StatusBadge status={row.status}/> },
    { field: 'updatedAt', headerName: 'Updated', width: 120 },
    { field: 'actions', headerName: 'Actions', width: 112, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ gap: 1 }}>
      <Tooltip title="View resource"><IconButton size="small" aria-label={`View ${row.name}`} onClick={() => setPreview(row)}><VisibilityOutlined fontSize="small"/></IconButton></Tooltip>
      <Tooltip title="Delete resource"><IconButton size="small" aria-label={`Delete ${row.name}`} disabled={pending} onClick={() => setDeleteIds([row.id])}><DeleteOutlined fontSize="small"/></IconButton></Tooltip>
    </Stack> },
  ];
  const categoryButton = (id: string, label: string, selected: boolean, onClick: () => void) => <Button key={id} variant="category" aria-pressed={selected} disabled={pending} onClick={onClick}>{label}<Typography component="span" variant="body2" color={selected ? 'inherit' : 'text.secondary'} sx={{ ml: 2 }}>{result.data?.counts[id] ?? '—'}</Typography></Button>;
  return <PageLayout title="Resource library" description="Manage resources, categories, and access." actions={
    <Button variant="contained" startIcon={<Add/>} onClick={() => { createSubmitted.current = false; setDraft(emptyDraft); setFormError(''); setCreating(true); }}>Create resource</Button>
  }>
    <Stack direction="row" role="group" aria-label="Primary category" sx={{ gap: 2, flexWrap: 'wrap' }}>
      {categoryButton('all', 'All', !parentId, () => change(() => { setParentId(''); setCategoryId(''); }))}
      {exampleCategories.map(item => categoryButton(item.id, item.label, parentId === item.id, () => change(() => { setParentId(item.id); setCategoryId(''); })))}
    </Stack>
    {parent && <Stack direction="row" role="group" aria-label="Secondary category" sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap', pl: 4, borderLeft: 1, borderColor: 'divider' }}>
      <Typography color="text.secondary">{parent.label} /</Typography>
      {categoryButton(parent.id, `All ${parent.label.toLowerCase()}`, !categoryId, () => change(() => setCategoryId('')))}
      {parent.children.map(item => categoryButton(item.id, item.label, categoryId === item.id, () => change(() => setCategoryId(item.id))))}
    </Stack>}
    <FilterBar>
      <TextField inputRef={searchRef} label="Search resources" placeholder="Search by name" value={search} onChange={event => change(() => setSearch(event.target.value))} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => { change(() => setSearch('')); searchRef.current?.focus(); }}><Close fontSize="small"/></IconButton></InputAdornment> : undefined } }}/>
      <TextField label="Tag" select value={tag} onChange={event => change(() => setTag(event.target.value))}><MenuItem value="">All tags</MenuItem>{['Enterprise', 'Internal'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField label="Status" select value={status} onChange={event => change(() => setStatus(event.target.value))}><MenuItem value="">All statuses</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="planned">Planned</MenuItem></TextField>
      <Button variant="outlined" disabled={!filtered} onClick={clearFilters}>Clear filters</Button>
    </FilterBar>
    {filtered && <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }} aria-label="Active filters">
      {parent && <Chip label={parent.label + (categoryId ? ` / ${parent.children.find(item => item.id === categoryId)?.label}` : '')} onDelete={() => change(() => { setParentId(''); setCategoryId(''); })}/>}
      {tag && <Chip label={`Tag: ${tag}`} onDelete={() => change(() => setTag(''))}/>}
      {status && <Chip label={`Status: ${status}`} onDelete={() => change(() => setStatus(''))}/>}
      {search && <Chip label={`Search: ${search}`} onDelete={() => change(() => setSearch(''))}/>}
    </Stack>}
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" role="status">{result.data ? `${result.data.total} resource${result.data.total === 1 ? '' : 's'}` : 'Loading resources…'}</Typography>
      <Stack direction="row" sx={{ gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">{selection.ids.size} selected</Typography>
        <Button color="error" disabled={!selection.ids.size || pending} startIcon={<DeleteOutlined/>} onClick={() => setDeleteIds(Array.from(selection.ids, String))}>Delete selected</Button>

      </Stack>
    </Stack>
    <AsyncState loading={!result.data && result.loading} error={result.error} onRetry={result.reload}>
      <DataTable aria-label="Resource library example" rows={result.data?.items ?? []} columns={columns} checkboxSelection loading={result.loading} paginationMode="server" sortingMode="server" rowCount={result.data?.total ?? 0}
        paginationModel={pagination} onPaginationModelChange={value => { setPagination({ ...value, page: value.pageSize !== pagination.pageSize ? 0 : value.page }); clearSelection(); }}
        sortModel={sort} onSortModelChange={value => change(() => setSort(value))} sortingOrder={['asc', 'desc']}
        rowSelectionModel={selection} onRowSelectionModelChange={setSelection}/>
    </AsyncState>
    <ConfirmDialog open={!!deleteIds.length} title="Delete resources?" description={`Remove ${deleteIds.length} selected resource${deleteIds.length === 1 ? '' : 's'} from this collection.`} destructive pending={pending} onClose={() => setDeleteIds([])} onConfirm={() => void mutate(async () => { await service.remove(deleteIds); if (pagination.page > 0 && deleteIds.length >= (result.data?.items.length ?? 0)) setPagination(value => ({ ...value, page: value.page - 1 })); setDeleteIds([]); notify('Example resources deleted'); })}/>
    <Dialog open={!!preview} onClose={() => setPreview(null)} aria-labelledby="example-detail-title" maxWidth="sm">
      <DialogTitle id="example-detail-title">{preview?.name}</DialogTitle><DialogContent>{preview && <Box component="dl" sx={{ m: 0 }}><DetailRow label="Category">{(() => { const branch = exampleCategories.find(item => item.children.some(child => child.id === preview.categoryId)); const category = branch?.children.find(item => item.id === preview.categoryId); return [branch?.label, category?.label].filter(Boolean).join(' / '); })()}</DetailRow><DetailRow label="Tag">{preview.tag}</DetailRow><DetailRow label="Status"><StatusBadge status={preview.status}/></DetailRow><DetailRow label="Updated">{preview.updatedAt}</DetailRow></Box>}</DialogContent><DialogActions><Button onClick={() => setPreview(null)}>Close</Button></DialogActions>
    </Dialog>
    <Dialog open={creating} onClose={pending ? undefined : () => setCreating(false)} aria-labelledby="example-create-title" maxWidth="sm">
      <Box component="form" noValidate onSubmit={(event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); save(); }}>
        <DialogTitle id="example-create-title">Create resource</DialogTitle><DialogContent><Stack sx={{ gap: 4, pt: 2 }}>
          <TextField label="Resource name" inputRef={nameRef} autoFocus required error={!!formError} helperText={formError || 'Use a clear, descriptive name.'} value={draft.name} onChange={event => { setFormError(''); setDraft(value => ({ ...value, name: event.target.value })); }}/>
          <TextField label="Category" select value={draft.categoryId} onChange={event => setDraft(value => ({ ...value, categoryId: event.target.value as ExampleResourceInput['categoryId'] }))}>{exampleCategories.flatMap(parent => parent.children.map(child => <MenuItem key={child.id} value={child.id}>{parent.label} / {child.label}</MenuItem>))}</TextField>
          <TextField label="Resource tag" select value={draft.tag} onChange={event => setDraft(value => ({ ...value, tag: event.target.value as ExampleResourceInput['tag'] }))}>{['Enterprise', 'Internal'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        </Stack></DialogContent><DialogActions><Button disabled={pending} onClick={() => setCreating(false)}>Cancel</Button><Button disabled={pending} variant="contained" type="submit">{pending ? 'Creating…' : 'Create resource'}</Button></DialogActions>
      </Box>
    </Dialog>
  </PageLayout>;
}
