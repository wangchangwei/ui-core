import { useId, useRef, type ReactNode } from 'react';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Stack, TextField, Typography, type SxProps, type TextFieldProps, type Theme } from '@mui/material';
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PauseCircleOutlined from "@mui/icons-material/PauseCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import SearchOff from "@mui/icons-material/SearchOff";
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { vercelTokens } from '../theme';
export function PageLayout({ title, description, actions, children }: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return <Box sx={{ width: '100%', minWidth: 0 }}>
    <Stack component="header" direction="row" sx={{
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 6,
            mb: 8,
            pb: 8,
            borderBottom: 1, borderColor: 'divider'
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
            alignItems: "flex-end",
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
    return <Chip component="span" label={value.label} color={value.color} variant="outlined" icon={Icon ? <Icon /> : undefined} sx={{ '& .MuiChip-icon': { fontSize: 14 }, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}/>;
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

/** Shared composition for explicit forms: a description column and a field column. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    const id = useId();
    return <Box component="section" aria-labelledby={id} sx={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 1.8fr)', gap: 16, p: 6, borderBottom: 1, borderColor: 'divider' }}>
        <Box><Typography id={id} variant="h2" component="h2">{title}</Typography>{description && <Typography sx={{ color: 'text.secondary', mt: 2, maxWidth: '32ch' }}>{description}</Typography>}</Box>
        <Stack sx={{ gap: 6, minWidth: 0, maxWidth: 600 }}>{children}</Stack>
    </Box>;
}
export function FormActions({ children, hint }: { children: ReactNode; hint?: string }) {
    return <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 6, px: 6, py: 4, bgcolor: 'background.default' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{hint}</Typography><Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>{children}</Stack>
    </Stack>;
}
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return <Box component="div" sx={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', alignItems: 'center', gap: 6, m: 0, py: 4, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
        <Typography component="dt" sx={{ color: 'text.secondary' }}>{label}</Typography><Box component="dd" sx={{ m: 0, minWidth: 0, overflowWrap: 'anywhere' }}>{children}</Box>
    </Box>;
}
export function EntityAvatar({ name, size = 'small' }: { name: string; size?: 'small' | 'medium' }) {
    return <Avatar aria-hidden="true" sx={{ width: size === 'small' ? 28 : 40, height: size === 'small' ? 28 : 40, flexShrink: 0, bgcolor: 'action.hover', color: 'text.secondary', border: 1, borderColor: 'divider', ...vercelTokens.typography['body-sm'] }}>{name.split(' ').slice(0, 2).map(word => word[0]).join('')}</Avatar>;
}
/** Geometric workspace motif: source-gradient accents are confined to the auth hero. */
export function WorkspaceIllustration() {
    const c = vercelTokens.colors;
    return <Box aria-hidden="true" sx={{ width: '100%', maxWidth: 440, color: 'text.primary', mt: 10 }}>
        <svg viewBox="0 0 440 200" fill="none" width="100%" style={{ display: 'block', height: 'auto', aspectRatio: '440 / 200' }}>
            <defs><linearGradient id="workspace-spectrum" x1="50" y1="120" x2="390" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor={c['gradient-develop-start']}/><stop offset=".5" stopColor={c.violet}/><stop offset="1" stopColor={c.magenta}/></linearGradient></defs>
            <path d="M32 100H108L220 36L332 100H408M108 100L220 164L332 100M108 100V124L220 188L332 124V100M220 36V12M220 164V188" stroke={c.hairline}/>
            <path d="M108 100L220 36L332 100L220 164Z" fill={c['canvas-elevated']} stroke={c.hairline}/>
            <path d="M152 100L220 60L288 100L220 140Z" fill={c.canvas} stroke={c.hairline}/>
            <path d="M184 100L220 79L256 100L220 121Z" fill={c.ink}/>
            <path d="M204 101L220 92L236 101L220 110Z" stroke={c['on-primary']}/>
            <path d="M204 106L220 115L236 106" stroke={c['on-primary']}/>
            <path d="M32 100H108L220 164L332 100H408" stroke="url(#workspace-spectrum)" strokeWidth="1.5"/>
            {[32,408].map(x=><circle key={x} cx={x} cy="100" r="3" fill={c['canvas-elevated']} stroke={c.body}/>)}
        </svg>
        <Stack direction="row" sx={{ justifyContent: 'space-between', px: 4, mt: 3 }}>
            {['People', 'Projects', 'Progress'].map(label => <Typography key={label} variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>)}
        </Stack>
    </Box>;
}
