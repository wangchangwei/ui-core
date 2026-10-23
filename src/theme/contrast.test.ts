import { describe, expect, it } from 'vitest';
import { theme, vercelTokens } from './index';

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
describe('readable source-token usage pairs', () => {
  for (const background of [theme.palette.background.paper, theme.palette.background.default]) {
    for (const [name, foreground] of Object.entries({
      heading: theme.palette.text.primary, body: theme.palette.text.secondary,
      link: theme.palette.info.dark, positive: theme.palette.success.dark,
      warning: theme.palette.warning.dark, error: theme.palette.error.dark,
    })) {
      it(`${name} meets 4.5:1 text contrast on ${background}`, () => {
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  for (const name of ['success', 'info', 'warning'] as const) {
    it(`${name} deep text is readable on its source soft background`, () => {
      expect(contrast(theme.palette[name].dark, theme.palette[name].light)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('keeps muted, faint and bright warning source colors without claiming they are AA text', () => {
    const c = vercelTokens.colors;
    expect(contrast(c.mute, c['canvas-elevated'])).toBeLessThan(4.5);
    expect(contrast(c.faint, c['canvas-elevated'])).toBeLessThan(4.5);
    expect(contrast(c.warning, c['canvas-elevated'])).toBeLessThan(4.5);
  });
});
