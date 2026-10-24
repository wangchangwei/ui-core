import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForward from '@mui/icons-material/ArrowForward';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import { PageSection } from '../shared/ui';
import componentContractUrl from '../../docs/component-standards.md?url';
import adoptionGuideUrl from '../../docs/adoption-guide.md?url';

export function FrameworkOverview() {
  return <PageSection title="Build with UI Core" description="The reference for consistent interfaces across projects: foundations, component contracts, and working page patterns.">
    <Stack sx={{ gap: 4 }}>
      <Typography color="text.secondary" sx={{ maxWidth: '75ch' }}>Start with the shared theme and components, then choose the page pattern that fits your task. The examples demonstrate behavior; the contracts define what every project must preserve.</Typography>
      <Stack component="nav" aria-label="Page pattern references" direction="row" sx={{ gap: 3, flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/page-standards/table-list" variant="outlined" endIcon={<ArrowForward fontSize="small"/>}>Table list pattern</Button>
        <Button component={RouterLink} to="/page-standards/card-list" variant="outlined" endIcon={<ArrowForward fontSize="small"/>}>Card list pattern</Button>
        <Button component={RouterLink} to="/page-standards/detail" variant="outlined" endIcon={<ArrowForward fontSize="small"/>}>Detail pattern</Button>
        <Button component={RouterLink} to="/page-standards/form" variant="outlined" endIcon={<ArrowForward fontSize="small"/>}>Form pattern</Button>
      </Stack>
      <Stack direction="row" sx={{ gap: 4, alignItems: 'center', flexWrap: 'wrap', pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">Chinese implementation guides · Markdown</Typography>
        <Button component="a" href={componentContractUrl} download="ui-core-component-standards.md" startIcon={<DownloadOutlined fontSize="small"/>}>Component contracts</Button>
        <Button component="a" href={adoptionGuideUrl} download="ui-core-adoption-guide.md" startIcon={<DownloadOutlined fontSize="small"/>}>Project adoption guide</Button>
        <Button component="a" href="#component-contracts">Browse component inventory</Button>
      </Stack>
    </Stack>
  </PageSection>;
}

const componentInventory = [
  ['PageLayout / PageSection', 'Page title, actions, and content groups', 'One page heading; shared workspace width and spacing.'],
  ['FilterBar / DataTable', 'Search, comparison, sorting, and selection', 'Reset pagination after filters; preserve unique row IDs; confirm deletion.'],
  ['Card / CardContent / CardActions', 'Resource summaries and catalog browsing', '12px corners, 24px content padding, named article, separate actions.'],
  ['FormField / FormSection / FormActions', 'Validated creation and editing', 'Visible labels, field errors, pending submission, and unsaved changes protection.'],
  ['DetailRow / EntityAvatar', 'Properties and identifiable owners', 'Definition-list semantics; readable names and wrapping values.'],
  ['StatusBadge / Chip', 'Status and descriptive tags', 'Text carries meaning; statuses and filter tags remain distinct.'],
  ['AsyncState / Alert', 'Loading, empty results, and recovery', 'Distinguish empty data from no matches; provide a working recovery action.'],
  ['ConfirmDialog / Menu / Tooltip', 'Protected actions and contextual help', 'Named controls, keyboard access, focus restoration, and pending locks.'],
];

export function FrameworkContracts() {
  return <Box id="component-contracts" sx={{ scrollMarginTop: 8 }}>
    <PageSection title="Component contracts" description="Reuse the implementation and its behavior together. Data, permissions, and service requests belong to the consuming project.">
      <TableContainer><Table aria-label="UI Core component contracts">
        <TableHead><TableRow><TableCell scope="col">Component</TableCell><TableCell scope="col">Use</TableCell><TableCell scope="col">Required behavior</TableCell></TableRow></TableHead>
        <TableBody>{componentInventory.map(([component, use, contract]) => <TableRow key={component}><TableCell component="th" scope="row">{component}</TableCell><TableCell>{use}</TableCell><TableCell>{contract}</TableCell></TableRow>)}</TableBody>
      </Table></TableContainer>
      <Stack sx={{ gap: 2, mt: 6 }}>
        <Typography variant="subtitle1">Adoption checklist</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: '75ch' }}>Record the source commit. Install the theme and Geist fonts. Reuse shared components, connect your services, and apply the lint rules to your feature directory.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: '75ch' }}>Verify at 1280, 1440, and 1920px, including keyboard access, errors, permissions, and submission feedback. The current baseline is light theme and desktop; delivery is source code, with no standalone UI Core package published.</Typography>
      </Stack>
    </PageSection>
  </Box>;
}
