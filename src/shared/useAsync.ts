import { useEffect, useEffectEvent, useState } from 'react';
/** Ignore obsolete responses when filters or routes change. */
export function useAsync<T>(loader: () => Promise<T>, dependencies: readonly unknown[] = []) {
    const dependencyKey = JSON.stringify(dependencies);
    const [state, setState] = useState<{
        key: string;
        data?: T;
        loading: boolean;
        error: string | null;
    }>({ key: dependencyKey, loading: true, error: null });
    const [version, setVersion] = useState(0);
    const load = useEffectEvent(loader);
    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (!active)
                return;
            setState((previous) => ({ key: dependencyKey, data: previous.key === dependencyKey ? previous.data : undefined, loading: true, error: null }));
            void load().then((data) => { if (active)
                setState({ key: dependencyKey, data, loading: false, error: null }); }, (error: unknown) => { if (active)
                setState({ key: dependencyKey, loading: false, error: error instanceof Error ? error.message : 'Something went wrong. Please retry.' }); });
        });
        return () => { active = false; };
    }, [dependencyKey, version]);
    const current = state.key === dependencyKey ? state : { data: undefined, loading: true, error: null };
    return { data: current.data, loading: current.loading, error: current.error, reload: () => setVersion((value) => value + 1) };
}
