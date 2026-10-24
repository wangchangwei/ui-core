import { useRef, useState } from 'react';
import {
    Alert, Box, Button, ButtonBase, Card, CardActions, CardContent, Checkbox, Chip, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, FormControl, IconButton,
    InputAdornment, InputLabel, Menu, MenuItem, Select, Stack, TextField, ToggleButton,
    ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AppsOutlined from '@mui/icons-material/AppsOutlined';
import Close from '@mui/icons-material/Close';
import MoreVert from '@mui/icons-material/MoreVert';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Sort from '@mui/icons-material/Sort';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import SchemaOutlined from '@mui/icons-material/SchemaOutlined';
import UploadOutlined from '@mui/icons-material/UploadOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { useApp } from '../app/AppContext';
import { AsyncState, ConfirmDialog, PageLayout } from '../shared/ui';
import { api } from '../domain/api';
import { scenarioSchema } from '../domain/schemas';
import type { Scenario, ScenarioCategoryId, ScenarioInput } from '../domain/types';
import { SCENARIO_CATEGORIES } from '../domain/types';
import { can } from '../domain/permissions';
import { useAsync } from '../shared/useAsync';

const PAGE_SIZE = 12;
const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function formatRelativeTime(value: string) {
    const hours = Math.round((new Date(value).getTime() - Date.now()) / (60 * 60 * 1000));
    if (Math.abs(hours) < 24) return relativeTime.format(hours, 'hour');
    return relativeTime.format(Math.round(hours / 24), 'day');
}

export function ScenarioManagementPage() {
    const { session, notify } = useApp();
    const writable = can(session?.role, 'scenarios:write');
    const [search, setSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [categoryId, setCategoryId] = useState<ScenarioCategoryId | ''>('');
    const [view, setView] = useState<'cards' | 'graph'>('cards');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [createOpen, setCreateOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [preview, setPreview] = useState<Scenario | null>(null);
    const [selected, setSelected] = useState<Scenario | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [draft, setDraft] = useState<ScenarioInput>({ name: '', description: '', categoryIds: ['onboarding'], subflows: [], visibility: 'visible' });
    const [subflowText, setSubflowText] = useState('');
    const query = { search, categoryId: categoryId || undefined, page, pageSize, sortBy: 'updatedAt' as const, sortDirection };
    const result = useAsync(() => api.listScenarios(query), [query]);
    const counts = useAsync(() => api.getScenarioCounts());
    const updateSearch = (value: string) => { setSearch(value); setPage(1); };
    const updateCategory = (value: ScenarioCategoryId | '') => { setCategoryId(value); setPage(1); };

    const closeCreate = () => {
        setCreateOpen(false);
        setActionError(null);
        setSubflowText('');
        setDraft({ name: '', description: '', categoryIds: ['onboarding'], subflows: [], visibility: 'visible' });
    };
    const createScenario = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending) return;
        setPending(true);
        setActionError(null);
        try {
            const saved = await api.saveScenario({ ...draft, subflows: subflowText.split(',').map((name) => name.trim()).filter(Boolean) });
            closeCreate();
            setCategoryId('');
            setSearch('');
            setPage(1);
            result.reload();
            counts.reload();
            notify(`“${saved.name}” created`);
        }
        catch (error) {
            setActionError(error instanceof Error ? error.message : 'Unable to create scenario. Try again.');
        }
        finally {
            setPending(false);
        }
    };
    const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setActionError(null);
        try {
            const source: unknown = JSON.parse(await file.text());
            const parsed = scenarioSchema.array().min(1).max(100).safeParse(source);
            if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Choose a valid scenario JSON file.');
            const imported = await api.importScenarios(parsed.data);
            updateCategory('');
            updateSearch('');
            setPage(1);
            result.reload();
            counts.reload();
            notify(`${imported} scenario${imported === 1 ? '' : 's'} imported`);
        }
        catch (error) {
            const message = error instanceof Error && error.message !== 'Unexpected end of JSON input' ? error.message : 'Choose a valid scenario JSON file.';
            setActionError(message);
        }
    };
    const setVisibility = async (scenario: Scenario) => {
        try {
            await api.setScenarioVisibility(scenario.id, scenario.visibility === 'visible' ? 'hidden' : 'visible');
            result.reload();
            notify(scenario.visibility === 'visible' ? 'Scenario hidden' : 'Scenario made visible');
        }
        catch (error) {
            notify(error instanceof Error ? error.message : 'Unable to change visibility', 'error');
        }
    };
    const duplicateScenario = async () => {
        if (!selected) return;
        setPending(true);
        setMenuAnchor(null);
        try {
            await api.saveScenario({ ...selected, name: `${selected.name} copy` });
            result.reload();
            counts.reload();
            setSearch('');
            setCategoryId('');
            setPage(1);
            notify('Scenario duplicated');
        }
        catch (error) {
            notify(error instanceof Error ? error.message : 'Unable to duplicate scenario', 'error');
        }
        finally {
            setPending(false);
        }
    };
    const deleteScenario = async () => {
        if (!deleteTarget) return;
        setPending(true);
        try {
            await api.deleteScenario(deleteTarget.id);
            if (page > 1 && (result.data?.items.length ?? 0) <= 1) setPage((value) => value - 1);
            setDeleteTarget(null);
            result.reload();
            counts.reload();
            notify('Scenario deleted');
        }
        catch (error) {
            notify(error instanceof Error ? error.message : 'Unable to delete scenario', 'error');
        }
        finally {
            setPending(false);
        }
    };
    const first = result.data?.total ? (page - 1) * pageSize + 1 : 0;
    const last = result.data ? Math.min(page * pageSize, result.data.total) : 0;
    const pageCount = Math.max(1, Math.ceil((result.data?.total ?? 0) / pageSize));

    return <PageLayout title="Scenario Management" description="Orchestrate and manage interactive multi-agent business scenarios."
        actions={<>
            {writable && <Button variant="outlined" startIcon={<UploadOutlined />} component="label">Import<input id="scenario-import" aria-label="Import scenarios from JSON" hidden type="file" accept="application/json,.json" onChange={(event) => void importFile(event)}/></Button>}
            <Button variant="outlined" startIcon={<AppsOutlined />} onClick={() => setCategoryOpen(true)}>Categories</Button>
            {writable && <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create</Button>}
        </>}>
        {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
        <Box role="group" aria-label="Filter scenarios by category" sx={{ display: 'flex', gap: 2, minWidth: 0, overflowX: 'auto', pb: 1 }}>
            <Button aria-pressed={!categoryId} variant="category" onClick={() => updateCategory('')} sx={!categoryId ? { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'text.secondary' } } : undefined}>All <Typography component="span" variant="body2" color={!categoryId ? 'inherit' : 'text.secondary'} sx={{ ml: 1 }}>{counts.data?.total ?? 0}</Typography></Button>
            {SCENARIO_CATEGORIES.map((category) => {
                const active = categoryId === category.id;
                return <Button key={category.id} aria-pressed={active} variant="category" onClick={() => updateCategory(category.id)} sx={active ? { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'text.secondary' } } : undefined}>
                    {category.label}<Typography component="span" variant="body2" color={active ? 'inherit' : 'text.secondary'} sx={{ ml: 1 }}>{counts.data?.[category.id] ?? 0}</Typography>
                </Button>;
            })}
        </Box>
        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
            <TextField inputRef={searchInputRef} label="Search scenarios" placeholder="Search by name or description" value={search} onChange={(event) => updateSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small"/></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => { updateSearch(''); searchInputRef.current?.focus(); }}><Close fontSize="small"/></IconButton></InputAdornment> : undefined } }} sx={{ width: 360, maxWidth: '100%' }}/>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 3, ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ mr: 1, fontVariantNumeric: 'tabular-nums' }}>{result.data ? `${result.data.total} scenario${result.data.total === 1 ? '' : 's'}` : result.loading ? 'Loading…' : ''}{result.data && result.loading ? ' · Updating…' : ''}</Typography>
            <ToggleButtonGroup exclusive value={view} onChange={(_, value: 'cards' | 'graph' | null) => { if (value) setView(value); }} aria-label="Scenario view">
                <ToggleButton value="cards" aria-label="Cards view"><AppsOutlined fontSize="small"/><Box component="span" sx={{ ml: 1 }}>Cards</Box></ToggleButton>
                <ToggleButton value="graph" aria-label="Graph view"><SchemaOutlined fontSize="small"/><Box component="span" sx={{ ml: 1 }}>Graph</Box></ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title={sortDirection === 'desc' ? 'Sort by newest first' : 'Sort by oldest first'}>
                <IconButton size="small" aria-label={sortDirection === 'desc' ? 'Sort by newest first' : 'Sort by oldest first'} onClick={() => { setSortDirection((value) => value === 'desc' ? 'asc' : 'desc'); setPage(1); }}><Sort fontSize="small"/></IconButton>
            </Tooltip>
            </Stack>
        </Stack>
        <AsyncState loading={!result.data && result.loading} error={result.error} onRetry={() => { result.reload(); counts.reload(); }} empty={!result.loading && result.data?.items.length === 0} emptyTitle="No scenarios found" emptyDescription="Try another search or category to find a scenario.">
            {result.data && <>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 4 }}>
                    {result.data.items.map((scenario) => <Card key={scenario.id} component="article" aria-labelledby={`scenario-${scenario.id}`} sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', transition: 'border-color 140ms ease-out', '&:hover': { borderColor: 'text.disabled' }, '&:focus-within': { borderColor: 'secondary.main' } }}>
                        <CardContent sx={{ flex: view === 'graph' ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                            <Typography id={`scenario-${scenario.id}`} component="h2" variant="subtitle1" sx={{ minWidth: 0, minHeight: 40 }}><ButtonBase onClick={() => setPreview(scenario)} title={scenario.name} sx={{ textAlign: 'left', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', minHeight: 40, color: 'text.primary', '&:hover': { color: 'secondary.dark' } }}><Box component="span" sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{scenario.name}</Box></ButtonBase></Typography>
                            <Typography variant="body2" color="text.secondary" title={scenario.description} sx={{ minHeight: 40, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{scenario.description}</Typography>
                            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                <Button size="small" onClick={() => setPreview(scenario)} sx={{ color: 'secondary.dark', px: 0, gap: 1, minHeight: 32 }}><AccountTreeOutlined fontSize="small"/>{scenario.subflows.length === 0 ? 'No subflows' : `Subflows · ${scenario.subflows.length}`}</Button>
                                <Stack direction="row" sx={{ flexShrink: 0 }}>
                                    <Tooltip title={scenario.visibility === 'visible' ? 'Hide scenario' : 'Show scenario'}><span><IconButton size="small" aria-label={`${scenario.visibility === 'visible' ? 'Hide' : 'Show'} ${scenario.name}`} disabled={!writable || pending} onClick={() => void setVisibility(scenario)}>{scenario.visibility === 'visible' ? <VisibilityOutlined fontSize="small"/> : <VisibilityOffOutlined fontSize="small"/>}</IconButton></span></Tooltip>
                                    {writable && <IconButton size="small" aria-label={`More actions for ${scenario.name}`} onClick={(event) => { setSelected(scenario); setMenuAnchor(event.currentTarget); }}><MoreVert fontSize="small"/></IconButton>}
                                </Stack>
                            </Stack>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 'auto', minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto', whiteSpace: 'nowrap' }}><AccessTimeOutlined sx={{ width: 16, height: 16 }}/>{formatRelativeTime(scenario.updatedAt)}</Typography>
                                {scenario.categoryIds.slice(0, 1).map((id) => <Chip key={id} label={SCENARIO_CATEGORIES.find((item) => item.id === id)?.label ?? id} variant="outlined" sx={{ maxWidth: 130 }}/>) }
                            </Stack>
                        </CardContent>
                        {view === 'graph' && <CardActions sx={{ flex: 1, px: 6, py: 4, borderTop: 1, borderColor: 'divider', alignItems: 'flex-start' }}>
                            <Stack sx={{ gap: 3, minWidth: 0, width: '100%' }}>
                                <Typography variant="caption" color="text.secondary">Connected subflows</Typography>
                                <Stack sx={{ gap: 3, minWidth: 0, pl: 3, borderLeft: 1, borderColor: 'divider' }}>
                                    {scenario.subflows.slice(0, 2).map((flow, index) => <Stack key={`${flow}-${index}`} direction="row" sx={{ alignItems: 'flex-start', gap: 2, minWidth: 0 }}><ArrowForward fontSize="small" color="action"/><Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{flow}</Typography></Stack>) }
                                    {scenario.subflows.length > 2 && <Typography variant="caption" color="text.secondary">+{scenario.subflows.length - 2}</Typography>}
                                    {scenario.subflows.length === 0 && <Typography variant="caption" color="text.secondary">No connected subflows</Typography>}
                                </Stack>
                            </Stack>
                        </CardActions>}
                    </Card>)}
                </Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 4, flexWrap: 'wrap', pt: 6, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Items {first} to {last} of {result.data.total}</Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">Items per page:</Typography>
                        <TextField select slotProps={{ select: { inputProps: { 'aria-label': 'Items per page' } } }} value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} sx={{ width: 88 }}>
                            {[12, 24, 48].map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                        </TextField>
                        <Button variant="outlined" aria-label="Previous page" startIcon={<ArrowBack/>} disabled={page <= 1 || result.loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'center' }}>{page} / {pageCount}</Typography>
                        <Button variant="outlined" aria-label="Next page" endIcon={<ArrowForward/>} disabled={page >= pageCount || result.loading} onClick={() => setPage((value) => value + 1)}>Next</Button>
                    </Stack>
                </Stack>
            </>}
        </AsyncState>

        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { setMenuAnchor(null); if (selected) setPreview(selected); }}>Preview</MenuItem>
            <MenuItem onClick={() => void duplicateScenario()}>Duplicate</MenuItem>
            <MenuItem onClick={() => { setMenuAnchor(null); setDeleteTarget(selected); }}>Delete</MenuItem>
        </Menu>
        <Dialog maxWidth="sm" open={createOpen} onClose={pending ? undefined : closeCreate} aria-labelledby="create-scenario-title">
            <Box component="form" onSubmit={(event: React.FormEvent<HTMLFormElement>) => void createScenario(event)} noValidate>
                <DialogTitle id="create-scenario-title">Create scenario</DialogTitle>
                <DialogContent><Stack sx={{ gap: 4, pt: 2, minWidth: 0 }}>
                    <TextField label="Scenario name" required autoFocus value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}/>
                    <TextField label="Description" multiline minRows={3} value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))}/>
                    <FormControl>
                        <InputLabel id="scenario-categories-label">Categories</InputLabel>
                        <Select labelId="scenario-categories-label" multiple value={draft.categoryIds} label="Categories" onChange={(event) => setDraft((value) => ({ ...value, categoryIds: event.target.value as ScenarioCategoryId[] }))} renderValue={(ids) => ids.map((id) => SCENARIO_CATEGORIES.find((item) => item.id === id)?.label ?? id).join(', ')}>
                            {SCENARIO_CATEGORIES.map((category) => <MenuItem key={category.id} value={category.id}><Checkbox checked={draft.categoryIds.includes(category.id)}/><Typography>{category.label}</Typography></MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Subflows" helperText="Enter subflow names separated by commas." value={subflowText} onChange={(event) => setSubflowText(event.target.value)}/>
                    {actionError && <Alert severity="error">{actionError}</Alert>}
                </Stack></DialogContent>
                <DialogActions><Button onClick={closeCreate} disabled={pending}>Cancel</Button><Button variant="contained" type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create scenario'}</Button></DialogActions>
            </Box>
        </Dialog>
        <Dialog open={categoryOpen} onClose={() => setCategoryOpen(false)} aria-labelledby="scenario-categories-title">
            <DialogTitle id="scenario-categories-title">Categories</DialogTitle>
            <DialogContent><DialogContentText sx={{ mb: 4 }}>Counts reflect the full scenario catalog. Scenarios can belong to more than one category.</DialogContentText>
                <Stack sx={{ gap: 2 }}>{SCENARIO_CATEGORIES.map((category) => <Stack key={category.id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, py: 2, borderBottom: 1, borderColor: 'divider' }}><Typography>{category.label}</Typography><Typography variant="body2" color="text.secondary">{counts.data?.[category.id] ?? 0}</Typography></Stack>)}</Stack>
            </DialogContent><DialogActions><Button onClick={() => setCategoryOpen(false)}>Close</Button></DialogActions>
        </Dialog>
        <Dialog open={!!preview} onClose={() => setPreview(null)} aria-labelledby="scenario-preview-title">
            <DialogTitle id="scenario-preview-title" sx={{ pr: 12 }}>{preview?.name}<IconButton size="small" aria-label="Close preview" onClick={() => setPreview(null)} sx={{ position: 'absolute', top: 4, right: 4 }}><Close fontSize="small"/></IconButton></DialogTitle>
            <DialogContent><DialogContentText>{preview?.description || 'No description provided.'}</DialogContentText>
                <Typography variant="subtitle1" sx={{ mt: 6, mb: 2 }}>Connected subflows</Typography>
                {preview?.subflows.length ? <Stack sx={{ gap: 2 }}>{preview.subflows.map((flow, index) => <Stack key={`${flow}-${index}`} direction="row" sx={{ alignItems: 'center', gap: 2, py: 2 }}><AccountTreeOutlined color="action" fontSize="small"/><Typography>{flow}</Typography></Stack>)}</Stack> : <Typography variant="body2" color="text.secondary">This scenario has no connected subflows.</Typography>}
            </DialogContent><DialogActions><Button onClick={() => setPreview(null)}>Close</Button></DialogActions>
        </Dialog>
        <ConfirmDialog open={!!deleteTarget} title="Delete scenario?" description={`“${deleteTarget?.name ?? ''}” will be removed from this workspace.`} confirmLabel={pending ? 'Deleting…' : 'Delete'} pending={pending} destructive onClose={() => setDeleteTarget(null)} onConfirm={() => void deleteScenario()}/>
    </PageLayout>;
}
