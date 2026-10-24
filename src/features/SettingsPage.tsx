import { useCallback, useEffect, useState } from 'react';
import { Button, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../domain/api';
import { settingsSchema } from '../domain/schemas';
import type { Settings } from '../domain/types';
import { useApp } from '../app/AppContext';
import { AsyncState, ConfirmDialog, FormActions, FormField, FormSection, PageLayout, PageSection } from '../shared/ui';
import { useUnsavedChanges } from '../shared/useUnsavedChanges';
export function SettingsPage() {
    const { notify, refresh } = useApp();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Settings>();
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState(false);
    const [pending, setPending] = useState(false);
    const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<Settings>({ resolver: zodResolver(settingsSchema), defaultValues: { appName: '', pageSize: 25 } });
    const { dialog, allowNavigation } = useUnsavedChanges(isDirty);
    const load = useCallback(() => { setError(null); return api.getSettings().then((value) => { setSettings(value); reset(value); }).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load settings')); }, [reset]);
    useEffect(() => { void load(); }, [load]);
    const submit = async (values: Settings) => {
        try {
            const saved = await api.saveSettings(values);
            setSettings(saved);
            reset(saved);
            await refresh();
            notify('Settings saved', 'success');
        }
        catch (e) {
            notify(e instanceof Error ? e.message : 'Unable to save settings', 'error');
        }
    };
    const resetDemo = async () => {
        setPending(true);
        try {
            await api.reset();
            await refresh();
            notify('Demo data restored', 'success');
            allowNavigation();
            navigate('/dashboard');
        }
        catch (e) {
            notify(e instanceof Error ? e.message : 'Unable to reset demo', 'error');
        }
        finally {
            setPending(false);
            setConfirm(false);
        }
    };
    return <PageLayout title="Settings" description="Configure workspace defaults and demo data."><AsyncState loading={!settings && !error} error={error} onRetry={() => void load()}>{settings && <><PageSection flush><form onSubmit={handleSubmit(submit)}><FormSection title="Workspace defaults" description="Set the application name and table density for your team."><FormField control={control} name="appName" label="Application name" required/><FormField control={control} name="pageSize" label="Default page size" helperText="Applied when opening the users table." select>{[25, 50, 100].map((value) => <MenuItem key={value} value={value}>{value} rows</MenuItem>)}</FormField></FormSection><FormActions hint="These defaults apply to everyone in the workspace."><Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>Save changes</Button></FormActions></form></PageSection><PageSection title="Demo data" description="Restore the seeded users, projects and preferences."><Button color="error" variant="outlined" onClick={() => setConfirm(true)}>Reset demo data</Button></PageSection></>}</AsyncState><ConfirmDialog open={confirm} title="Reset demo data?" description="All local changes will be replaced by the original demo dataset." onClose={() => setConfirm(false)} onConfirm={() => void resetDemo()} pending={pending} confirmLabel="Reset demo data" destructive/>{dialog}</PageLayout>;
}
