import { describe, expect, it } from 'vitest';
import { createExampleService, ExampleResourceNotFoundError, type ExampleQuery } from './page-standard-example';
const query: ExampleQuery = { search: '', parentId: '', categoryId: '', tag: '', status: '', sortBy: 'name', sortDirection: 'asc', page: 0, pageSize: 25 };
describe('isolated table standard service', () => {
  it('returns a typed not-found error for missing resources', async () => {
    await expect(createExampleService().get('missing-resource')).rejects.toBeInstanceOf(ExampleResourceNotFoundError);
    await expect(createExampleService().get('missing-resource')).rejects.toMatchObject({ message: 'Resource not found.' });
  });

  it('combines hierarchical categories and tags before pagination while keeping full catalog counts', async () => {
    const service = createExampleService();
    const result = await service.list({ ...query, parentId: 'marketing', categoryId: 'campaigns', tag: 'Enterprise', pageSize: 2 });
    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(result.items.every(item => item.categoryId === 'campaigns' && item.tag === 'Enterprise')).toBe(true);
    expect(result.counts.all).toBe(32);
    expect(result.counts.marketing).toBe(16);
    expect(result.counts.campaigns).toBe(8);
  });
  it('keeps demonstration mutations isolated and validates before writes', async () => {
    const first = createExampleService(); const second = createExampleService();
    await expect(first.create({ name: ' ', categoryId: 'campaigns', tag: 'Internal', status: 'active' })).rejects.toThrow();
    const saved = await first.create({ name: 'New sample', categoryId: 'research', tag: 'Enterprise', status: 'active' });
    expect((await first.list(query)).total).toBe(33);
    expect((await second.list(query)).total).toBe(32);
    await first.remove([saved.id]);
    expect((await first.list(query)).total).toBe(32);
    await first.remove(['example-1']);
    await first.reset();
    expect((await first.list(query)).total).toBe(32);
  });
});
