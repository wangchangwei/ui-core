export type Role = 'admin' | 'viewer';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'invited' | 'suspended';
export type ProjectStatus = 'active' | 'planned' | 'on-hold' | 'completed';
export const SCENARIO_CATEGORY_IDS = ['recruitment', 'onboarding', 'offboarding', 'template', 'customized', 'beta', '0827'] as const;
export type ScenarioCategoryId = typeof SCENARIO_CATEGORY_IDS[number];
export const SCENARIO_CATEGORIES: { id: ScenarioCategoryId; label: string }[] = [
    { id: 'recruitment', label: 'Recruitment' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'offboarding', label: 'Offboarding' },
    { id: 'template', label: 'Template' },
    { id: 'customized', label: 'Customized' },
    { id: 'beta', label: 'Beta' },
    { id: '0827', label: '0827' },
];
export type ScenarioVisibility = 'visible' | 'hidden';
export interface Session {
    accountId: string;
    email: string;
    role: Role;
}
export interface Profile {
    displayName: string;
    email: string;
    role: Role;
}
export interface Settings {
    appName: string;
    pageSize: 25 | 50 | 100;
}
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}
export interface Project {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
    createdAt: string;
}
export interface Scenario {
    id: string;
    name: string;
    description: string;
    categoryIds: ScenarioCategoryId[];
    subflows: string[];
    updatedAt: string;
    visibility: ScenarioVisibility;
}
export type UserInput = Pick<User, 'name' | 'email' | 'role' | 'status'>;
export type ProjectInput = Pick<Project, 'name' | 'description' | 'ownerId' | 'status' | 'startDate' | 'endDate'>;
export type ScenarioInput = Pick<Scenario, 'name' | 'description' | 'categoryIds' | 'subflows' | 'visibility'>;
export interface ListQuery {
    search?: string;
    status?: string;
    role?: string;
    ownerId?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
export interface ScenarioListQuery {
    search?: string;
    categoryId?: ScenarioCategoryId;
    sortBy?: 'name' | 'updatedAt';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
export interface PageResult<T> {
    items: T[];
    total: number;
}
export interface DashboardData {
    users: number;
    activeUsers: number;
    projects: number;
    activeProjects: number;
    completedProjects: number;
    trend: {
        month: string;
        projects: number;
        users: number;
    }[];
    distribution: {
        status: ProjectStatus;
        count: number;
    }[];
    recentProjects: Project[];
}
