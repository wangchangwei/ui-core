import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import TableRowsOutlined from "@mui/icons-material/TableRowsOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import ViewAgendaOutlined from "@mui/icons-material/ViewAgendaOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import type { Permission } from '../domain/permissions';
export const navigation: {
    label: string;
    path: string;
    permission: Permission;
    icon: typeof DashboardOutlined;
    group: string;
}[] = [
    { label: 'Overview', path: '/dashboard', permission: 'dashboard:read', icon: DashboardOutlined, group: 'Workspace' },
    { label: 'Projects', path: '/projects', permission: 'projects:read', icon: FolderOutlined, group: 'Workspace' },
    { label: 'Users', path: '/users', permission: 'users:read', icon: PeopleOutlined, group: 'Workspace' },
    { label: 'Scenario Management', path: '/scenarios', permission: 'scenarios:read', icon: AccountTreeOutlined, group: 'Workspace' },
    { label: 'Design system', path: '/design-system', permission: 'design:read', icon: WidgetsOutlined, group: 'Resources' },
    { label: 'Table list example', path: '/page-standards/table-list', permission: 'design:read', icon: TableRowsOutlined, group: 'Resources' },
    { label: 'Detail example', path: '/page-standards/detail', permission: 'design:read', icon: ArticleOutlined, group: 'Resources' },
    { label: 'Card list example', path: '/page-standards/card-list', permission: 'design:read', icon: ViewAgendaOutlined, group: 'Resources' },
    { label: 'Form example', path: '/page-standards/form', permission: 'design:read', icon: DescriptionOutlined, group: 'Resources' },
    { label: 'Settings', path: '/settings', permission: 'settings:write', icon: SettingsOutlined, group: 'Resources' },
];
