import { describe, expect, it } from 'vitest';
import { can } from './permissions';

describe('permissions', () => {
  it('grants admin everything and viewer read-only access', () => {
    expect(can('admin', 'settings:write')).toBe(true);
    expect(can('viewer', 'projects:read')).toBe(true);
    expect(can('viewer', 'scenarios:read')).toBe(true);
    expect(can('viewer', 'scenarios:write')).toBe(false);
    expect(can('viewer', 'users:read')).toBe(false);
    expect(can(undefined, 'dashboard:read')).toBe(false);
  });
});
