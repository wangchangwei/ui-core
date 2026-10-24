import { useState } from 'react';
import { Link as RouterLink, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Avatar, Box, Breadcrumbs, Button, Chip, Divider, IconButton, Link, ListItemIcon, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowBack from "@mui/icons-material/ArrowBack";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HelpOutlined from "@mui/icons-material/HelpOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import OpenInNew from "@mui/icons-material/OpenInNew";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import { useApp } from './AppContext';
import { navigation } from './navigation';
import { can } from '../domain/permissions';
import { api } from '../domain/api';
import { tokens } from '../theme';
import { ConfirmDialog, EntityAvatar } from '../shared/ui';
export function Brand({ compact = false }: {
    compact?: boolean;
}) {
    const { settings } = useApp();
    return <Stack direction="row" sx={{
            alignItems: "center",
            gap: 3
        }}><Box sx={{ width: 30, height: 30, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', borderRadius: `${tokens.radius.control}px` }}><LayersOutlined sx={{ fontSize: 20 }}/></Box><Typography variant={compact ? 'h6' : 'h5'} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 145 }}>{settings.appName}</Typography></Stack>;
}
export function AppShell() {
    const { session, profile, storageError, refresh, logout, notify } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const current = navigation.find((item) => location.pathname.startsWith(item.path));
    const segments = location.pathname.split('/').filter(Boolean);
    const detail = segments.length > 1 ? segments.at(-1) === 'edit' ? 'Edit' : segments.at(-1) === 'new' ? 'Create' : 'Details' : '';
    return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Box component="aside" aria-label="Workspace sidebar" sx={{ width: tokens.size.sidebar, position: 'fixed', inset: '0 auto 0 0', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', zIndex: 1100 }}>
      <Box component={RouterLink} to="/dashboard" sx={{ height: tokens.size.topbar, display: 'flex', alignItems: 'center', px: 6, color: 'text.primary', textDecoration: 'none', borderBottom: 1, borderColor: 'divider' }}><Brand /></Box>
      <Box sx={{ px: 3, pt: 6, pb: 4 }}><Stack direction="row" sx={{
            gap: 2,
            alignItems: "center",
            px: 3, py: 2
        }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.primary', fontSize: 12, borderRadius: `${tokens.radius.control}px` }}>W</Avatar><Box sx={{ flex: 1 }}><Typography variant="subtitle2">My workspace</Typography><Typography variant="caption" sx={{
            color: "text.secondary"
        }}>Personal workspace</Typography></Box></Stack></Box>
      <Box component="nav" aria-label="Main navigation" sx={{ px: 3 }}>
        {['Workspace', 'Resources'].map((group) => <Box key={group} sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{
                color: "text.secondary",
                px: 3, display: 'block', mb: 2
            }}>{group}</Typography>
          <Stack sx={{
                gap: 1
            }}>{navigation.filter((item) => item.group === group && can(session?.role, item.permission)).map(({ label, path, icon: Icon }) => <Box key={path} component={NavLink} to={path} sx={{ minHeight: 40, display: 'flex', alignItems: 'center', gap: 3, px: 3, textDecoration: 'none', color: 'text.secondary', borderRadius: `${tokens.radius.full}px`, '&.active': { bgcolor: 'action.hover', color: 'text.primary', fontWeight: 500 }, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}><Icon sx={{ fontSize: 20 }}/><Typography variant="body1" sx={{ fontWeight: 'inherit' }}>{label}</Typography></Box>)}</Stack>
        </Box>)}
      </Box>
      <Box sx={{ mt: 'auto', px: 6, py: 6 }}><Typography variant="body2" sx={{
            color: "text.secondary"
        }}>A consistent place to build.</Typography><Link component={RouterLink} to="/design-system" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, fontSize: 12 }}>Explore the framework <ChevronRight fontSize="small"/></Link></Box>
      <Divider /><Stack direction="row" sx={{
            alignItems: "center",
            gap: 2,
            p: 4
        }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }}/><Typography variant="caption" sx={{
            color: "text.secondary"
        }}>Local demo</Typography><Typography variant="caption" sx={{
            color: "text.secondary",
            ml: 'auto', fontFamily: tokens.font.mono
        }}>v1.0</Typography></Stack>
    </Box>
    <Box sx={{ ml: `${tokens.size.sidebar}px`, flex: 1, minWidth: 0 }}>
      <Box component="header" sx={{ height: tokens.size.topbar, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 8, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Breadcrumbs separator={<ChevronRight sx={{ fontSize: 14 }}/>} aria-label="Breadcrumb"><Typography variant="body2" sx={{
            color: "text.secondary"
        }}>Workspace</Typography>{detail && current ? <Link component={RouterLink} to={current.path} color="inherit" variant="body2">{current.label}</Link> : null}<Typography variant="body2" sx={{
            color: "text.primary"
        }}>{detail || current?.label || (location.pathname === '/profile' ? 'My profile' : 'Page')}</Typography></Breadcrumbs>
        <Stack direction="row" sx={{
            gap: 3,
            alignItems: "center"
        }}><Chip label={session?.role === 'admin' ? 'Administrator' : 'Read only'} variant="outlined"/><IconButton size="small" component={RouterLink} to="/design-system" aria-label="Framework guide"><HelpOutlined fontSize="small"/></IconButton><Button aria-label="Account menu" aria-haspopup="menu" aria-expanded={!!anchor} onClick={(event) => setAnchor(event.currentTarget)} endIcon={<ExpandMore fontSize="small"/>} sx={{ px: 2, minWidth: 0 }}><EntityAvatar name={profile?.displayName ?? "Account"}/><Typography variant="body2" sx={{ ml: 2 }}>{profile?.displayName ?? 'Account'}</Typography></Button></Stack>
      </Box>
      <Box component="main" id="main-content" sx={{ p: 8, minWidth: 0, width: '100%' }} tabIndex={-1}>
        {storageError && <Alert severity="error" sx={{ mb: 6 }} action={session?.role === 'admin' ? <Button color="inherit" onClick={() => { void api.reset().then(refresh).then(() => notify('Demo data restored')).catch((error: Error) => notify(error.message, 'error')); }}>Reset demo data</Button> : undefined}>{storageError}{session?.role !== 'admin' && ' Sign in as Admin to reset local demo data.'}</Alert>}
        <Outlet />
      </Box>
    </Box>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Box sx={{ px: 4, py: 2 }}><Typography variant="subtitle2">{profile?.displayName}</Typography><Typography variant="caption" sx={{
            color: "text.secondary"
        }}>{session?.email}</Typography></Box><Divider />
      <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchor(null)}><ListItemIcon><PersonOutlined fontSize="small"/></ListItemIcon>My profile</MenuItem>
      <MenuItem component={RouterLink} to="/design-system" onClick={() => setAnchor(null)}><ListItemIcon><OpenInNew fontSize="small"/></ListItemIcon>Design system</MenuItem><Divider />
      <MenuItem onClick={() => { setAnchor(null); setConfirmLogout(true); }}><ListItemIcon><LogoutOutlined fontSize="small"/></ListItemIcon>Sign out</MenuItem>
    </Menu>
    <ConfirmDialog open={confirmLogout} title="Sign out?" description="Your saved demo data stays in this browser. Unsaved changes will be discarded." confirmLabel="Sign out" onClose={() => setConfirmLogout(false)} onConfirm={() => { setConfirmLogout(false); logout(); navigate('/login'); }}/>
  </Box>;
}
export function ErrorPage({ forbidden = false }: {
    forbidden?: boolean;
}) {
    const navigate = useNavigate();
    return <Stack sx={{
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            minHeight: '65vh', textAlign: 'center'
        }}>
    <Typography variant="body2" sx={{
            color: "text.secondary",
            fontFamily: tokens.font.mono
        }}>{forbidden ? '403' : '404'}</Typography>
    <Typography variant="h1" component="h1">{forbidden ? 'Access restricted' : 'Page not found'}</Typography>
    <Typography sx={{
            color: "text.secondary"
        }}>{forbidden ? 'Your account does not have permission to view this page.' : 'This page may have moved, or the address may be incorrect.'}</Typography>
    <Stack direction="row" sx={{
            gap: 3
        }}><Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined">Go back</Button><Button component={RouterLink} to="/dashboard" variant="contained">Back to overview</Button></Stack>
  </Stack>;
}
