import { Box, Button, Grid, Link, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import ArrowForward from "@mui/icons-material/ArrowForward";
import { LineChart, PieChart } from '@mui/x-charts';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../domain/api';
import { PageLayout, PageSection, StatusBadge, AsyncState } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
export function DashboardPage() {
    const { data, loading, error, reload } = useAsync(() => api.getDashboard());
    const theme = useTheme();
    const colors = [theme.palette.success.main, theme.palette.text.secondary, theme.palette.warning.main, theme.palette.text.primary];
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
          <Grid size={8}><PageSection title="Workspace activity" description="New users and projects by month">
            <LineChart height={280} skipAnimation grid={{ horizontal: true }} series={[{ data: data.trend.map(item => item.projects), label: 'Projects', color: theme.palette.text.primary, curve: 'linear' }, { data: data.trend.map(item => item.users), label: 'Users', color: theme.palette.info.main, curve: 'linear' }]} xAxis={[{ scaleType: 'point', data: data.trend.map(item => new Date(`${item.month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })) }]}/>
          </PageSection></Grid>
          <Grid size={4}><PageSection title="Project status" description={`${data.projects} projects in total`}>
            <PieChart height={280} skipAnimation series={[{ innerRadius: 55, outerRadius: 85, paddingAngle: 3, cornerRadius: 3, data: data.distribution.map((item, index) => ({ id: item.status, value: item.count, label: item.status === 'on-hold' ? 'On hold' : item.status.charAt(0).toUpperCase() + item.status.slice(1), color: colors[index] })) }]}/>
          </PageSection></Grid>
        </Grid>
        <PageSection title="Recently added projects" description="The latest initiatives in your workspace" actions={<Link component={RouterLink} to="/projects">View all projects</Link>} flush>
          <Table aria-label="Recent projects"><TableHead><TableRow><TableCell>Project</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>
            {data.recentProjects.map(project => <TableRow key={project.id}><TableCell><Stack spacing={1}><Link component={RouterLink} to={`/projects/${project.id}`} sx={{ color: 'text.primary' }}>{project.name}</Link><Typography variant="body2" sx={{ color: 'text.secondary' }}>{project.description}</Typography></Stack></TableCell><TableCell><StatusBadge status={project.status}/></TableCell><TableCell>{project.createdAt.slice(0, 10)}</TableCell><TableCell align="right"><Button component={RouterLink} to={`/projects/${project.id}`} size="small" endIcon={<ArrowForward />}>Open</Button></TableCell></TableRow>)}
          </TableBody></Table>
        </PageSection>
      </>}
    </AsyncState>
  </PageLayout>;
}
