import type { Role, Session } from './types';
export interface DemoAccount {
    accountId: string;
    email: string;
    role: Role;
    displayName: string;
    password: string;
}
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
    { accountId: 'account-admin', email: 'admin@example.com', role: 'admin', displayName: 'Alex Morgan', password: 'Demo123!' },
    { accountId: 'account-viewer', email: 'viewer@example.com', role: 'viewer', displayName: 'Taylor Reed', password: 'Demo123!' },
];
const SESSION_KEY = 'forma:session';
const sessionFor = (account: DemoAccount): Session => ({ accountId: account.accountId, email: account.email, role: account.role });
export const auth = {
    getSession(): Session | null {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw)
                return null;
            const value = JSON.parse(raw) as Partial<Session>;
            const account = DEMO_ACCOUNTS.find((item) => item.accountId === value.accountId && item.email === value.email && item.role === value.role);
            return account ? sessionFor(account) : null;
        }
        catch {
            return null;
        }
    },
    async login(email: string, password: string): Promise<Session> {
        await delay();
        const account = DEMO_ACCOUNTS.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
        if (!account)
            throw new Error('Invalid email or password');
        const session = sessionFor(account);
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        catch {
            throw new Error('Browser storage is unavailable. Enable site storage and try signing in again.');
        }
        return session;
    },
    logout(): void { sessionStorage.removeItem(SESSION_KEY); },
};
function delay(): Promise<void> { return new Promise((resolve) => window.setTimeout(resolve, 20)); }
