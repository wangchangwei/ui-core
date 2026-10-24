import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useApp, AppProvider } from './AppContext';
import { AppShell, ErrorPage } from './AppShell';
import { can, type Permission } from '../domain/permissions';
import { tokens } from '../theme';
function Root() {
    return <AppProvider><Box component="a" href="#main-content" sx={{ position: 'fixed', top: -100, left: 12, zIndex: 9999, bgcolor: 'primary.main', color: 'primary.contrastText', p: 3, '&:focus': { top: 12 } }}>Skip to content</Box>
    <Box sx={{ display: { xs: 'none', lg: 'block' }, [`@media (min-width: ${tokens.size.minViewport}px)`]: { display: 'block' }, [`@media (max-width: ${tokens.size.minViewport - 1}px)`]: { display: 'none' } }}><Outlet /></Box>
    <Stack sx={{
            gap: 3,
            alignItems: "center",
            justifyContent: "center",
            minHeight: '100vh', p: 6, textAlign: 'center', [`@media (min-width: ${tokens.size.minViewport}px)`]: { display: 'none' }
        }}><Typography variant="h2" component="h1">A little more room to work.</Typography><Typography sx={{
            color: "text.secondary"
        }}>Open this workspace on a desktop window at least 1280px wide.</Typography></Stack>
  </AppProvider>;
}
function Protected({ permission, children }: {
    permission?: Permission;
    children?: React.ReactNode;
}) {
    const { session } = useApp();
    const location = useLocation();
    if (!session)
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>;
    if (permission && !can(session.role, permission))
        return <ErrorPage forbidden/>;
    return children ?? <Outlet />;
}
function RouteError() {
    return <Box sx={{ p: 8 }}><Alert severity="error">This view could not be opened. Your saved demo data is still available.</Alert><Button href="/dashboard" sx={{ mt: 4 }}>Reload workspace</Button></Box>;
}
function page(path: string, load: () => Promise<ComponentType>, permission?: Permission) {
    return { path, lazy: async () => {
            const View = await load();
            return { Component: () => permission ? <Protected permission={permission}><View /></Protected> : <View /> };
        } };
}
export const router = createBrowserRouter([{ element: <Root />, errorElement: <RouteError />, children: [
            page('/login', () => import('../features/LoginPage').then(m => m.LoginPage)),
            { element: <Protected><AppShell /></Protected>, children: [
                    { index: true, element: <Navigate to="/dashboard" replace/> },
                    page('/dashboard', () => import('../features/DashboardPage').then(m => m.DashboardPage), 'dashboard:read'),
                    page('/users', () => import('../features/UsersPage').then(m => m.UsersPage), 'users:read'),
                    page('/users/new', () => import('../features/UserFormPage').then(m => m.UserFormPage), 'users:write'),
                    page('/users/:id/edit', () => import('../features/UserFormPage').then(m => m.UserFormPage), 'users:write'),
                    page('/users/:id', () => import('../features/UserDetailPage').then(m => m.UserDetailPage), 'users:read'),
                    page('/projects', () => import('../features/ProjectsPage').then(m => m.ProjectsPage), 'projects:read'),
                    page('/projects/new', () => import('../features/ProjectFormPage').then(m => m.ProjectFormPage), 'projects:write'),
                    page('/projects/:id/edit', () => import('../features/ProjectFormPage').then(m => m.ProjectFormPage), 'projects:write'),
                    page('/projects/:id', () => import('../features/ProjectDetailPage').then(m => m.ProjectDetailPage), 'projects:read'),
                    page('/scenarios', () => import('../features/ScenarioManagementPage').then(m => m.ScenarioManagementPage), 'scenarios:read'),
                    page('/settings', () => import('../features/SettingsPage').then(m => m.SettingsPage), 'settings:write'),
                    page('/profile', () => import('../features/ProfilePage').then(m => m.ProfilePage), 'profile:write'),
                    page('/design-system', () => import('../features/DesignSystemPage').then(m => m.DesignSystemPage), 'design:read'),
                    page('/page-standards', () => import('../features/PageStandardsPage').then(m => m.PageStandardsPage), 'design:read'),
                    page('/page-standards/table-list', () => import('../features/TableListStandardPage').then(m => m.TableListStandardPage), 'design:read'),
                    page('/page-standards/detail', () => import('../features/DetailStandardPage').then(m => m.DetailStandardPage), 'design:read'),
                    page('/page-standards/card-list', () => import('../features/CardListStandardPage').then(m => m.CardListStandardPage), 'design:read'),
                    page('/page-standards/form', () => import('../features/FormStandardPage').then(m => m.FormStandardPage), 'design:read'),
                    { path: '/403', element: <ErrorPage forbidden/> }, { path: '*', element: <ErrorPage /> },
                ] },
        ] }]);
