import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, MenuItem, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../domain/api';
import { userSchema } from '../domain/schemas';
import type { UserInput } from '../domain/types';
import { useApp } from '../app/AppContext';
import { AsyncState, FormField, PageLayout, PageSection } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useUnsavedChanges } from '../shared/useUnsavedChanges';
function UserEditor({ initial, id }: {
    initial: UserInput;
    id?: string;
}) {
    const navigate = useNavigate();
    const { notify } = useApp();
    const { control, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<UserInput>({ resolver: zodResolver(userSchema), defaultValues: initial });
    const { dialog, allowNavigation } = useUnsavedChanges(isDirty);
    const submit = async (input: UserInput) => { try {
        const saved = await api.saveUser(input, id);
        allowNavigation();
        notify(id ? 'User updated' : 'User created', 'success');
        navigate(`/users/${saved.id}`);
    }
    catch (e) {
        notify(e instanceof Error ? e.message : 'Unable to save user', 'error');
    } };
    return <form noValidate onSubmit={handleSubmit(submit)}><Stack sx={{ gap: 3, maxWidth: 'sm' }}><FormField control={control} name="name" label="Name" autoFocus required/><FormField control={control} name="email" label="Email" type="email" required/><FormField control={control} name="role" label="Role" select>{(['admin', 'editor', 'viewer'] as const).map((value) => <MenuItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</MenuItem>)}</FormField><FormField control={control} name="status" label="Status" select>{(['active', 'invited', 'suspended'] as const).map((value) => <MenuItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</MenuItem>)}</FormField><Stack direction="row" sx={{ gap: 1 }}><Button type="button" onClick={() => navigate(id ? `/users/${id}` : '/users')}>Cancel</Button><Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>{isSubmitting ? 'Saving…' : id ? 'Save changes' : 'Create user'}</Button></Stack></Stack>{dialog}</form>;
}
export function UserFormPage() { const { id } = useParams(); const editing = Boolean(id); const result = useAsync(() => id ? api.getUser(id).then((user) => ({ name: user.name, email: user.email, role: user.role, status: user.status })) : Promise.resolve<UserInput>({ name: '', email: '', role: 'viewer', status: 'active' }), [id]); return <PageLayout title={editing ? 'Edit user' : 'New user'} description={editing ? 'Update access and profile details.' : 'Invite a new member to the workspace.'}><AsyncState loading={result.loading} error={result.error} onRetry={result.reload}>{result.data && <PageSection><UserEditor key={id ?? 'new'} initial={result.data} id={id}/></PageSection>}</AsyncState></PageLayout>; }
