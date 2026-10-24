import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, Chip, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import ArrowForward from '@mui/icons-material/ArrowForward';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { createExampleService, exampleCategories, type ExampleResource } from '../domain/page-standard-example';
import { AsyncState, ConfirmDialog, FilterBar, PageLayout, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useApp } from '../app/AppContext';

export function CardListStandardPage() {
  const [service] = useState(createExampleService);
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [parentId, setParentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('updatedAt-desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [target, setTarget] = useState<ExampleResource | null>(null);
  const [pending, setPending] = useState(false);
  const query = { search, parentId, categoryId, tag, status: '', sortBy: sort.startsWith('name') ? 'name' : 'updatedAt', sortDirection: sort.endsWith('asc') ? 'asc' as const : 'desc' as const, page, pageSize };
  const result = useAsync(() => service.list(query), [query]);
  const parent = exampleCategories.find(item => item.id === parentId);
  const filtered = Boolean(search || parentId || categoryId || tag);
  const change = (update: () => void) => { update(); setPage(0); };
  const remove = async () => {
    if (!target || pending) return;
    setPending(true);
    try { await service.remove([target.id]); if (page > 0 && result.data?.items.length === 1) setPage(value => value - 1); setTarget(null); result.reload(); notify('Resource deleted'); }
    catch (error) { notify(error instanceof Error ? error.message : 'Unable to delete resource.', 'error'); }
    finally { setPending(false); }
  };
  const button = (id: string, label: string, active: boolean, onClick: () => void) => <Button key={id} variant="category" aria-pressed={active} onClick={onClick}>{label}<Typography component="span" variant="body2" color={active ? 'inherit' : 'text.secondary'} sx={{ ml: 2 }}>{result.data?.counts[id] ?? '—'}</Typography></Button>;
  return <Box data-testid="page-anatomy"><PageLayout title="Resource templates" description="Browse reusable resources for your next project." actions={<Button component={RouterLink} to="/page-standards/form" variant="contained" startIcon={<Add/>}>Create resource</Button>}>
    <Stack direction="row" role="group" aria-label="Primary category" sx={{ gap: 2, flexWrap: 'wrap' }}>
      {button('all', 'All', !parentId, () => change(() => { setParentId(''); setCategoryId(''); }))}
      {exampleCategories.map(item => button(item.id, item.label, parentId === item.id, () => change(() => { setParentId(item.id); setCategoryId(''); })))}
    </Stack>
    {parent && <Stack direction="row" role="group" aria-label="Secondary category" sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap', pl: 4, borderLeft: 1, borderColor: 'divider' }}>
      <Typography color="text.secondary">{parent.label} /</Typography>{button(parent.id, `All ${parent.label.toLowerCase()}`, !categoryId, () => change(() => setCategoryId('')))}
      {parent.children.map(item => button(item.id, item.label, categoryId === item.id, () => change(() => setCategoryId(item.id))))}
    </Stack>}
    <FilterBar>
      <TextField label="Search resources" placeholder="Search by name" value={search} onChange={event => change(() => setSearch(event.target.value))} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment> } }}/>
      <TextField select label="Tag" value={tag} onChange={event => change(() => setTag(event.target.value))}><MenuItem value="">All tags</MenuItem><MenuItem value="Enterprise">Enterprise</MenuItem><MenuItem value="Internal">Internal</MenuItem></TextField>
      <TextField select label="Sort by" value={sort} onChange={event => change(() => setSort(event.target.value))}><MenuItem value="updatedAt-desc">Recently updated</MenuItem><MenuItem value="updatedAt-asc">Oldest updated</MenuItem><MenuItem value="name-asc">Name A–Z</MenuItem><MenuItem value="name-desc">Name Z–A</MenuItem></TextField>
      <Button variant="outlined" disabled={!search && !tag && !parentId} onClick={() => change(() => { setSearch(''); setTag(''); setParentId(''); setCategoryId(''); })}>Clear filters</Button>
    </FilterBar>
    <Typography variant="body2" color="text.secondary" role="status">{result.data ? `${result.data.total} resources` : 'Loading resources…'}</Typography>
    <AsyncState loading={!result.data && result.loading} error={result.error} onRetry={result.reload} empty={!result.loading && result.data?.total === 0} emptyAction={filtered ? <Button variant="outlined" onClick={() => change(() => { setSearch(''); setTag(''); setParentId(''); setCategoryId(''); })}>Clear filters</Button> : <Button component={RouterLink} to="/page-standards/form" variant="contained">Create resource</Button>} emptyTitle={filtered ? 'No resources match these filters' : 'No resources yet'} emptyDescription={filtered ? 'Clear the filters to browse the full collection.' : 'Create a resource to start building this collection.'}>
      {result.data && <>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 4 }}>
          {result.data.items.map(item => { const branch = exampleCategories.find(parent => parent.children.some(child => child.id === item.categoryId)); const category = branch?.children.find(child => child.id === item.categoryId); const categoryPath = [branch?.label, category?.label].filter(Boolean).join(' / '); return <Card component="article" aria-labelledby={`resource-${item.id}`} key={item.id} sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><StatusBadge status={item.status}/><Tooltip title="Delete resource"><IconButton size="small" aria-label={`Delete ${item.name}`} disabled={pending} onClick={() => setTarget(item)}><DeleteOutlined fontSize="small"/></IconButton></Tooltip></Stack>
              <Typography component="h2" variant="h2" id={`resource-${item.id}`} title={item.name} sx={{ overflowWrap: 'anywhere', minHeight: 56, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{item.name}</Typography>
              <Typography color="text.secondary" title={item.description} sx={{ minHeight: 60, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>{item.description}</Typography>
              <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', mt: 'auto' }}><Chip label={categoryPath} variant="outlined"/><Chip label={item.tag} variant="outlined"/></Stack>
              <Typography variant="caption" color="text.secondary">Updated {item.updatedAt}</Typography>
            </CardContent>
            <CardActions sx={{ borderTop: 1, borderColor: 'divider', px: 6, py: 3 }}><Button component={RouterLink} to={`/page-standards/detail?id=${item.id}`} endIcon={<ArrowForward/>}>View details</Button></CardActions>
          </Card>; })}
        </Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, result.data.total)} of {result.data.total}</Typography>
          <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}><TextField select value={pageSize} slotProps={{ select: { inputProps: { 'aria-label': 'Items per page' } } }} sx={{ width: 88 }} onChange={event => change(() => setPageSize(Number(event.target.value)))}>{[12, 24, 48].map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}</TextField><Button variant="outlined" disabled={page === 0 || result.loading} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outlined" disabled={(page + 1) * pageSize >= result.data.total || result.loading} onClick={() => setPage(value => value + 1)}>Next</Button></Stack>
        </Stack>
      </>}
    </AsyncState>
    <ConfirmDialog open={!!target} title="Delete resource?" description={`Remove “${target?.name ?? ''}” from this collection?`} destructive pending={pending} onClose={() => setTarget(null)} onConfirm={() => void remove()}/>
  </PageLayout></Box>;
}
