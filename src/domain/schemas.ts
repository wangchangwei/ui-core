import { z } from 'zod';
import { SCENARIO_CATEGORY_IDS } from './types';
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format').refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Date must be a valid calendar date');
export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').refine((value) => value.trim().length > 0, 'Name is required'),
    email: z.string().email('Email must be valid'),
    role: z.enum(['admin', 'editor', 'viewer']),
    status: z.enum(['active', 'invited', 'suspended']),
});
export const projectSchema = z.object({
    name: z.string().min(1, 'Name is required').refine((value) => value.trim().length > 0, 'Name is required'),
    description: z.string(),
    ownerId: z.string().min(1, 'Owner is required'),
    status: z.enum(['active', 'planned', 'on-hold', 'completed']),
    startDate: dateSchema,
    endDate: dateSchema,
}).refine((value) => value.startDate <= value.endDate, {
    path: ['endDate'],
    message: 'End date must be on or after start date',
});
export const settingsSchema = z.object({ appName: z.string().min(1, 'App name is required').refine((value) => value.trim().length > 0, 'App name is required'), pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]) });
export const scenarioSchema = z.object({
    name: z.string().trim().min(1, 'Scenario name is required').max(120, 'Scenario name must be 120 characters or less'),
    description: z.string().max(500, 'Description must be 500 characters or less'),
    categoryIds: z.array(z.enum(SCENARIO_CATEGORY_IDS)).min(1, 'Choose at least one category').refine((categories) => new Set(categories).size === categories.length, 'Categories must be unique'),
    subflows: z.array(z.string().trim().min(1).max(80)).max(20, 'A scenario can contain at most 20 subflows'),
    visibility: z.enum(['visible', 'hidden']),
});
