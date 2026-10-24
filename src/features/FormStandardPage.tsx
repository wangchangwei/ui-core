import { useRef, useState } from 'react';
import { Box, Button, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createExampleService, exampleCategories, exampleResourceSchema, type ExampleResourceInput } from '../domain/page-standard-example';
import { AsyncState, FormActions, FormField, FormSection, PageLayout, PageSection } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useUnsavedChanges } from '../shared/useUnsavedChanges';
import { useApp } from '../app/AppContext';

function ResourceEditor({ initial, id, service }: { initial: ExampleResourceInput; id?: string; service: ReturnType<typeof createExampleService> }) {
  const { notify } = useApp();
  const navigate = useNavigate();
  const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<ExampleResourceInput>({ defaultValues: initial, resolver: zodResolver(exampleResourceSchema) });
  const { dialog } = useUnsavedChanges(isDirty);
  const savedId = useRef(id);
  const lastSaved = useRef(JSON.stringify(initial));
  const lock = useRef(false);
  const submit = async (values: ExampleResourceInput) => {
    if (lock.current || lastSaved.current === JSON.stringify(values)) return;
    lock.current = true;
    try {
      const saved = savedId.current ? await service.update(savedId.current, values) : await service.create(values);
      savedId.current = saved.id;
      const fields = { name: saved.name, description: saved.description, categoryId: saved.categoryId, tag: saved.tag, status: saved.status };
      lastSaved.current = JSON.stringify(fields);
      reset(fields);
      notify('Resource saved');
    } catch (error) { notify(error instanceof Error ? error.message : 'Unable to save resource.', 'error'); }
    finally { lock.current = false; }
  };
  return <><PageSection flush><form noValidate onSubmit={event => { void handleSubmit(submit)(event); }}>
    <FormSection title="Resource details" description="Give this resource a name and a short description.">
      <FormField name="name" label="Name" control={control} required/>
      <FormField name="description" label="Description" control={control} multiline minRows={3}/>
    </FormSection>
    <FormSection title="Classification" description="Choose where this resource belongs and how it is organized.">
      <FormField name="categoryId" label="Category" control={control} select required>{exampleCategories.flatMap(parent => parent.children.map(child => <MenuItem key={child.id} value={child.id}>{parent.label} / {child.label}</MenuItem>))}</FormField>
      <FormField name="tag" label="Tag" control={control} select><MenuItem value="Enterprise">Enterprise</MenuItem><MenuItem value="Internal">Internal</MenuItem></FormField>
      <FormField name="status" label="Status" control={control} select><MenuItem value="planned">Planned</MenuItem><MenuItem value="active">Active</MenuItem></FormField>
    </FormSection>
    <FormActions hint="Required fields are marked with *."><Button type="button" onClick={() => navigate(id ? `/page-standards/detail?id=${id}` : '/page-standards/card-list')}>Cancel</Button><Button variant="contained" type="submit" disabled={!isDirty || isSubmitting}>{isSubmitting ? 'Saving…' : 'Save resource'}</Button></FormActions>
  </form></PageSection>{dialog}</>;
}
export function FormStandardPage() {
  const [service] = useState(createExampleService);
  const [params] = useSearchParams();
  const id = params.get('id') ?? undefined;
  const result = useAsync<ExampleResourceInput>(() => id ? service.get(id) : Promise.resolve({ name: '', description: '', categoryId: 'campaigns', tag: 'Internal', status: 'planned' }), [id]);
  return <Box data-testid="page-anatomy"><PageLayout title={id ? 'Edit resource' : 'New resource'} description="Set the details, classification, and status of your resource.">
    <AsyncState loading={result.loading} error={result.error} onRetry={result.reload}>{result.data && <ResourceEditor key={id ?? 'new'} initial={result.data} id={id} service={service}/>}</AsyncState>
  </PageLayout></Box>;
}
