import type { Role } from './types';
export type Permission = 'dashboard:read' | 'users:read' | 'users:write' | 'projects:read' | 'projects:write' | 'settings:write' | 'profile:write' | 'design:read';
const viewerPermissions = new Set<Permission>(['dashboard:read', 'projects:read', 'profile:write', 'design:read']);
export function can(role: Role | undefined, permission: Permission): boolean {
    return role === 'admin' || (role === 'viewer' && viewerPermissions.has(permission));
}
