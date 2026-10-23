import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, MenuItem, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../domain/api';
import { projectSchema } from '../domain/schemas';
import type { ProjectInput } from '../domain/types';
import { useApp } from '../app/AppContext';
import { AsyncState, FormField, PageLayout, PageSection } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useUnsavedChanges } from '../shared/useUnsavedChanges';
function ProjectEditor({ initial, id, owners }: {
    initial: ProjectInput;
    id?: string;
    owners: {
        id: string;
        name: string;
    }[];
}) { const navigate = useNavigate(); const { notify } = useApp(); const { control, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: initial }); const { dialog, allowNavigation } = useUnsavedChanges(isDirty); const submit = async (input: ProjectInput) => { try {
    const saved = await api.saveProject(input, id);
    allowNavigation();
    notify(id ? 'Project updated' : 'Project created', 'success');
    navigate(`/projects/${saved.id}`);
}
catch (e) {
    notify(e instanceof Error ? e.message : 'Unable to save project', 'error');
} }; return <form noValidate onSubmit={handleSubmit(submit)}><Stack sx={{ gap: 3, maxWidth: 'sm' }}><FormField control={control} name="name" label="Name" autoFocus required/><FormField control={control} name="description" label="Description" multiline minRows={3}/><FormField control={control} name="ownerId" label="Owner" select required>{owners.map((owner) => <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>)}</FormField><FormField control={control} name="status" label="Status" select>{(['active', 'planned', 'on-hold', 'completed'] as const).map((value) => <MenuItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</MenuItem>)}</FormField><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}><FormField control={control} name="startDate" label="Start date" type="date" slotProps={{ inputLabel: { shrink: true } }} required/><FormField control={control} name="endDate" label="End date" type="date" slotProps={{ inputLabel: { shrink: true } }} required/></Stack><Stack direction="row" sx={{ gap: 1 }}><Button type="button" onClick={() => navigate(id ? `/projects/${id}` : '/projects')}>Cancel</Button><Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>{isSubmitting ? 'Saving…' : id ? 'Save changes' : 'Create project'}</Button></Stack></Stack>{dialog}</form>; }
export function ProjectFormPage() { const { id } = useParams(); const editing = Boolean(id); const result = useAsync(async () => { const owners = await api.listOwners(); const project = id ? await api.getProject(id) : undefined; return { owners, project }; }, [id]); const initial = result.data?.project ? { name: result.data.project.name, description: result.data.project.description, ownerId: result.data.project.ownerId, status: result.data.project.status, startDate: result.data.project.startDate, endDate: result.data.project.endDate } : result.data ? { name: '', description: '', ownerId: '', status: 'planned' as const, startDate: '', endDate: '' } : undefined; return <PageLayout title={editing ? 'Edit project' : 'New project'} description="Capture ownership, timing and delivery status."><AsyncState loading={result.loading} error={result.error} onRetry={result.reload}>{initial && result.data && <PageSection><ProjectEditor key={id ?? 'new'} initial={initial} id={id} owners={result.data.owners}/></PageSection>}</AsyncState></PageLayout>; }
