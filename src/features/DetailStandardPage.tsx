import { useState } from 'react';
import { Alert, Box, Button, Chip, Link, Stack, Typography } from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { createExampleService, exampleCategories, ExampleResourceNotFoundError, type ExampleResource } from '../domain/page-standard-example';
import { AsyncState, DetailRow, PageLayout, PageSection, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';

export function DetailStandardPage() {
  const [service] = useState(createExampleService);
  const [params] = useSearchParams();
  const id = params.get('id') ?? 'example-1';
  const result = useAsync<ExampleResource | null>(() => service.get(id).catch(error => {
    if (error instanceof ExampleResourceNotFoundError) return null;
    throw error;
  }), [id]);
  const resource = result.data ?? undefined;
  const relatedResult = useAsync<ExampleResource[] | null>(() => resource
    ? service.list({ search: '', parentId: '', categoryId: resource.categoryId, tag: '', status: '', sortBy: 'name', sortDirection: 'asc', page: 0, pageSize: 3 })
      .then(related => related.items.filter(item => item.id !== id).slice(0, 2))
    : Promise.resolve(null), [id, resource?.categoryId]);
  const notFound = !result.loading && !result.error && result.data === null;
  const parent = exampleCategories.find(item => item.children.some(child => child.id === resource?.categoryId));
  const category = parent?.children.find(item => item.id === resource?.categoryId);
  return <Box data-testid="page-anatomy"><PageLayout title={notFound ? 'Resource not found' : resource?.name ?? 'Resource details'} description={resource?.description}
    actions={resource ? <Button component={RouterLink} to={`/page-standards/form?id=${resource.id}`} variant="outlined" startIcon={<EditOutlined/>}>Edit resource</Button> : undefined}>
    {notFound ? <Stack sx={{ gap: 3 }}>
      <Alert severity="info">This resource no longer exists.</Alert>
      <Button component={RouterLink} to="/page-standards/card-list" variant="outlined">Back to resources</Button>
    </Stack> : <AsyncState loading={result.loading} error={result.error} onRetry={result.reload}>
      {resource && <>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}><StatusBadge status={resource.status}/><Chip label={resource.tag} variant="outlined"/><Typography variant="body2" color="text.secondary">{resource.id}</Typography></Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 6 }}>
          <PageSection title="Overview"><Box component="dl" sx={{ m: 0 }}>
            <DetailRow label="Name">{resource.name}</DetailRow>
            <DetailRow label="Category">{parent?.label} / {category?.label}</DetailRow>
            <DetailRow label="Tag"><Chip label={resource.tag} variant="outlined"/></DetailRow>
            <DetailRow label="Status"><StatusBadge status={resource.status}/></DetailRow>
            <DetailRow label="Updated">{resource.updatedAt}</DetailRow>
          </Box></PageSection>
          <PageSection title="Related resources"><AsyncState loading={relatedResult.loading && !relatedResult.data} error={relatedResult.error} onRetry={relatedResult.reload} empty={!relatedResult.loading && relatedResult.data?.length === 0} emptyTitle="No related resources" emptyDescription="Related resources will appear here."><Stack sx={{ gap: 4 }}>
            {relatedResult.data?.map(item => <Box key={item.id} sx={{ pb: 4, borderBottom: 1, borderColor: 'divider' }}>
              <Link component={RouterLink} to={`/page-standards/detail?id=${item.id}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>{item.name}<ArrowForward fontSize="small"/></Link>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{item.description}</Typography>
            </Box>)}
          </Stack></AsyncState></PageSection>
        </Box>
        <PageSection title="Activity"><Stack sx={{ gap: 1 }}><Typography variant="subtitle2">Resource updated</Typography><Typography color="text.secondary">{resource.updatedAt}</Typography></Stack></PageSection>
      </>}
    </AsyncState>}
  </PageLayout></Box>;
}
