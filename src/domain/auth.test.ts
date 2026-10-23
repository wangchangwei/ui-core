import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_ACCOUNTS, auth } from './auth';

describe('auth', () => {
  beforeEach(() => sessionStorage.clear());

  it('logs in fixed demo accounts and stores only the identity', async () => {
    const session = await auth.login('admin@example.com', 'Demo123!');
    expect(session.role).toBe('admin');
    expect(auth.getSession()).toEqual(session);
    expect(sessionStorage.getItem('forma:session')).toContain('admin@example.com');
    expect(DEMO_ACCOUNTS).toHaveLength(2);
  });

  it('rejects invalid credentials and malformed persisted session', async () => {
    await expect(auth.login('admin@example.com', 'bad')).rejects.toThrow();
    sessionStorage.setItem('forma:session', '{"email":"other@example.com"}');
    expect(auth.getSession()).toBeNull();
  });
  it('renders unauthenticated instead of throwing when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    expect(() => auth.getSession()).not.toThrow();
    expect(auth.getSession()).toBeNull();
  });
  it('explains how to recover when a session cannot be persisted', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    await expect(auth.login('admin@example.com', 'Demo123!')).rejects.toThrow(/storage.*unavailable/i);
  });
});
