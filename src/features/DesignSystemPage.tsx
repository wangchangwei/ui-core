import { useState } from 'react';
import { Alert, Box, Button, Checkbox, Divider, FormControlLabel, Grid, IconButton, MenuItem, Stack, Switch, Tab, Tabs, TextField, Typography } from '@mui/material';
import { PageLayout, PageSection, StatusBadge, AsyncState, ConfirmDialog } from '../shared/ui';
import { useApp } from '../app/AppContext';
import { tokens, vercelTokens } from '../theme';
import ArrowForward from '@mui/icons-material/ArrowForward';
export function DesignSystemPage() {
    const { notify } = useApp();
    const [tab, setTab] = useState(3);
    const [confirm, setConfirm] = useState(false);
    const [checked, setChecked] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const retry = () => { setTab(0); window.setTimeout(() => setTab(3), 300); };
    return <PageLayout title="Design system" description="One visual language. Shared across every page.">
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
    <PageSection title="Form controls" description="Visible labels, explicit errors, and consistent dimensions."><Grid container spacing={6}>
      <Grid size={4}><TextField label="Project name" defaultValue="Website redesign"/></Grid><Grid size={4}><TextField label="Email" defaultValue="invalid-email" error helperText="Enter a valid email address."/></Grid><Grid size={4}><TextField label="Account ID" defaultValue="account-admin" disabled/></Grid>
      <Grid size={4}><TextField select label="Priority" defaultValue="normal"><MenuItem value="normal">Normal</MenuItem><MenuItem value="high">High</MenuItem></TextField></Grid><Grid size={4}><FormControlLabel label="Email notifications" control={<Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}/>}/></Grid><Grid size={4}><FormControlLabel label="Enable feature" control={<Switch checked={enabled} onChange={event => setEnabled(event.target.checked)}/>}/></Grid>
    </Grid></PageSection>
    <PageSection title="Page states" description="Loading, empty, error, and success use shared components."><Tabs value={tab} onChange={(_, value: number) => setTab(value)} aria-label="State examples"><Tab label="Loading"/><Tab label="Empty"/><Tab label="Error"/><Tab label="Content"/></Tabs><Divider sx={{ mb: 6 }}/>
      <Box role="tabpanel" aria-label={['Loading example', 'Empty example', 'Error example', 'Content example'][tab]}>
        {tab === 0 && <AsyncState loading/>}{tab === 1 && <AsyncState empty emptyTitle="No projects found" emptyDescription="Adjust your filters or create a project to get started."/>}{tab === 2 && <AsyncState error="We couldn't load projects. Your saved data has not changed." onRetry={retry}/>}{tab === 3 && <Alert severity="success">Projects loaded successfully. You're up to date.</Alert>}
      </Box>
    </PageSection>
    <ConfirmDialog open={confirm} title="Confirm this example?" description="This demonstrates the shared confirmation dialog. No workspace data will be changed." onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); notify('Confirmation example completed'); }}/>
  </PageLayout>;
}
