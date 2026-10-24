import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../domain/api';
import { can } from '../domain/permissions';
import { useApp } from '../app/AppContext';
import { AsyncState, ConfirmDialog, DetailRow, EntityAvatar, PageLayout, PageSection, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
export function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session, notify } = useApp();
    const result = useAsync(async () => { const project = await api.getProject(id ?? ''); const owners = await api.listOwners(); return { project, owner: owners.find((item) => item.id === project.ownerId) }; }, [id]);
    const [confirm, setConfirm] = useState(false);
    const [pending, setPending] = useState(false);
    const remove = async () => { if (!id)
        return; setPending(true); try {
        await api.deleteProject(id);
        notify('Project deleted', 'success');
        navigate('/projects');
    }
    catch (e) {
        notify(e instanceof Error ? e.message : 'Unable to delete project', 'error');
    }
    finally {
        setPending(false);
        setConfirm(false);
    } };
    const owner = result.data?.owner;
    return <PageLayout title={result.data?.project.name ?? 'Project'} description={result.data?.project.description} actions={result.data && can(session?.role, 'projects:write') ? <Stack direction="row" sx={{ gap: 1 }}><Button component={RouterLink} to={`/projects/${id}/edit`}>Edit</Button><Button color="error" onClick={() => setConfirm(true)}>Delete</Button></Stack> : undefined}><AsyncState loading={result.loading} error={result.error} onRetry={result.reload}>{result.data && <PageSection title="Overview"><Stack sx={{ gap: 3 }}><Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}><EntityAvatar name={result.data.project.name} size="medium"/><Typography variant="subtitle1" component="span">{result.data.project.name}</Typography></Stack><Stack component="dl" sx={{ gap: 0, m: 0 }}><DetailRow label="Status"><StatusBadge status={result.data.project.status}/></DetailRow><DetailRow label="Owner">{owner && can(session?.role, 'users:read') ? <Button component={RouterLink} to={`/users/${owner.id}`} sx={{ p: 0, justifyContent: 'flex-start' }}>{owner.name}</Button> : owner?.name ?? 'Unknown owner'}</DetailRow><DetailRow label="Timeline">{result.data.project.startDate} → {result.data.project.endDate}</DetailRow></Stack></Stack></PageSection>}</AsyncState><ConfirmDialog open={confirm} title="Delete project?" description="This action cannot be undone." onClose={() => setConfirm(false)} onConfirm={() => void remove()} pending={pending} destructive/></PageLayout>;
}
