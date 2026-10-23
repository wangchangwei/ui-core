import { useState } from 'react';
import { Button, Card, CardActions, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../domain/api';
import { can } from '../domain/permissions';
import { useApp } from '../app/AppContext';
import { AsyncState, FilterBar, PageLayout, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { statusLabels } from './pageUtils';
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
      <TextField label="Search projects" placeholder="Search projects" value={search} onChange={event => updateFilter(() => setSearch(event.target.value))}/>
      <TextField select label="Status" value={status} onChange={event => updateFilter(() => setStatus(event.target.value))}><MenuItem value="">All statuses</MenuItem>{(['active', 'planned', 'on-hold', 'completed'] as const).map(value => <MenuItem key={value} value={value}>{statusLabels[value]}</MenuItem>)}</TextField>
      <TextField select label="Owner" value={ownerId} onChange={event => updateFilter(() => setOwnerId(event.target.value))}><MenuItem value="">All owners</MenuItem>{owners.data?.map(owner => <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>)}</TextField>
    </FilterBar>
    <AsyncState loading={!result.data && result.loading} error={error} onRetry={() => { result.reload(); owners.reload(); }} empty={!result.loading && result.data?.items.length === 0} emptyTitle="No projects found" emptyDescription="Try another search or clear the filters to see more projects.">
      {result.data && <>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{result.data.total} projects{result.loading ? ' · Updating…' : ''}</Typography>
        <Grid container spacing={4}>
          {result.data.items.map(project => <Grid key={project.id} size={4}><Card component="article" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}><Stack spacing={4}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}><Typography component="h2" variant="h6" title={project.name} noWrap sx={{ minWidth: 0, flex: 1 }}>{project.name}</Typography><StatusBadge status={project.status}/></Stack>
              <Typography sx={{ color: 'text.secondary', minHeight: '3em', overflowWrap: 'anywhere' }}>{project.description || 'No description provided.'}</Typography>
              <Stack spacing={1}><Typography variant="body2">{owners.data?.find(owner => owner.id === project.ownerId)?.name ?? 'Loading owner…'}</Typography><Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{project.startDate} — {project.endDate}</Typography></Stack>
            </Stack></CardContent>
            <CardActions sx={{ px: 6, pb: 4 }}><Button component={RouterLink} to={`/projects/${project.id}`} size="small" endIcon={<ArrowForward />}>View details</Button></CardActions>
          </Card></Grid>)}
        </Grid>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 2 }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Showing {(page - 1) * CARD_PAGE_SIZE + 1}–{Math.min(page * CARD_PAGE_SIZE, result.data.total)} of {result.data.total}</Typography><Stack direction="row" spacing={2}><Button variant="outlined" disabled={page === 1 || result.loading} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outlined" disabled={page * CARD_PAGE_SIZE >= result.data.total || result.loading} onClick={() => setPage(value => value + 1)}>Next</Button></Stack></Stack>
      </>}
    </AsyncState>
  </PageLayout>;
}
