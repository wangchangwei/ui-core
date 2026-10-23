import { useCallback, useEffect, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useApp } from '../app/AppContext';
import { api } from '../domain/api';
import type { Profile } from '../domain/types';
import { FormField, PageLayout, PageSection } from '../shared/ui';
import { AsyncState } from '../shared/ui';
import { useUnsavedChanges } from '../shared/useUnsavedChanges';
export function ProfilePage() {
    const { notify, refresh } = useApp();
    const [profile, setProfile] = useState<Profile>();
    const [error, setError] = useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<{
        displayName: string;
    }>({ defaultValues: { displayName: '' } });
    const { dialog } = useUnsavedChanges(isDirty);
    const load = useCallback(() => { setError(null); return api.getProfile().then((value) => { setProfile(value); reset({ displayName: value.displayName }); }).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load profile')); }, [reset]);
    useEffect(() => { void load(); }, [load]);
    const submit = async (values: {
        displayName: string;
    }) => {
        try {
            const saved = await api.saveProfile(values);
            setProfile(saved);
            reset({ displayName: saved.displayName });
            await refresh();
            notify('Profile updated', 'success');
        }
        catch (e) {
            notify(e instanceof Error ? e.message : 'Unable to update profile', 'error');
        }
    };
    return <PageLayout title="Profile" description="Manage your account details."><AsyncState loading={!profile && !error} error={error} onRetry={() => void load()}>{profile && <PageSection><form onSubmit={handleSubmit(submit)}><Stack sx={{ gap: 3, maxWidth: 'sm' }}><FormField control={control} name="displayName" label="Display name" required/><TextField label="Email" value={profile.email} slotProps={{ input: { readOnly: true } }}/><TextField label="Role" value={profile.role} slotProps={{ input: { readOnly: true } }}/><Typography sx={{
                color: "text.secondary"
            }}>Your account email and role are managed by the workspace administrator.</Typography><Button variant="contained" type="submit" disabled={!isDirty || isSubmitting}>Save changes</Button></Stack></form></PageSection>}</AsyncState>{dialog}</PageLayout>;
}
