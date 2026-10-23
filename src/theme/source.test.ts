import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { theme, tokens, vercelTokens } from './index';

// Compare with the supplied document, rather than a second hand-written expected palette.
const reference = readFileSync('docs/reference/DESIGN-vercel.md', 'utf8');
const frontmatter = reference.split('---')[1];
function section(name: string) {
    return frontmatter.match(new RegExp(`^${name}:\\n([\\s\\S]*?)(?=^\\S|(?![\\s\\S]))`, 'm'))![1];
}
function numericScale(name: string) {
    return Object.fromEntries([...section(name).matchAll(/^ {2}([\w-]+): (\d+)px$/gm)].map(([, key, value]) => [key, Number(value)]));
}
const sourceType = Object.fromEntries([...section('typography').matchAll(/^ {2}([\w-]+):\n([\s\S]*?)(?=^ {2}[\w-]+:|(?![\s\S]))/gm)].map(([, name, body]) => {
    const get = (key: string) => body.match(new RegExp(`^    ${key}: ([^\\n]+)`, 'm'))![1];
    return [name, { fontSize: parseFloat(get('fontSize')), fontWeight: parseFloat(get('fontWeight')),
        lineHeight: get('lineHeight'), letterSpacing: get('letterSpacing') === '0' ? 0 : get('letterSpacing') }];
}));

describe('supplied Vercel visual contract', () => {
    it('preserves every original color, radius, spacing step and typography metric', () => {
        const colors = Object.fromEntries([...section('colors').matchAll(/^ {2}([\w-]+): "(#[\da-f]+)"$/gm)].map(([, name, value]) => [name, value]));
        expect(Object.keys(colors)).toHaveLength(30);
        expect(vercelTokens.colors).toEqual(colors);
        expect(vercelTokens.rounded).toEqual(numericScale('rounded'));
        expect(vercelTokens.spacing).toEqual(numericScale('spacing'));
        expect(Object.keys(sourceType)).toHaveLength(11);
        for (const [name, metrics] of Object.entries(sourceType)) {
            expect(vercelTokens.typography[name as keyof typeof vercelTokens.typography]).toMatchObject(metrics);
        }
    });
    it('maps the real MUI theme to source typography and blue positive semantics', () => {
        expect(theme.typography.h1).toMatchObject(sourceType['heading-lg']);
        expect(theme.typography.h6).toMatchObject(sourceType['heading-md']);
        expect(theme.typography.body1).toMatchObject(sourceType['body-md']);
        expect(theme.typography.body2).toMatchObject(sourceType['body-md']);
        expect(theme.typography.button).toMatchObject(sourceType['button-md']);
        expect(theme.typography.display).toMatchObject(sourceType['display-xl']);
        expect(theme.typography.code).toMatchObject(sourceType.code);
        expect(theme.typography.overline).toMatchObject(sourceType['mono-eyebrow']);
        expect(theme.palette.success.main).toBe(vercelTokens.colors.link);
        expect(theme.palette.divider).toBe(vercelTokens.colors.hairline);
        expect(tokens.radius.panel).toBe(vercelTokens.rounded.md);
        expect(tokens.radius.large).toBe(vercelTokens.rounded.lg);
    });
});
