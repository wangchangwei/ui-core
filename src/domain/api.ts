import { auth } from './auth';
import { can, type Permission } from './permissions';
import { projectSchema, scenarioSchema, settingsSchema, userSchema } from './schemas';
import { seedScenarios } from './scenario-seed';
import { SCENARIO_CATEGORIES } from './types';
import type { DashboardData, ListQuery, PageResult, Profile, Project, ProjectInput, Scenario, ScenarioCategoryId, ScenarioInput, ScenarioListQuery, Settings, User, UserInput } from './types';
const STORAGE_KEY = 'forma:data:v1';
const VERSION = 1;
type Store = {
    version: number;
    users: User[];
    projects: Project[];
    scenarios: Scenario[];
    settings: Settings;
    profiles: Record<string, Profile>;
};
const accountProfiles: Record<string, Profile> = {
    'account-admin': { displayName: 'Alex Morgan', email: 'admin@example.com', role: 'admin' },
    'account-viewer': { displayName: 'Taylor Reed', email: 'viewer@example.com', role: 'viewer' },
};
function seedStore(): Store {
    const userMonthCounts = [3, 5, 4, 6, 7, 5, 8, 10, 9, 7];
    const projectMonthCounts = [1, 3, 2, 4, 3, 5, 2, 4, 3, 3];
    const monthForIndex = (index: number, counts: number[]) => {
        let offset = 0;
        for (let month = 0; month < counts.length; month += 1) {
            offset += counts[month];
            if (index < offset)
                return month + 1;
        }
        return counts.length;
    };
    const users: User[] = Array.from({ length: 64 }, (_, index) => {
        const first = ['Alex', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Sam', 'Jamie'][index % 8];
        const last = ['Morgan', 'Reed', 'Chen', 'Patel', 'Garcia', 'Smith', 'Kim', 'Brown'][Math.floor(index / 8)];
        const role = index % 9 === 0 ? 'admin' : index % 3 === 0 ? 'editor' : 'viewer';
        const status = index % 11 === 0 ? 'suspended' : index % 7 === 0 ? 'invited' : 'active';
        const month = monthForIndex(index, userMonthCounts);
        return { id: `user-${index + 1}`, name: `${first} ${last}`, email: `user${index + 1}@example.com`, role, status, createdAt: `2026-${String(month).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}` };
    });
    const projects: Project[] = Array.from({ length: 30 }, (_, index) => {
        const month = monthForIndex(index, projectMonthCounts);
        const startDate = `2026-${String(month).padStart(2, '0')}-01`;
        const endDate = `2026-${String(Math.min(month + 1, 12)).padStart(2, '0')}-20`;
        const statuses = ['active', 'planned', 'on-hold', 'completed'] as const;
        const initiatives = ['Website redesign', 'Analytics platform', 'Customer portal', 'Billing automation', 'Mobile onboarding', 'Support workspace', 'Inventory sync', 'Identity migration', 'Reporting suite', 'Partner API', 'Design system rollout', 'Data warehouse', 'Notification center', 'Search relevance', 'Pricing experiments', 'Team directory', 'Document approvals', 'Fraud monitoring', 'Release automation', 'Localization hub', 'Workflow builder', 'Consent manager', 'Campaign studio', 'Returns portal', 'Quality dashboard', 'Forecasting model', 'Security center', 'Vendor management', 'Help center', 'Developer portal'];
        return { id: `project-${index + 1}`, name: initiatives[index], description: `Cross-functional delivery initiative for the ${initiatives[index].toLowerCase()}.`, ownerId: users[index % users.length].id, status: statuses[index % statuses.length], startDate, endDate, createdAt: `${startDate}T09:00:00.000Z` };
    });
    return { version: VERSION, users, projects, scenarios: seedScenarios(), settings: { appName: 'Forma', pageSize: 25 }, profiles: structuredClone(accountProfiles) };
}
function writeStore(store: Store): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
function readStore(): Store {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const seeded = seedStore();
        writeStore(seeded);
        return seeded;
    }
    try {
        const value = JSON.parse(raw) as Store;
        if (value.version !== VERSION || !Array.isArray(value.users) || !Array.isArray(value.projects) || !value.settings || !value.profiles)
            throw new Error('invalid shape');
        // Add the new catalog to older v1 demo stores without discarding existing edits.
        if (!Array.isArray(value.scenarios))
            value.scenarios = seedScenarios();
        if (!settingsSchema.safeParse(value.settings).success || Object.keys(accountProfiles).some((key) => {
            const profile = value.profiles[key];
            return !profile || typeof profile.displayName !== 'string' || typeof profile.email !== 'string' || (profile.role !== 'admin' && profile.role !== 'viewer');
        }))
            throw new Error('invalid settings or profiles');
        if (value.users.some((user) => !user || typeof user.id !== 'string' || !userSchema.safeParse({ name: user.name, email: user.email, role: user.role, status: user.status }).success || typeof user.createdAt !== 'string'))
            throw new Error('invalid users');
        if (value.projects.some((project) => !project || typeof project.id !== 'string' || typeof project.createdAt !== 'string' || !projectSchema.safeParse({ name: project.name, description: project.description, ownerId: project.ownerId, status: project.status, startDate: project.startDate, endDate: project.endDate }).success))
            throw new Error('invalid projects');
        if (value.scenarios.some((scenario) => !scenario || typeof scenario.id !== 'string' || typeof scenario.updatedAt !== 'string' || !scenarioSchema.safeParse({ name: scenario.name, description: scenario.description, categoryIds: scenario.categoryIds, subflows: scenario.subflows, visibility: scenario.visibility }).success))
            throw new Error('invalid scenarios');
        return value;
    }
    catch {
        throw new Error('Persisted Forma data is corrupt. Use the reset action to restore the demo data.');
    }
}
function wait(): Promise<void> { return new Promise((resolve) => window.setTimeout(resolve, 20)); }
function requirePermission(permission: Permission): void {
    const session = auth.getSession();
    if (!session)
        throw new Error('Authentication required');
    if (!can(session.role, permission))
        throw new Error(`Permission denied: ${permission}`);
}
function currentSession() { const session = auth.getSession(); if (!session)
    throw new Error('Authentication required'); return session; }
function page<T>(items: T[], query: { page?: number; pageSize?: number } | undefined, defaultPageSize: number): PageResult<T> {
    const pageSize = Math.max(1, query?.pageSize ?? defaultPageSize);
    const currentPage = Math.max(1, query?.page ?? 1);
    return { total: items.length, items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize) };
}
function sort<T extends object>(items: T[], query: ListQuery | undefined): T[] {
    if (!query?.sortBy)
        return items;
    const direction = query.sortDirection === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => String((a as Record<string, unknown>)[query.sortBy!] ?? '').localeCompare(String((b as Record<string, unknown>)[query.sortBy!] ?? '')) * direction);
}
function emailTaken(users: User[], email: string, id?: string): boolean { return users.some((user) => user.id !== id && user.email.toLowerCase() === email.toLowerCase()); }
function id(): string { return crypto.randomUUID(); }
function today(): string { return new Date().toISOString().slice(0, 10); }
export const api = {
    async listUsers(query?: ListQuery): Promise<PageResult<User>> { requirePermission('users:read'); await wait(); const store = readStore(); const items = store.users.filter((user) => (!query?.search || `${user.name} ${user.email}`.toLowerCase().includes(query.search.toLowerCase())) && (!query?.status || user.status === query.status) && (!query?.role || user.role === query.role)); return page(sort(items, query), query, store.settings.pageSize); },
    async getUser(userId: string): Promise<User> { requirePermission('users:read'); await wait(); const user = readStore().users.find((item) => item.id === userId); if (!user)
        throw new Error('User not found'); return user; },
    async saveUser(input: UserInput, userId?: string): Promise<User> { requirePermission('users:write'); await wait(); const store = readStore(); const result = userSchema.safeParse(input); if (!result.success)
        throw new Error(result.error.issues[0]?.message ?? 'Invalid user'); if (emailTaken(store.users, input.email, userId))
        throw new Error('Email must be unique'); const existing = userId ? store.users.find((item) => item.id === userId) : undefined; if (userId && !existing)
        throw new Error('User not found'); const saved: User = { ...input, id: existing?.id ?? id(), createdAt: existing?.createdAt ?? today() }; store.users = existing ? store.users.map((item) => item.id === userId ? saved : item) : [saved, ...store.users]; writeStore(store); return saved; },
    async deleteUsers(ids: string[]): Promise<void> { requirePermission('users:write'); await wait(); const store = readStore(); if (ids.some((userId) => !store.users.some((user) => user.id === userId)))
        throw new Error('User not found'); if (store.projects.some((project) => ids.includes(project.ownerId)))
        throw new Error('Cannot delete a user referenced by a project'); store.users = store.users.filter((user) => !ids.includes(user.id)); writeStore(store); },
    async listProjects(query?: ListQuery): Promise<PageResult<Project>> { requirePermission('projects:read'); await wait(); const store = readStore(); const items = store.projects.filter((project) => (!query?.search || `${project.name} ${project.description}`.toLowerCase().includes(query.search.toLowerCase())) && (!query?.status || project.status === query.status) && (!query?.ownerId || project.ownerId === query.ownerId)); return page(sort(items, query), query, store.settings.pageSize); },
    async getProject(projectId: string): Promise<Project> { requirePermission('projects:read'); await wait(); const project = readStore().projects.find((item) => item.id === projectId); if (!project)
        throw new Error('Project not found'); return project; },
    async saveProject(input: ProjectInput, projectId?: string): Promise<Project> { requirePermission('projects:write'); await wait(); const store = readStore(); const result = projectSchema.safeParse(input); if (!result.success)
        throw new Error(result.error.issues[0]?.message ?? 'Invalid project'); if (!store.users.some((user) => user.id === input.ownerId))
        throw new Error('Owner not found'); const existing = projectId ? store.projects.find((item) => item.id === projectId) : undefined; if (projectId && !existing)
        throw new Error('Project not found'); const saved: Project = { ...input, id: existing?.id ?? id(), createdAt: existing?.createdAt ?? `${today()}T09:00:00.000Z` }; store.projects = existing ? store.projects.map((item) => item.id === projectId ? saved : item) : [saved, ...store.projects]; writeStore(store); return saved; },
    async deleteProject(projectId: string): Promise<void> { requirePermission('projects:write'); await wait(); const store = readStore(); if (!store.projects.some((project) => project.id === projectId))
        throw new Error('Project not found'); store.projects = store.projects.filter((project) => project.id !== projectId); writeStore(store); },
    async listScenarios(query?: ScenarioListQuery): Promise<PageResult<Scenario>> { requirePermission('scenarios:read'); await wait(); const items = readStore().scenarios.filter((scenario) => (!query?.search || `${scenario.name} ${scenario.description}`.toLowerCase().includes(query.search.toLowerCase())) && (!query?.categoryId || scenario.categoryIds.includes(query.categoryId))); return page(sort(items, query), query, 12); },
    async getScenarioCounts(): Promise<{ total: number } & Record<ScenarioCategoryId, number>> { requirePermission('scenarios:read'); await wait(); const scenarios = readStore().scenarios; return { total: scenarios.length, ...Object.fromEntries(SCENARIO_CATEGORIES.map(({ id: categoryId }) => [categoryId, scenarios.filter((scenario) => scenario.categoryIds.includes(categoryId)).length])) } as { total: number } & Record<ScenarioCategoryId, number>; },
    async saveScenario(input: ScenarioInput): Promise<Scenario> { requirePermission('scenarios:write'); await wait(); const parsed = scenarioSchema.safeParse(input); if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid scenario'); const store = readStore(); const saved: Scenario = { ...parsed.data, id: id(), updatedAt: new Date().toISOString() }; store.scenarios = [saved, ...store.scenarios]; writeStore(store); return saved; },
    async importScenarios(inputs: ScenarioInput[]): Promise<number> { requirePermission('scenarios:write'); await wait(); if (!inputs.length || inputs.length > 100)
        throw new Error('Choose a JSON file with between 1 and 100 scenarios'); const parsed = inputs.map((input) => scenarioSchema.safeParse(input)); const invalid = parsed.find((result) => !result.success); if (invalid && !invalid.success)
        throw new Error(invalid.error.issues[0]?.message ?? 'Invalid scenario'); const store = readStore(); const imported = parsed.map((result) => { if (!result.success)
        throw new Error('Invalid scenario'); return { ...result.data, id: id(), updatedAt: new Date().toISOString() }; }); store.scenarios = [...imported, ...store.scenarios]; writeStore(store); return imported.length; },
    async setScenarioVisibility(scenarioId: string, visibility: Scenario['visibility']): Promise<Scenario> { requirePermission('scenarios:write'); await wait(); const store = readStore(); const existing = store.scenarios.find((scenario) => scenario.id === scenarioId); if (!existing)
        throw new Error('Scenario not found'); const saved = { ...existing, visibility, updatedAt: new Date().toISOString() }; store.scenarios = store.scenarios.map((scenario) => scenario.id === scenarioId ? saved : scenario); writeStore(store); return saved; },
    async deleteScenario(scenarioId: string): Promise<void> { requirePermission('scenarios:write'); await wait(); const store = readStore(); if (!store.scenarios.some((scenario) => scenario.id === scenarioId))
        throw new Error('Scenario not found'); store.scenarios = store.scenarios.filter((scenario) => scenario.id !== scenarioId); writeStore(store); },
    async getDashboard(): Promise<DashboardData> { requirePermission('dashboard:read'); await wait(); const store = readStore(); const latestMonth = Math.max(1, ...[...store.users, ...store.projects].map((item) => Number(item.createdAt.slice(5, 7)) || 1)); const trend = Array.from({ length: latestMonth }, (_, index) => { const month = String(index + 1).padStart(2, '0'); return { month: `2026-${month}`, projects: store.projects.filter((project) => project.createdAt.startsWith(`2026-${month}`)).length, users: store.users.filter((user) => user.createdAt.startsWith(`2026-${month}`)).length }; }); return { users: store.users.length, activeUsers: store.users.filter((user) => user.status === 'active').length, projects: store.projects.length, activeProjects: store.projects.filter((project) => project.status === 'active').length, completedProjects: store.projects.filter((project) => project.status === 'completed').length, trend, distribution: (['active', 'planned', 'on-hold', 'completed'] as const).map((status) => ({ status, count: store.projects.filter((project) => project.status === status).length })), recentProjects: [...store.projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5) }; },
    async getSettings(): Promise<Settings> { await wait(); return readStore().settings; },
    async saveSettings(input: Settings): Promise<Settings> { requirePermission('settings:write'); await wait(); const result = settingsSchema.safeParse(input); if (!result.success)
        throw new Error(result.error.issues[0]?.message ?? 'Invalid settings'); const store = readStore(); store.settings = input; writeStore(store); return input; },
    async getProfile(): Promise<Profile> { const session = currentSession(); await wait(); const profile = readStore().profiles[session.accountId]; if (!profile)
        throw new Error('Profile not found'); return profile; },
    async saveProfile(input: {
        displayName: string;
    }): Promise<Profile> { const session = currentSession(); requirePermission('profile:write'); await wait(); if (!input.displayName.trim())
        throw new Error('Display name is required'); const store = readStore(); const profile = { ...store.profiles[session.accountId], displayName: input.displayName.trim() }; store.profiles[session.accountId] = profile; writeStore(store); return profile; },
    async reset(): Promise<void> { requirePermission('settings:write'); await wait(); writeStore(seedStore()); },
    async listOwners(): Promise<{
        id: string;
        name: string;
    }[]> { requirePermission('projects:read'); await wait(); return readStore().users.map(({ id: userId, name }) => ({ id: userId, name })); },
};
