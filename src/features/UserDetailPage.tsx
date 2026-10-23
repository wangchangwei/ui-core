import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../domain/api';
import { can } from '../domain/permissions';
import { useApp } from '../app/AppContext';
import { AsyncState, ConfirmDialog, PageLayout, PageSection, StatusBadge } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
export function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session, notify } = useApp();
    const userResult = useAsync(() => api.getUser(id ?? ''), [id]);
    const projectsResult = useAsync(() => api.listProjects({ ownerId: id, pageSize: 100 }), [id]);
    const [confirm, setConfirm] = useState(false);
    const [pending, setPending] = useState(false);
    const remove = async () => { if (!id)
        return; setPending(true); try {
        await api.deleteUsers([id]);
        notify('User deleted', 'success');
        navigate('/users');
    }
    catch (e) {
        notify(e instanceof Error ? e.message : 'Unable to delete user', 'error');
    }
    finally {
        setPending(false);
        setConfirm(false);
    } };
    return <PageLayout title={userResult.data?.name ?? 'User'} description={userResult.data?.email} actions={userResult.data && can(session?.role, 'users:write') ? <Stack direction="row" sx={{ gap: 1 }}><Button component={RouterLink} to={`/users/${userResult.data.id}/edit`} startIcon={<EditOutlined />}>Edit</Button><Button color="error" onClick={() => setConfirm(true)}>Delete</Button></Stack> : undefined}><AsyncState loading={userResult.loading} error={userResult.error} onRetry={userResult.reload}>{userResult.data && <><PageSection title="Profile"><Stack sx={{ gap: 2 }}><Typography><strong>Email</strong><br />{userResult.data.email}</Typography><Typography><strong>Role</strong><br /><StatusBadge status={userResult.data.role}/></Typography><Typography><strong>Status</strong><br /><StatusBadge status={userResult.data.status}/></Typography><Typography sx={{ color: 'text.secondary' }}>Joined {userResult.data.createdAt}</Typography></Stack></PageSection><PageSection title="Projects"><AsyncState loading={projectsResult.loading} error={projectsResult.error} onRetry={projectsResult.reload} empty={!projectsResult.data?.items.length} emptyTitle="No projects owned"><Stack sx={{ gap: 1 }}>{projectsResult.data?.items.map((project) => <Button key={project.id} component={RouterLink} to={`/projects/${project.id}`} sx={{ justifyContent: 'flex-start' }}>{project.name}</Button>)}</Stack></AsyncState></PageSection></>}</AsyncState><ConfirmDialog open={confirm} title="Delete user?" description="Users assigned to projects cannot be deleted." onClose={() => setConfirm(false)} onConfirm={() => void remove()} pending={pending} destructive/></PageLayout>;
}
