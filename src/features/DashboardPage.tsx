import { Box, Button, Grid, Link, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import ArrowForward from "@mui/icons-material/ArrowForward";
import { LineChart, PieChart } from '@mui/x-charts';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../domain/api';
import { PageLayout, PageSection, StatusBadge, AsyncState } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { tokens } from '../theme';
export function DashboardPage() {
    const { data, loading, error, reload } = useAsync(() => api.getDashboard());
    const theme = useTheme();
    const colors = [theme.palette.info.main, theme.palette.text.secondary, theme.palette.warning.main, theme.palette.text.primary];
    const statusLabel = (status: string) => status === 'on-hold' ? 'On hold' : status.charAt(0).toUpperCase() + status.slice(1);
    return <PageLayout title="Dashboard" description="Your people, projects, and delivery progress." actions={<Button component={RouterLink} to="/projects" variant="outlined" endIcon={<ArrowForward />}>View projects</Button>}>
    <AsyncState loading={loading} error={error} onRetry={reload}>
      {data && <>
        <Paper variant="outlined" sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', overflow: 'hidden' }}>
          {[
                ['Total users', data.users, `${data.activeUsers} active members`],
                ['All projects', data.projects, 'Across your workspace'],
                ['In progress', data.activeProjects, 'Active delivery initiatives'],
                ['Completed', data.completedProjects, 'Projects delivered'],
            ].map(([label, value, note], index) => <Box key={String(label)} sx={{ p: 6, borderRight: index < 3 ? 1 : 0, borderColor: 'divider' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography><Typography variant="h1" component="p" sx={{ my: 2, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>{note}</Typography></Box>)}
        </Paper>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }}><PageSection title="Workspace activity" description="New users and projects by month" sx={{ height: '100%' }}>
            <LineChart height={300} skipAnimation grid={{ horizontal: true }} margin={{ top: 16, right: 16, bottom: 32, left: 32 }}
              series={[{ data: data.trend.map(item => item.projects), label: 'Projects', color: theme.palette.text.primary, curve: 'linear', showMark: false }, { data: data.trend.map(item => item.users), label: 'Users', color: theme.palette.info.main, curve: 'linear', showMark: false }]}
              xAxis={[{ scaleType: 'point', data: data.trend.map(item => new Date(`${item.month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })), disableLine: true, disableTicks: true }]}
              yAxis={[{ disableLine: true, disableTicks: true }]}
            />
          </PageSection></Grid>
          <Grid size={{ xs: 12, md: 4 }}><PageSection title="Project status" description={`${data.projects} projects in total`} sx={{ height: '100%' }}>
            <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 300 }}>
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <PieChart width={180} height={180} skipAnimation hideLegend series={[{ innerRadius: 54, outerRadius: 78, paddingAngle: 3, cornerRadius: 3, data: data.distribution.map((item, index) => ({ id: item.status, value: item.count, label: statusLabel(item.status), color: colors[index] })) }]}/>
                <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Typography variant="h5" component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>{data.projects}</Typography>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                </Stack>
              </Box>
              <Stack sx={{ width: '100%', maxWidth: 260, gap: 3 }}>
                {data.distribution.map((item, index) => <Stack key={item.status} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}><Box component="span" style={{ borderRadius: tokens.radius.full }} sx={{ width: 8, height: 8, flexShrink: 0, bgcolor: colors[index] }} /><Typography variant="body2" noWrap>{statusLabel(item.status)}</Typography></Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{item.count} · {data.projects ? Math.round((item.count / data.projects) * 100) : 0}%</Typography>
                </Stack>)}
              </Stack>
            </Stack>
          </PageSection></Grid>
        </Grid>
        <PageSection title="Recently added projects" description="The latest initiatives in your workspace" actions={<Link component={RouterLink} to="/projects">View all projects</Link>} flush>
          <Table aria-label="Recent projects"><TableHead><TableRow><TableCell>Project</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>
            {data.recentProjects.map(project => <TableRow key={project.id}><TableCell><Stack sx={{ minWidth: 0, gap: 1 }}><Link component={RouterLink} to={`/projects/${project.id}`} sx={{ color: 'text.primary' }}>{project.name}</Link><Typography variant="caption" color="text.secondary" title={project.description} noWrap sx={{ display: 'block', maxWidth: 440 }}>{project.description}</Typography></Stack></TableCell><TableCell><StatusBadge status={project.status}/></TableCell><TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{project.createdAt.slice(0, 10)}</TableCell><TableCell align="right"><Button component={RouterLink} to={`/projects/${project.id}`} size="small" endIcon={<ArrowForward />}>Open</Button></TableCell></TableRow>)}
          </TableBody></Table>
        </PageSection>
      </>}
    </AsyncState>
  </PageLayout>;
}
