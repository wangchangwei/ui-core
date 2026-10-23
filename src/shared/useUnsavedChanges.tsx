import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
export function useUnsavedChanges(dirty: boolean) {
    const bypass = useRef(false);
    const keepEditingRef = useRef<HTMLButtonElement>(null);
    const blocker = useBlocker(() => dirty && !bypass.current);
    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (dirty && !bypass.current) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);
    return {
        allowNavigation: () => { bypass.current = true; },
        dialog: <Dialog slotProps={{ transition: { onEntered: () => keepEditingRef.current?.focus() } }} open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} aria-labelledby="unsaved-title">
      <DialogTitle id="unsaved-title">Unsaved changes</DialogTitle><DialogContent><DialogContentText>Your changes have not been saved. Discard them and leave this page?</DialogContentText></DialogContent>
      <DialogActions><Button ref={keepEditingRef} autoFocus variant="outlined" onClick={() => blocker.reset?.()}>Keep editing</Button><Button color="error" variant="contained" onClick={() => blocker.proceed?.()}>Discard changes</Button></DialogActions>
    </Dialog>,
    };
}
