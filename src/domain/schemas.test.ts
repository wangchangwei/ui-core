import { describe, expect, it } from 'vitest';
import { projectSchema, userSchema } from './schemas';

describe('domain schemas', () => {
  it('validates users and rejects malformed emails', () => {
    expect(userSchema.safeParse({ name: 'Jane', email: 'jane@example.com', role: 'viewer', status: 'active' }).success).toBe(true);
    expect(userSchema.safeParse({ name: '', email: 'not-an-email', role: 'viewer', status: 'active' }).success).toBe(false);
    expect(userSchema.safeParse({ name: '   ', email: 'jane@example.com', role: 'viewer', status: 'active' }).success).toBe(false);
  });

  it('requires valid calendar dates and start before end', () => {
    const valid = { name: 'Project', description: 'Desc', ownerId: 'u-1', status: 'planned', startDate: '2026-02-01', endDate: '2026-02-28' };
    expect(projectSchema.safeParse(valid).success).toBe(true);
    expect(projectSchema.safeParse({ ...valid, startDate: '2026-02-30' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, startDate: '2026-03-01' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });
});
