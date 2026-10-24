import { beforeEach, describe, expect, it } from 'vitest';
import { api } from './api';
import { auth } from './auth';

describe('mock api', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await auth.login('admin@example.com', 'Demo123!');
    await api.reset();
  });

  it('provides seeded users and projects with filtering, sorting and pagination', async () => {
    const users = await api.listUsers({ page: 1, pageSize: 25, sortBy: 'name', sortDirection: 'asc' });
    expect(users.total).toBe(64);
    expect(users.items).toHaveLength(25);
    expect(users.items[0].name.localeCompare(users.items[1].name)).toBeLessThanOrEqual(0);
    const projects = await api.listProjects({ status: 'active', pageSize: 100 });
    expect(projects.items.every((project) => project.status === 'active')).toBe(true);
    expect((await api.listUsers()).items).toHaveLength(25);
    await api.saveSettings({ appName: 'Acme', pageSize: 50 });
    expect((await api.listUsers()).items).toHaveLength(50);
  });

  it('persists CRUD and prevents deleting referenced users', async () => {
    const created = await api.saveUser({ name: 'New Person', email: 'new@example.com', role: 'viewer', status: 'active' });
    expect((await api.getUser(created.id)).email).toBe('new@example.com');
    await expect(api.deleteUsers([created.id, 'missing'])).rejects.toThrow();
    const owner = (await api.listOwners()).find((item) => item.id === 'user-1')!;
    await expect(api.deleteUsers([owner.id])).rejects.toThrow(/project/i);
    expect((await api.listUsers({ search: 'new@example.com', pageSize: 100 })).total).toBe(1);
  });

  it('filters, paginates, imports and persists scenario catalog mutations atomically', async () => {
    expect((await api.getScenarioCounts()).total).toBe(18);
    const onboarding = await api.listScenarios({ categoryId: 'onboarding', pageSize: 100 });
    expect(onboarding.items.length).toBeGreaterThan(0);
    expect(onboarding.items.every((scenario) => scenario.categoryIds.includes('onboarding'))).toBe(true);
    const page = await api.listScenarios({ page: 2, pageSize: 12 });
    expect(page.items).toHaveLength(6);

    const saved = await api.saveScenario({ name: 'Manager onboarding', description: 'Unique atomic deletion probe.', categoryIds: ['onboarding'], subflows: ['Account setup'], visibility: 'visible' });
    expect((await api.listScenarios({ search: 'unique atomic' })).items[0]?.id).toBe(saved.id);
    const hidden = await api.setScenarioVisibility(saved.id, 'hidden');
    expect(hidden.visibility).toBe('hidden');
    const invalid = { name: '', description: '', categoryIds: [], subflows: [], visibility: 'visible' } as unknown as Parameters<typeof api.importScenarios>[0][number];
    await expect(api.importScenarios([{ name: 'Imported scenario', description: '', categoryIds: ['recruitment'], subflows: [], visibility: 'visible' }, invalid])).rejects.toThrow();
    expect((await api.getScenarioCounts()).total).toBe(19);

    await api.importScenarios([{ name: 'Imported scenario', description: 'A valid import.', categoryIds: ['recruitment'], subflows: [], visibility: 'visible' }]);
    expect((await api.listScenarios({ search: 'valid import' })).total).toBe(1);
    await api.deleteScenario(saved.id);
    await expect(api.listScenarios({ search: 'unique atomic' })).resolves.toMatchObject({ total: 0 });
    await api.reset();
    expect((await api.getScenarioCounts()).total).toBe(18);
  });

  it('rejects duplicate email and invalid project owner/date', async () => {
    const existing = (await api.listUsers({ pageSize: 1 })).items[0];
    await expect(api.saveUser({ name: 'Duplicate', email: existing.email.toUpperCase(), role: 'viewer', status: 'active' })).rejects.toThrow(/email/i);
    await expect(api.saveProject({ name: 'Bad', description: '', ownerId: 'missing', status: 'planned', startDate: '2026-03-01', endDate: '2026-02-01' })).rejects.toThrow();
  });

  it('derives dashboard from current data and supports settings/profile/reset', async () => {
    const before = await api.getDashboard();
    expect(before.users).toBe(64);
    await api.saveSettings({ appName: 'Acme', pageSize: 50 });
    expect(await api.getSettings()).toEqual({ appName: 'Acme', pageSize: 50 });
    expect(await api.getProfile()).toMatchObject({ email: 'admin@example.com', displayName: 'Alex Morgan' });
    await api.saveProfile({ displayName: 'Updated Admin' });
    expect((await api.getProfile()).displayName).toBe('Updated Admin');
    await api.reset();
    expect(await api.getSettings()).toEqual({ appName: 'Forma', pageSize: 25 });
    expect((await api.getProfile()).displayName).toBe('Alex Morgan');
  });

  it('enforces viewer permissions and reports corrupt storage clearly', async () => {
    sessionStorage.clear();
    await auth.login('viewer@example.com', 'Demo123!');
    await expect(api.listUsers()).rejects.toThrow(/permission/i);
    expect((await api.listProjects({ pageSize: 1 })).total).toBe(30);
    expect((await api.listScenarios({ pageSize: 1 })).total).toBe(18);
    await expect(api.saveScenario({ name: 'Blocked', description: '', categoryIds: ['beta'], subflows: [], visibility: 'visible' })).rejects.toThrow(/permission/i);
    await expect(api.reset()).rejects.toThrow(/permission/i);
    localStorage.setItem('forma:data:v1', '{broken');
    await auth.login('admin@example.com', 'Demo123!');
    await expect(api.listUsers()).rejects.toThrow(/corrupt|reset/i);
  });

  it('rejects structurally malformed persisted records', async () => {
    const stored = JSON.parse(localStorage.getItem('forma:data:v1')!);
    stored.users[0].name = 42;
    localStorage.setItem('forma:data:v1', JSON.stringify(stored));
    await expect(api.listUsers()).rejects.toThrow(/corrupt|reset/i);
  });
});
