import { z } from 'zod';

export const exampleCategories = [
  { id: 'marketing', label: 'Marketing', children: [{ id: 'campaigns', label: 'Campaigns' }, { id: 'social', label: 'Social' }] },
  { id: 'product', label: 'Product', children: [{ id: 'research', label: 'Research' }, { id: 'releases', label: 'Releases' }] },
] as const;
export const exampleResourceSchema = z.object({
  name: z.string().trim().min(1, 'Enter a resource name.').max(120),
  description: z.string().max(500).optional(),
  categoryId: z.enum(['campaigns', 'social', 'research', 'releases']),
  tag: z.enum(['Enterprise', 'Internal']),
  status: z.enum(['active', 'planned']),
});
export type ExampleResourceInput = z.infer<typeof exampleResourceSchema>;
export type ExampleResource = ExampleResourceInput & { id: string; updatedAt: string };

export class ExampleResourceNotFoundError extends Error {
  constructor(readonly id: string) {
    super('Resource not found.');
    this.name = 'ExampleResourceNotFoundError';
  }
}

export interface ExampleQuery {
  search: string; parentId: string; categoryId: string; tag: string; status: string;
  sortBy: string; sortDirection: 'asc' | 'desc'; page: number; pageSize: number;
}

// Each mounted example owns its data. Demonstration writes never touch workspace storage.
export function createExampleService() {
  const seed = (): ExampleResource[] => Array.from({ length: 32 }, (_, index) => ({
    id: `example-${index + 1}`,
    name: `${['Campaign launch', 'Social calendar', 'Customer research', 'Release checklist'][index % 4]}${index < 4 ? '' : ` ${Math.floor(index / 4) + 1}`}`,
    description: ['Plan campaign milestones, deliverables, and stakeholder reviews.', 'Coordinate publishing dates and content across social channels.', 'Gather customer feedback and turn findings into product decisions.', 'Track release readiness, quality checks, and delivery approvals.'][index % 4],
    categoryId: (['campaigns', 'social', 'research', 'releases'] as const)[index % 4],
    tag: index % 3 === 0 ? 'Enterprise' : 'Internal',
    status: index % 3 === 0 ? 'planned' : 'active',
    updatedAt: `2026-10-${String(24 - index % 20).padStart(2, '0')}`,
  }));
  let records = seed();
  return {
    async get(id: string) {
      const record = records.find(item => item.id === id);
      if (!record) throw new ExampleResourceNotFoundError(id);
      return { ...record };
    },
    async update(id: string, input: ExampleResourceInput) {
      const value = exampleResourceSchema.parse(input);
      if (!records.some(item => item.id === id)) throw new ExampleResourceNotFoundError(id);
      const saved = { ...value, id, updatedAt: new Date().toISOString().slice(0, 10) };
      records = records.map(item => item.id === id ? saved : item);
      return saved;
    },
    async list(query: ExampleQuery) {
      const parent = exampleCategories.find(item => item.id === query.parentId);
      const filtered = records.filter(item => (!query.search || item.name.toLowerCase().includes(query.search.trim().toLowerCase()))
        && (!parent || parent.children.some(child => child.id === item.categoryId))
        && (!query.categoryId || item.categoryId === query.categoryId)
        && (!query.tag || item.tag === query.tag) && (!query.status || item.status === query.status));
      const key = query.sortBy === 'name' ? 'name' : 'updatedAt';
      filtered.sort((a, b) => a[key].localeCompare(b[key]) * (query.sortDirection === 'asc' ? 1 : -1) || a.id.localeCompare(b.id));
      return { items: filtered.slice(query.page * query.pageSize, (query.page + 1) * query.pageSize), total: filtered.length,
        counts: Object.fromEntries(['all', ...exampleCategories.flatMap(parent => [parent.id, ...parent.children.map(child => child.id)])].map(id => [id,
          id === 'all' ? records.length : records.filter(item => item.categoryId === id || exampleCategories.find(parent => parent.id === id)?.children.some(child => child.id === item.categoryId)).length])) };
    },
    async create(input: ExampleResourceInput) {
      const value = exampleResourceSchema.parse(input);
      const saved = { ...value, id: crypto.randomUUID(), updatedAt: new Date().toISOString().slice(0, 10) };
      records = [saved, ...records];
      return saved;
    },
    async remove(ids: string[]) { records = records.filter(item => !ids.includes(item.id)); },
    async reset() { records = seed(); },
  };
}
