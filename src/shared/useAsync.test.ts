import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAsync } from './useAsync';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
describe('asynchronous page state', () => {
  it('immediately hides an old record when its route key changes', async () => {
    const alpha = deferred<string>(); const beta = deferred<string>();
    const { result, rerender } = renderHook(({ id }) => useAsync(() => id === 'a' ? alpha.promise : beta.promise, [id]), { initialProps: { id: 'a' } });
    await act(async () => { alpha.resolve('Alpha'); });
    await waitFor(() => expect(result.current.data).toBe('Alpha'));
    rerender({ id: 'b' });
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(true);
    await act(async () => { beta.resolve('Beta'); });
    await waitFor(() => expect(result.current.data).toBe('Beta'));
  });
  it('ignores obsolete responses after navigation', async () => {
    const alpha = deferred<string>(); const beta = deferred<string>();
    const { result, rerender } = renderHook(({ id }) => useAsync(() => id === 'a' ? alpha.promise : beta.promise, [id]), { initialProps: { id: 'a' } });
    await act(async () => {});
    rerender({ id: 'b' });
    await act(async () => { beta.resolve('Beta'); });
    await waitFor(() => expect(result.current.data).toBe('Beta'));
    await act(async () => { alpha.resolve('Alpha'); });
    expect(result.current.data).toBe('Beta');
  });
});
