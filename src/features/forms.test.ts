import { describe, expect, it } from 'vitest';
import { projectSchema, userSchema } from '../domain/schemas';

describe('business form schemas', () => {
  it('requires a valid user name and email', () => {
    expect(userSchema.safeParse({ name: '', email: 'bad', role: 'viewer', status: 'active' }).success).toBe(false);
    expect(userSchema.parse({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'viewer', status: 'active' })).toMatchObject({ name: 'Ada Lovelace' });
  });

  it('requires project dates in chronological order', () => {
    const input = { name: 'Launch', description: '', ownerId: 'user-1', status: 'planned' as const, startDate: '2026-04-02', endDate: '2026-04-01' };
    expect(projectSchema.safeParse(input).success).toBe(false);
    expect(projectSchema.safeParse({ ...input, endDate: '2026-04-03' }).success).toBe(true);
  });
});
