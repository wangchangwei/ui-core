import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import plugin, { matchesStyleException } from './eslint-rules.js';

function lint(code: string) {
  const linter = new Linter({ configType: 'flat' });
  return linter.verify(code, [{
    files: ['**/*.tsx'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } } },
    plugins: { local: plugin },
    rules: { 'local/design-tokens': 'error', 'local/feature-imports': 'error' },
  }], { filename: 'src/features/Example.tsx' });
}

describe('feature lint rules', () => {
  it('allows tokens, theme references, numeric spacing and type imports', () => {
    expect(lint(`
      import type { DataGridProps } from '@mui/x-data-grid';
      import { Box } from '@mui/material';
      export function Example() { return <Box sx={{ color: 'text.primary', borderColor: 'divider', p: 6, borderRadius: theme.shape.radius.control, fontSize: theme.typography.body1.fontSize, lineHeight: vercelTokens.typography['body-md'].lineHeight }} />; }
    `)).toEqual([]);
  });

  it('allows explicit pixel units from tokens without allowing literal or arbitrary interpolations', () => {
    expect(lint('<Box sx={{ borderRadius: `${tokens.radius.panel}px` }} />')).toEqual([]);
    expect(lint('<Box sx={{ borderRadius: `${12}px` }} />')).toHaveLength(1);
    expect(lint('<Box sx={{ borderRadius: `${untrusted.radius}px` }} />')).toHaveLength(1);
  });

  it('allows computed theme colors while still checking nested literal colors', () => {
    expect(lint(`<Box sx={{ color: theme.palette.primary.main, '&:hover': { color: '#fff' } }} />`).map((message) => message.message)).toEqual([
      'Use a theme color token instead of a raw color literal.',
    ]);
  });

  it('reports raw colors in conditional, responsive and callback style expressions', () => {
    const messages = lint(`
      const styles = { color: '#111' };
      const tone = true ? '#222' : 'text.primary';
      <Box sx={styles} style={{ color: tone }} />;
      <Box sx={[{ color: '#333' }, false && { color: '#444' }]} />;
      <Box sx={(theme) => ({ color: '#555', borderColor: theme.palette.divider })} />;
    `);
    expect(messages.filter((message) => message.message.includes('raw color'))).toHaveLength(5);
  });

  it('reports object styles passed to styled factories', () => {
    const messages = lint(`import { styled } from '@mui/material'; const Box = styled('div')({ color: '#111' });`);
    expect(messages.some((message) => message.message.includes('raw color'))).toBe(true);
  });

  it('reports nested raw design values and global selectors', () => {
    const messages = lint(`<Box sx={{ color: '#171717', '& .child': { gap: '12px', borderRadius: 10, '& .MuiButton-root': { color: 'red' } } }} />`);
    expect(messages.map((message) => message.ruleId)).toEqual([
      'local/design-tokens', 'local/design-tokens', 'local/design-tokens', 'local/design-tokens', 'local/design-tokens',
    ]);
  });

  it('reports direct grid, global style and css imports', () => {
    const messages = lint(`import { DataGrid, CssBaseline } from '@mui/material'; import { DataGrid as Grid } from '@mui/x-data-grid'; import './page.css';`);
    expect(messages.map((message) => message.message)).toEqual(expect.arrayContaining([
      expect.stringContaining('DataGrid'), expect.stringContaining('CssBaseline'), expect.stringContaining('CSS files'),
    ]));
  });

  it('blocks namespace, default and re-export import bypasses', () => {
    const messages = lint(`import * as Grid from '@mui/x-data-grid'; export { DataGrid } from '@mui/x-data-grid'; import * as Mui from '@mui/material'; import DataGrid from '@mui/x-data-grid/DataGrid'; import { GlobalStyles } from '@mui/material/GlobalStyles'; import './page.css?inline';`);
    expect(messages.filter((message) => message.ruleId === 'local/feature-imports')).toHaveLength(6);
  });

  it('requires scoped property, value and reason for exceptions', () => {
    const entries = [{ path: 'src/features/Example.tsx', property: 'color', value: '#171717', reason: 'brand mark' }];
    expect(matchesStyleException(entries, 'src/features/Example.tsx', 'color', '#171717')).toBe(true);
    expect(matchesStyleException(entries, 'src/features/Other.tsx', 'color', '#171717')).toBe(false);
    expect(matchesStyleException([{ ...entries[0], reason: '' }], 'src/features/Example.tsx', 'color', '#171717')).toBe(false);
  });
});
