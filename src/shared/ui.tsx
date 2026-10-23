import { useId, useRef, type ReactNode } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Stack, TextField, Typography, type SxProps, type TextFieldProps, type Theme } from '@mui/material';
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PauseCircleOutlined from "@mui/icons-material/PauseCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import SearchOff from "@mui/icons-material/SearchOff";
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
export function PageLayout({ title, description, actions, children }: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return <Box sx={{ width: '100%', minWidth: 0 }}>
    <Stack direction="row" sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6,
            mb: 8
        }}>
      <Box sx={{ minWidth: 0 }}><Typography component="h1" variant="h1">{title}</Typography>{description && <Typography sx={{
                color: "text.secondary",
                mt: 2
            }}>{description}</Typography>}</Box>
      {actions && <Stack direction="row" sx={{
                gap: 2,
                alignItems: "center"
            }}>{actions}</Stack>}
    </Stack>
    <Stack sx={{
            gap: 6
        }}>{children}</Stack>
  </Box>;
}
export function PageSection({ title, description, actions, children, sx, flush = false }: {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    sx?: SxProps<Theme>;
    flush?: boolean;
}) {
    return <Paper variant="outlined" sx={[{ p: flush ? 0 : 6, minWidth: 0, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}>
    {(title || actions) && <Stack direction="row" sx={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
                mb: flush ? 0 : 6,
                p: flush ? 6 : 0,
            }}>
      <Box><Typography variant="h6" component="h2">{title}</Typography>{description && <Typography variant="body2" sx={{
                    color: "text.secondary",
                    mt: 1
                }}>{description}</Typography>}</Box>{actions}
    </Stack>}{children}
  </Paper>;
}
export function FilterBar({ children }: {
    children: ReactNode;
}) {
    return <Stack direction="row" sx={{
            alignItems: "center",
            gap: 3,
            '& > .MuiTextField-root': { width: 180, flexShrink: 0 }, '& > .MuiTextField-root:first-of-type': { width: 280 }, '& > .MuiButton-root:last-child': { ml: 'auto' }, flexWrap: 'wrap'
        }}>{children}</Stack>;
}
const statusConfig: Record<string, {
    label: string;
    color: 'success' | 'warning' | 'error' | 'default' | 'info';
    icon?: typeof CheckCircleOutlined;
}> = {
    active: { label: 'Active', color: 'success', icon: RadioButtonUnchecked }, completed: { label: 'Completed', color: 'success', icon: CheckCircleOutlined },
    planned: { label: 'Planned', color: 'info', icon: RadioButtonUnchecked }, 'on-hold': { label: 'On hold', color: 'warning', icon: PauseCircleOutlined },
    invited: { label: 'Invited', color: 'info' }, suspended: { label: 'Suspended', color: 'error' },
    admin: { label: 'Admin', color: 'default' }, editor: { label: 'Editor', color: 'default' }, viewer: { label: 'Viewer', color: 'default' },
};
export function StatusBadge({ status }: {
    status: string;
}) {
    const value = statusConfig[status.toLowerCase()] ?? { label: status, color: 'default' as const };
    const Icon = value.icon;
    return <Chip component="span" label={value.label} color={value.color} variant="outlined" icon={Icon ? <Icon /> : undefined} sx={{ '& .MuiChip-icon': { fontSize: 14 }, borderColor: 'divider', bgcolor: 'background.paper' }}/>;
}
export function ConfirmDialog({ open, title, description, onConfirm, onClose, pending = false, confirmLabel, destructive = false }: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onClose: () => void;
    pending?: boolean;
    confirmLabel?: string;
    destructive?: boolean;
}) {
    const id = useId();
    const cancelRef = useRef<HTMLButtonElement>(null);
    return <Dialog slotProps={{ transition: { onEntered: () => cancelRef.current?.focus() } }} open={open} onClose={pending ? undefined : onClose} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <DialogTitle id={`${id}-title`}>{title}</DialogTitle><DialogContent><DialogContentText id={`${id}-description`}>{description}</DialogContentText></DialogContent>
    <DialogActions><Button ref={cancelRef} autoFocus onClick={onClose} disabled={pending} variant="outlined">Cancel</Button><Button variant="contained" color={destructive ? 'error' : 'primary'} disabled={pending} onClick={onConfirm}>{pending && <CircularProgress size={14} color="inherit" sx={{ mr: 2 }}/>}{confirmLabel ?? (destructive ? 'Delete' : 'Confirm')}</Button></DialogActions>
  </Dialog>;
}
export function AsyncState({ loading, error, empty, emptyTitle = 'Nothing here yet', emptyDescription = 'New items will appear here.', onRetry, children }: {
    loading?: boolean;
    error?: string | null;
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    onRetry?: () => void;
    children?: ReactNode;
}) {
    if (loading)
        return <Stack role="status" aria-label="Loading" sx={{
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                py: 16
            }}><CircularProgress size={24}/><Typography sx={{
                color: "text.secondary"
            }}>Loading workspace data…</Typography></Stack>;
    if (error)
        return <Alert severity="error" action={onRetry ? <Button color="inherit" onClick={onRetry}>Retry</Button> : undefined}>{error}</Alert>;
    if (empty)
        return <Stack sx={{
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 16, textAlign: 'center'
            }}><SearchOff sx={{ color: 'text.disabled', fontSize: 28, mb: 1 }}/><Typography variant="h6">{emptyTitle}</Typography><Typography sx={{
                color: "text.secondary"
            }}>{emptyDescription}</Typography></Stack>;
    return <>{children}</>;
}
export function FormField<T extends FieldValues>({ name, control, helperText, ...props }: {
    name: Path<T>;
    control: Control<T>;
} & Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'defaultValue' | 'error'>) {
    const id = useId();
    return <Controller name={name} control={control} render={({ field: { ref, ...field }, fieldState }) => <TextField id={id} {...props} {...field} inputRef={ref} error={!!fieldState.error} helperText={fieldState.error?.message ?? helperText}/>}/>;
}
