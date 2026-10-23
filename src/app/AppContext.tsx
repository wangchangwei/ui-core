import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';
import { auth, DEMO_ACCOUNTS } from '../domain/auth';
import { api } from '../domain/api';
import type { Profile, Session, Settings } from '../domain/types';
interface AppState {
    session: Session | null;
    settings: Settings;
    profile: Profile | null;
    storageError: string | null;
    refresh: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    notify: (message: string, severity?: AlertColor) => void;
}
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: {
    children: ReactNode;
}) {
    const [session, setSession] = useState(auth.getSession);
    const [settings, setSettings] = useState<Settings>({ appName: 'Forma', pageSize: 25 });
    const [profile, setProfile] = useState<Profile | null>(null);
    const [storageError, setStorageError] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        severity: AlertColor;
    } | null>(null);
    const refresh = useCallback(async () => {
        const current = auth.getSession();
        setSession(current);
        try {
            const [nextSettings, nextProfile] = await Promise.all([api.getSettings(), current ? api.getProfile() : Promise.resolve(null)]);
            setSettings(nextSettings);
            setProfile(nextProfile);
            setStorageError(null);
        }
        catch (error) {
            setStorageError(error instanceof Error ? error.message : 'Unable to read local demo data.');
            const account = DEMO_ACCOUNTS.find((item) => item.accountId === current?.accountId);
            setProfile(account ? { displayName: account.displayName, email: account.email, role: account.role } : null);
        }
    }, []);
    useEffect(() => { void refresh(); }, [refresh]);
    useEffect(() => { document.title = `${settings.appName} — Workspace`; }, [settings.appName]);
    const login = async (email: string, password: string) => { await auth.login(email, password); await refresh(); };
    const logout = () => { auth.logout(); setSession(null); setProfile(null); };
    return <Context.Provider value={{ session, settings, profile, storageError, refresh, login, logout, notify: (message, severity = 'success') => setToast({ message, severity }) }}>
    {children}<Snackbar open={!!toast} autoHideDuration={5000} onClose={(_, reason) => {
            if (reason !== 'clickaway')
                setToast(null);
        }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert severity={toast?.severity ?? 'success'} variant="filled" onClose={() => setToast(null)}>{toast?.message ?? ''}</Alert>
    </Snackbar>
  </Context.Provider>;
}
export function useApp() {
    const value = useContext(Context);
    if (!value)
        throw new Error('useApp requires AppProvider');
    return value;
}
