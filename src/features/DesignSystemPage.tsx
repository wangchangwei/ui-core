import { useState } from 'react';
import { Alert, Box, Button, Card, CardActions, CardContent, Checkbox, Chip, Divider, FormControlLabel, Grid, IconButton, MenuItem, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { PageLayout, PageSection, StatusBadge, AsyncState, ConfirmDialog, DetailRow, EntityAvatar } from '../shared/ui';
import { DataTable } from '../shared/DataTable';
import { useApp } from '../app/AppContext';
import { tokens, vercelTokens } from '../theme';
import type { GridColDef } from '@mui/x-data-grid';
import ArrowForward from '@mui/icons-material/ArrowForward';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { FrameworkContracts, FrameworkOverview } from './FrameworkReference';

export function DesignSystemPage() {
    const { notify } = useApp();
    const [tab, setTab] = useState(3);
    const [confirm, setConfirm] = useState(false);
    const [checked, setChecked] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const retry = () => { setTab(0); window.setTimeout(() => setTab(3), 300); };

    const sampleTableColumns: GridColDef<{ id: string; name: string; email: string; role: string; status: string; updated: string }>[] = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}><EntityAvatar name={row.name} size="small"/><Typography variant="body2" noWrap>{row.name}</Typography></Stack> },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 180 },
        { field: 'role', headerName: 'Role', width: 110, renderCell: ({ row }) => <Typography variant="body2" color="text.secondary">{row.role}</Typography> },
        { field: 'status', headerName: 'Status', width: 120, renderCell: ({ row }) => <StatusBadge status={row.status}/> },
        { field: 'actions', headerName: 'Actions', sortable: false, width: 100, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Tooltip title="View"><IconButton aria-label={`View ${row.name}`} size="small" onClick={() => notify(`View ${row.name}`)}><VisibilityOutlined fontSize="small"/></IconButton></Tooltip><Tooltip title="Edit"><IconButton aria-label={`Edit ${row.name}`} size="small" onClick={() => notify(`Edit ${row.name}`)}><EditOutlined fontSize="small"/></IconButton></Tooltip></Stack> },
    ];
    const sampleTableRows = [
        { id: '1', name: 'Morgan Chen', email: 'morgan.chen@example.com', role: 'Admin', status: 'active', updated: '2026-10-24' },
        { id: '2', name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'Editor', status: 'planned', updated: '2026-10-22' },
        { id: '3', name: 'Taylor Swift', email: 'taylor.swift@example.com', role: 'Viewer', status: 'on-hold', updated: '2026-10-20' },
    ];

    return <PageLayout title="Design system" description="Foundations, component contracts, and page patterns for every project.">
    <FrameworkOverview/>
    <PageSection title="Foundations" description="Source: DESIGN-vercel.md. Original values are preserved in the theme.">
      <Grid container spacing={4}>{Object.entries(vercelTokens.colors).filter(([name]) => ['ink', 'canvas', 'canvas-elevated', 'body', 'mute', 'faint', 'hairline', 'hairline-soft', 'link', 'link-deep', 'warning', 'error'].includes(name)).map(([name, color]) => <Grid key={name} size={3}><Box sx={{ bgcolor: color, height: 48, border: 1, borderColor: 'divider', mb: 2 }}/><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="body2">{name}</Typography><Typography variant="caption" sx={{ fontFamily: tokens.font.mono, color: 'text.secondary' }}>{color}</Typography></Stack></Grid>)}</Grid>
      <Divider sx={{ my: 6 }}/><Stack direction="row" spacing={10}><Typography variant="body2">Spacing <strong>{tokens.spacing}px base</strong></Typography><Typography variant="body2">Controls <strong>{tokens.size.control}px</strong></Typography><Typography variant="body2">Table rows <strong>{tokens.size.row}px</strong></Typography><Typography variant="body2">Corner radius <strong>{tokens.radius.control} / {tokens.radius.panel} / {tokens.radius.large}px</strong></Typography></Stack>
    </PageSection>
    <PageSection title="Typography" description="Geist for the interface. Geist Mono for code and uppercase section labels."><Stack spacing={3}>
      <Typography variant="overline" component="p">Geist typography</Typography>
      <Typography variant="display" component="p">Display / 48</Typography>
      <Typography variant="h1" component="p">Page heading / 32</Typography>
      <Typography variant="h6" component="p">Section heading / 20</Typography>
      <Typography variant="lead">Lead text / 16</Typography>
      <Typography>Body text / 14. A precise 20px line height.</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Supporting copy uses the same 14px body scale.</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Captions / 12px with a 16px line height</Typography>
      <Typography variant="code">npm run check</Typography>
    </Stack></PageSection>
    <PageSection title="Actions and status" description="One primary action per task. Labels always carry the meaning."><Stack spacing={6}>
      <Stack direction="row" spacing={3}><Button variant="contained" onClick={() => notify('Primary action completed')}>Primary action</Button><Button variant="outlined" onClick={() => setConfirm(true)}>Open confirmation</Button><Button onClick={() => setTab(2)}>Show error state</Button><Button variant="contained" disabled>Disabled action</Button></Stack>
      <Stack direction="row" spacing={3}>{['active', 'planned', 'on-hold', 'completed', 'invited', 'suspended'].map(status => <StatusBadge key={status} status={status}/>)}</Stack>
    </Stack></PageSection>
    <PageSection title="Button families" description="App controls use 6px corners. Marketing calls to action use full pills.">
      <Stack direction="row" spacing={4} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 4 }}>
        <Button variant="marketing" onClick={() => notify('Marketing button example')}>Start deploying</Button>
        <Button variant="marketingOutlined" onClick={() => notify('Secondary marketing example')}>Get a demo</Button>
        <Button variant="category" onClick={() => notify('Category button example')}>AI Apps</Button>
        <IconButton aria-label="Circular button example" onClick={() => notify('Circular button example')}><ArrowForward /></IconButton>
      </Stack>
    </PageSection>
    <PageSection title="Form controls" description="Visible labels, explicit errors, and consistent dimensions. Compose production forms with FormField, FormSection, and FormActions." actions={<Button component={RouterLink} to="/page-standards/form">Open form pattern</Button>}><Grid container spacing={6}>
      <Grid size={4}><TextField label="Project name" defaultValue="Website redesign"/></Grid><Grid size={4}><TextField label="Email" defaultValue="invalid-email" error helperText="Enter a valid email address."/></Grid><Grid size={4}><TextField label="Account ID" defaultValue="account-admin" disabled/></Grid>
      <Grid size={4}><TextField select label="Priority" defaultValue="normal"><MenuItem value="normal">Normal</MenuItem><MenuItem value="high">High</MenuItem></TextField></Grid><Grid size={4}><FormControlLabel label="Email notifications" control={<Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}/>}/></Grid><Grid size={4}><FormControlLabel label="Enable feature" control={<Switch checked={enabled} onChange={event => setEnabled(event.target.checked)}/>}/></Grid>
    </Grid></PageSection>
    <PageSection title="Cards and panels" description="12px corners for standard cards, 16px for panels. Independent action footers.">
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card component="article" aria-labelledby="framework-card-title" sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 140ms ease-out', '&:hover': { borderColor: 'text.primary' } }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box component="span" style={{ borderRadius: tokens.radius.control }} sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center', flexShrink: 0, border: 1, borderColor: 'divider', color: 'text.secondary', typography: 'caption' }}>P</Box>
                <StatusBadge status="active"/>
              </Stack>
              <Typography id="framework-card-title" component="h3" variant="h6" noWrap>Design system migration</Typography>
              <Typography variant="body2" color="text.secondary">Unified React + MUI enterprise scaffold with tokenized styles and accessible controls.</Typography>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 2, mt: 'auto' }}>
                <EntityAvatar name="Morgan Chen" size="small"/>
                <Typography variant="body2">Morgan Chen</Typography>
                <Chip label="Core UI" variant="outlined" sx={{ ml: 'auto' }}/>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 6, py: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button component={RouterLink} to="/page-standards/card-list" size="small" endIcon={<ArrowForward />}>Open card pattern</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 6, border: 1, borderColor: 'divider', borderRadius: `${tokens.radius.large}px`, bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6">Overview details</Typography>
                <Chip label="Definition list" variant="outlined"/>
              </Stack>
              <Box component="dl" sx={{ m: 0 }}>
                <DetailRow label="Framework">React 19 + MUI 9</DetailRow>
                <DetailRow label="Token source">DESIGN-vercel.md</DetailRow>
                <DetailRow label="Status"><StatusBadge status="completed"/></DetailRow>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>Rendered with shared DetailRow inside 16px panel.</Typography>
          </Box>
        </Grid>
      </Grid>
    </PageSection>
    <PageSection title="Data table" description="Component specimen with illustrative records. Select rows and sort columns; use the table pattern for service pagination and filters." actions={<Button component={RouterLink} to="/page-standards/table-list">Open table pattern</Button>}>
      <DataTable rows={sampleTableRows} columns={sampleTableColumns} checkboxSelection initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}/>
    </PageSection>
    <PageSection title="Page states" description="Loading, empty, error, and success use shared components."><Tabs value={tab} onChange={(_, value: number) => setTab(value)} aria-label="State examples">{['Loading', 'Empty', 'Error', 'Content'].map((label, index) => <Tab key={label} id={`framework-state-tab-${index}`} aria-controls={`framework-state-panel-${index}`} label={label}/>)}</Tabs><Divider sx={{ mb: 6 }}/>
      <Box id={`framework-state-panel-${tab}`} role="tabpanel" aria-labelledby={`framework-state-tab-${tab}`} tabIndex={0}>
        {tab === 0 && <AsyncState loading/>}{tab === 1 && <AsyncState empty emptyTitle="No projects found" emptyDescription="Adjust your filters or create a project to get started."/>}{tab === 2 && <AsyncState error="We couldn't load projects. Your saved data has not changed." onRetry={retry}/>}{tab === 3 && <Alert severity="success">Projects loaded successfully. You're up to date.</Alert>}
      </Box>
    </PageSection>
    <ConfirmDialog open={confirm} title="Confirm this example?" description="This demonstrates the shared confirmation dialog. No workspace data will be changed." onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); notify('Confirmation example completed'); }}/>
    <FrameworkContracts/>
  </PageLayout>;
}
