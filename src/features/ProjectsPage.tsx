import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Add from '@mui/icons-material/Add';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../domain/api';
import { can } from '../domain/permissions';
import { useApp } from '../app/AppContext';
import { AsyncState, EntityAvatar, FilterBar, PageLayout, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { statusLabels } from './pageUtils';
import { tokens } from '../theme';
const CARD_PAGE_SIZE = 9;
export function ProjectsPage() {
    const { session } = useApp();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [page, setPage] = useState(1);
    const query = { search, status, ownerId, page, pageSize: CARD_PAGE_SIZE };
    const result = useAsync(() => api.listProjects(query), [query]);
    const owners = useAsync(() => api.listOwners());
    const writable = can(session?.role, 'projects:write');
    const error = result.error ?? owners.error;
    const updateFilter = (update: () => void) => { update(); setPage(1); };
    return <PageLayout title="Projects" description="Track delivery initiatives across the workspace." actions={writable ? <Button component={RouterLink} to="/projects/new" variant="contained" startIcon={<Add />}>New project</Button> : undefined}>
    <FilterBar>
      <TextField slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment> } }} label="Search projects" placeholder="Search projects" value={search} onChange={event => updateFilter(() => setSearch(event.target.value))}/>
      <TextField select label="Status" value={status} onChange={event => updateFilter(() => setStatus(event.target.value))}><MenuItem value="">All statuses</MenuItem>{(['active', 'planned', 'on-hold', 'completed'] as const).map(value => <MenuItem key={value} value={value}>{statusLabels[value]}</MenuItem>)}</TextField>
      <TextField select label="Owner" value={ownerId} onChange={event => updateFilter(() => setOwnerId(event.target.value))}><MenuItem value="">All owners</MenuItem>{owners.data?.map(owner => <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>)}</TextField>
    </FilterBar>
    <AsyncState loading={!result.data && result.loading} error={error} onRetry={() => { result.reload(); owners.reload(); }} empty={!result.loading && result.data?.items.length === 0} emptyTitle="No projects found" emptyDescription="Try another search or clear the filters to see more projects.">
      {result.data && <>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{result.data.total} projects{result.loading ? ' · Updating…' : ''}</Typography>
        <Grid container spacing={4}>
          {result.data.items.map(project => { const owner = owners.data?.find(item => item.id === project.ownerId); return <Grid key={project.id} size={{ xs: 12, sm: 6, lg: 4 }}><Card component="article" sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 140ms ease-out', '&:hover': { borderColor: 'text.primary' } }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Box component="span" style={{ borderRadius: tokens.radius.control }} sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center', flexShrink: 0, border: 1, borderColor: 'divider', color: 'text.secondary', typography: 'caption' }}>{project.name.charAt(0).toUpperCase()}</Box><StatusBadge status={project.status}/></Stack>
              <Typography component="h2" variant="h6" title={project.name} noWrap sx={{ minWidth: 0 }}>{project.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{project.description || 'No description provided.'}</Typography>
              <Stack sx={{ gap: 1, mt: 'auto' }}><Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}><EntityAvatar name={owner?.name ?? 'Loading owner'} size="small"/><Typography variant="body2" noWrap>{owner?.name ?? 'Loading owner…'}</Typography></Stack><Typography variant="caption" color="text.secondary" sx={{ pl: 9, fontVariantNumeric: 'tabular-nums' }}>{project.startDate} — {project.endDate}</Typography></Stack>
            </CardContent>
            <CardActions sx={{ px: 6, py: 3, borderTop: 1, borderColor: 'divider' }}><Button component={RouterLink} to={`/projects/${project.id}`} size="small" endIcon={<ArrowForward />}>View details</Button></CardActions>
          </Card></Grid>})}
        </Grid>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 2 }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Showing {(page - 1) * CARD_PAGE_SIZE + 1}–{Math.min(page * CARD_PAGE_SIZE, result.data.total)} of {result.data.total}</Typography><Stack direction="row" spacing={2}><Button variant="outlined" disabled={page === 1 || result.loading} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outlined" disabled={page * CARD_PAGE_SIZE >= result.data.total || result.loading} onClick={() => setPage(value => value + 1)}>Next</Button></Stack></Stack>
      </>}
    </AsyncState>
  </PageLayout>;
}
