import type { Scenario, ScenarioCategoryId } from './types';

type SeedScenario = Omit<Scenario, 'updatedAt'> & { ageHours: number };
const examples: SeedScenario[] = [
    { id: 'scenario-1', name: 'Onboarding Template 0923', description: 'A reusable path from offer acceptance to a confident first week.', categoryIds: ['onboarding', 'template'], subflows: ['Welcome and account setup'], ageHours: 7, visibility: 'visible' },
    { id: 'scenario-2', name: 'Manager Onboarding Information Collection', description: 'Collect the context managers need before a new teammate arrives.', categoryIds: ['onboarding', 'customized'], subflows: ['Manager preparation'], ageHours: 7, visibility: 'visible' },
    { id: 'scenario-3', name: 'Account, Access, Equipment & Workplace Readiness', description: 'Coordinate the access, equipment and workspace checklist.', categoryIds: ['onboarding', 'customized'], subflows: ['Equipment request'], ageHours: 7, visibility: 'visible' },
    { id: 'scenario-4', name: 'Orientation, Day 1 & Role Enablement', description: 'Give each new hire a clear first day and role-specific start.', categoryIds: ['onboarding', 'template'], subflows: ['Orientation', 'Role enablement'], ageHours: 7, visibility: 'visible' },
    { id: 'scenario-5', name: 'Interview 1', description: 'Coordinate recruiter screening and candidate follow-up.', categoryIds: ['recruitment'], subflows: ['Recruiter screen'], ageHours: 24, visibility: 'visible' },
    { id: 'scenario-6', name: 'First review', description: 'Review the AI shortlist and confirm interview progression.', categoryIds: ['recruitment', 'customized'], subflows: ['Shortlist review'], ageHours: 25, visibility: 'visible' },
    { id: 'scenario-7', name: 'Candidate review workflow (HR Short List)', description: 'A short-list review with explicit recruiter and hiring manager handoffs.', categoryIds: ['recruitment', 'template'], subflows: ['Recruiter review', 'Hiring manager decision'], ageHours: 26, visibility: 'hidden' },
    { id: 'scenario-8', name: 'Interview 2', description: 'Capture interview feedback and align the panel on next steps.', categoryIds: ['recruitment'], subflows: ['Panel feedback'], ageHours: 27, visibility: 'visible' },
    { id: 'scenario-9', name: 'Second review', description: 'Compare interview feedback before advancing the candidate.', categoryIds: ['recruitment', 'customized'], subflows: ['Feedback summary'], ageHours: 28, visibility: 'visible' },
    { id: 'scenario-10', name: 'Interview 3', description: 'Prepare the final conversation and collect a decision.', categoryIds: ['recruitment'], subflows: ['Final interview'], ageHours: 29, visibility: 'visible' },
    { id: 'scenario-11', name: 'Third review', description: 'Move from final feedback to a documented hiring decision.', categoryIds: ['recruitment', 'customized'], subflows: ['Decision meeting', 'Offer handoff'], ageHours: 32, visibility: 'visible' },
    { id: 'scenario-12', name: 'Team leader scenario orchestration', description: 'Coordinate team-lead review across dependent scenario steps.', categoryIds: ['onboarding', 'offboarding'], subflows: ['Team review'], ageHours: 50, visibility: 'visible' },
    { id: 'scenario-13', name: 'Offer approval and handoff', description: 'Route compensation approval and prepare a consistent offer.', categoryIds: ['recruitment'], subflows: ['Compensation approval'], ageHours: 54, visibility: 'visible' },
    { id: 'scenario-14', name: 'New hire welcome sequence', description: 'Schedule welcome messages and first-week conversations.', categoryIds: ['onboarding', 'template'], subflows: ['Welcome note', 'First-week check-in'], ageHours: 60, visibility: 'visible' },
    { id: 'scenario-15', name: 'Departure checklist', description: 'Coordinate equipment return, access changes and handover.', categoryIds: ['offboarding', 'customized'], subflows: ['Asset return', 'Knowledge handover'], ageHours: 72, visibility: 'visible' },
    { id: 'scenario-16', name: 'Hiring manager intake', description: 'Capture role requirements and agree on interview signals.', categoryIds: ['recruitment'], subflows: ['Role intake'], ageHours: 90, visibility: 'visible' },
    { id: 'scenario-17', name: 'Probation check-in', description: 'Gather manager and teammate feedback at key milestones.', categoryIds: ['onboarding', 'customized'], subflows: ['30 day review', '90 day review'], ageHours: 110, visibility: 'visible' },
    { id: 'scenario-18', name: 'Internal mobility interview', description: 'Apply a consistent interview process to an internal move.', categoryIds: ['recruitment', 'beta'], subflows: ['Interview panel'], ageHours: 135, visibility: 'visible' },
];

export function seedScenarios(): Scenario[] {
    return examples.map(({ ageHours, ...scenario }) => ({
        ...scenario,
        categoryIds: [...scenario.categoryIds] as ScenarioCategoryId[],
        subflows: [...scenario.subflows],
        updatedAt: new Date(Date.now() - ageHours * 60 * 60 * 1000).toISOString(),
    }));
}
