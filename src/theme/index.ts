import { createTheme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

// Visual authority: docs/reference/DESIGN-vercel.md. Keep source values intact.
const sans = '"Geist Variable", Arial, sans-serif';
const mono = '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace';
export const vercelTokens = {
    colors: {
        primary: '#171717', 'on-primary': '#ffffff', ink: '#171717', body: '#4d4d4d',
        mute: '#8f8f8f', faint: '#a1a1a1', hairline: '#ebebeb', 'hairline-soft': '#f2f2f2',
        canvas: '#fafafa', 'canvas-elevated': '#ffffff', link: '#0070f3', 'link-deep': '#0761d1', 'link-soft': '#d3e5ff',
        error: '#ee0000', 'error-deep': '#c50000', warning: '#f5a623', 'warning-soft': '#ffefcf', 'warning-deep': '#ab570a',
        violet: '#7928ca', 'violet-soft': '#d8ccf1', cyan: '#50e3c2', 'cyan-soft': '#aaffec', pink: '#ff0080', magenta: '#eb367f',
        'gradient-develop-start': '#007cf0', 'gradient-develop-end': '#00dfd8',
        'gradient-preview-start': '#7928ca', 'gradient-preview-end': '#ff0080',
        'gradient-ship-start': '#ff4d4d', 'gradient-ship-end': '#f9cb28',
    },
    typography: {
        'display-xl': { fontFamily: sans, fontSize: 48, fontWeight: 600, lineHeight: '48px', letterSpacing: '-2.4px' },
        'heading-lg': { fontFamily: sans, fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: '-1.28px' },
        'heading-md': { fontFamily: sans, fontSize: 20, fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.4px' },
        // The source's malformed label-sm fontWeight is resolved by its hierarchy table (500).
        'label-sm': { fontFamily: sans, fontSize: 14, fontWeight: 500, lineHeight: '20px', letterSpacing: '-0.28px' },
        'mono-eyebrow': { fontFamily: mono, fontSize: 12, fontWeight: 500, lineHeight: '16px', letterSpacing: 0 },
        'body-lg': { fontFamily: sans, fontSize: 16, fontWeight: 400, lineHeight: '24px', letterSpacing: 0 },
        'body-md': { fontFamily: sans, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: 0 },
        'body-sm': { fontFamily: sans, fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: 0 },
        'button-lg': { fontFamily: sans, fontSize: 16, fontWeight: 500, lineHeight: '20px', letterSpacing: 0 },
        'button-md': { fontFamily: sans, fontSize: 14, fontWeight: 500, lineHeight: '20px', letterSpacing: 0 },
        code: { fontFamily: mono, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: 0 },
    },
    rounded: { none: 0, sm: 6, md: 12, lg: 16, 'pill-category': 64, pill: 100, full: 9999 },
    spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 40, '3xl': 64, '4xl': 96, section: 128 },
};
const c = vercelTokens.colors;
const type = vercelTokens.typography;
export const tokens = {
    colors: {
        ink: c.ink, canvas: c.canvas, surface: c['canvas-elevated'], secondary: c.body, muted: c.mute, faint: c.faint,
        divider: c.hairline, controlBorder: c.hairline, hover: c['hairline-soft'], selected: c.hairline,
        blue: c.link, success: c.link, warning: c.warning, error: c.error,
    },
    spacing: vercelTokens.spacing.xxs,
    radius: { control: vercelTokens.rounded.sm, panel: vercelTokens.rounded.md, large: vercelTokens.rounded.lg,
        category: vercelTokens.rounded['pill-category'], pill: vercelTokens.rounded.pill, full: vercelTokens.rounded.full },
    // Product layout extensions from the approved admin scope, separate from source tokens.
    size: { control: 40, row: 48, tableHeader: 44, sidebar: 232, topbar: 64, minViewport: 1280, pagePadding: 32 },
    font: { sans, mono },
    microElevation: '0px 1px 1px rgba(0,0,0,0.04)',
    elevation: `0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.08), inset 0px 0px 0px 1px ${c.hairline}`,
    gradients: {
        develop: `linear-gradient(135deg, ${c['gradient-develop-start']}, ${c['gradient-develop-end']})`,
        preview: `linear-gradient(135deg, ${c['gradient-preview-start']}, ${c['gradient-preview-end']})`,
        ship: `linear-gradient(135deg, ${c['gradient-ship-start']}, ${c['gradient-ship-end']})`,
    },
};

declare module '@mui/material/styles' {
    interface TypographyVariants { display: CSSProperties; lead: CSSProperties; code: CSSProperties }
    interface TypographyVariantsOptions { display?: CSSProperties; lead?: CSSProperties; code?: CSSProperties }
}
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides { display: true; lead: true; code: true }
}
declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides { marketing: true; marketingOutlined: true; category: true }
}

export const theme = createTheme({
    spacing: tokens.spacing,
    shape: { borderRadius: tokens.radius.control },
    palette: {
        mode: 'light',
        primary: { main: c.primary, dark: c.body, light: c.body, contrastText: c['on-primary'] },
        secondary: { main: c.link, dark: c['link-deep'], light: c['link-soft'], contrastText: c['on-primary'] },
        info: { main: c.link, dark: c['link-deep'], light: c['link-soft'], contrastText: c['on-primary'] },
        success: { main: c.link, dark: c['link-deep'], light: c['link-soft'], contrastText: c['on-primary'] },
        warning: { main: c.warning, dark: c['warning-deep'], light: c['warning-soft'], contrastText: c.ink },
        error: { main: c.error, dark: c['error-deep'], light: c['hairline-soft'], contrastText: c['on-primary'] },
        background: { default: c.canvas, paper: c['canvas-elevated'] },
        text: { primary: c.ink, secondary: c.body, disabled: c.faint }, divider: c.hairline,
        action: { hover: c['hairline-soft'], selected: c.hairline, disabled: c.faint, disabledBackground: c['hairline-soft'] },
    },
    typography: {
        fontFamily: sans, fontSize: 14,
        h1: type['heading-lg'], h2: type['heading-md'], h3: type['heading-md'], h4: type['heading-md'], h5: type['heading-md'], h6: type['heading-md'],
        subtitle1: type['label-sm'], subtitle2: type['label-sm'],
        body1: type['body-md'], body2: type['body-md'], caption: type['body-sm'],
        button: { ...type['button-md'], textTransform: 'none' },
        overline: { ...type['mono-eyebrow'], textTransform: 'uppercase' },
        display: type['display-xl'], lead: type['body-lg'], code: type.code,
    },
    components: {
        MuiButtonBase: { defaultProps: { disableRipple: true }, styleOverrides: { root: { '&.Mui-focusVisible': { outline: `2px solid ${c.link}`, outlineOffset: 3 } } } },
        MuiCssBaseline: { styleOverrides: {
            // MUI locks this root and compensates its scrollbar once; a stable gutter would reserve it twice.
            html: { overflowY: 'scroll' }, body: { margin: 0 }, '*': { boxSizing: 'border-box' },
            '::selection': { background: c.ink, color: c['on-primary'] },
            ':focus-visible': { outline: `2px solid ${c.link}`, outlineOffset: 3 },
            a: { textUnderlineOffset: 3 }, 'input, textarea': { caretColor: c.link },
            '@media (prefers-reduced-motion: reduce)': { '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' } },
        } },
        MuiTypography: { defaultProps: { variantMapping: { display: 'h1', lead: 'p', code: 'code' } } },
        MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: {
            root: { borderRadius: tokens.radius.control, minHeight: tokens.size.control, padding: '0px 6px', whiteSpace: 'nowrap', transition: 'background-color 140ms ease-out', '&.MuiButton-colorError:not(.MuiButton-contained):not(.Mui-disabled)': { color: c['error-deep'] } },
            sizeSmall: { ...type['button-md'], minHeight: tokens.size.control, padding: '0px 6px' },
            outlined: { borderColor: c.hairline, color: c.ink, backgroundColor: c['canvas-elevated'], '&:hover': { borderColor: c.body, backgroundColor: c['hairline-soft'] } },
            text: { '&:hover': { backgroundColor: c['hairline-soft'] } },
        }, variants: [
            { props: { variant: 'marketing' }, style: { ...type['button-lg'], borderRadius: tokens.radius.pill, padding: '0px 14px', minHeight: 44, backgroundColor: c.primary, color: c['on-primary'], '&:hover': { backgroundColor: c.body } } },
            { props: { variant: 'marketingOutlined' }, style: { ...type['button-lg'], borderRadius: tokens.radius.pill, padding: '0px 14px', minHeight: 44, border: `1px solid ${c.hairline}`, backgroundColor: c['canvas-elevated'], color: c.ink, '&:hover': { backgroundColor: c['hairline-soft'] } } },
            { props: { variant: 'category' }, style: { ...type['button-md'], borderRadius: tokens.radius.category, padding: '0px 16px', border: `1px solid ${c.hairline}`, backgroundColor: c['canvas-elevated'], color: c.ink, '&:hover': { backgroundColor: c['hairline-soft'] }, '&[aria-pressed="true"]:not(.Mui-disabled)': { backgroundColor: c.ink, color: c['on-primary'], borderColor: c.ink, '&:hover': { backgroundColor: c.body, borderColor: c.body } } } },
        ] },
        MuiIconButton: { styleOverrides: { root: { borderRadius: tokens.radius.full, padding: 0, width: tokens.size.control, height: tokens.size.control, border: `1px solid ${c.hairline}`, backgroundColor: c['canvas-elevated'], color: c.ink, '&.Mui-focusVisible': { outline: `2px solid ${c.link}`, outlineOffset: 3 } }, sizeSmall: { width: 32, height: 32, borderColor: 'transparent', backgroundColor: 'transparent', '&:hover': { backgroundColor: c['hairline-soft'] } } } },
        MuiTextField: { defaultProps: { size: 'small', variant: 'outlined', fullWidth: true, slotProps: { inputLabel: { shrink: true } } } },
        MuiSelect: { defaultProps: { displayEmpty: true } },
        MuiInputBase: { styleOverrides: { input: { '&::placeholder': { color: c.faint, opacity: 1 } } } },
        MuiOutlinedInput: { styleOverrides: {
            root: { backgroundColor: c['canvas-elevated'], minHeight: tokens.size.control, ...type['body-md'], '& .MuiOutlinedInput-notchedOutline': { borderColor: c.hairline }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.ink }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.link, borderWidth: 2 }, '&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c['error-deep'] }, '&.MuiInputBase-multiline': { padding: '8px 12px' } },
            input: { padding: '8px 12px', '&.MuiInputBase-inputMultiline': { padding: 0 } },
            notchedOutline: { top: 0, '& legend': { display: 'none' } },
        } },
        MuiInputLabel: { styleOverrides: { root: { ...type['label-sm'], position: 'static', transform: 'none', maxWidth: '100%', marginBottom: 8, color: c.ink, '&.Mui-focused': { color: c['link-deep'] }, '&.Mui-error, &.Mui-error.Mui-focused': { color: c['error-deep'] } }, shrink: { transform: 'none' } } },
        MuiFormLabel: { styleOverrides: { root: { '&.Mui-error': { color: c['error-deep'] } } } },
        MuiFormHelperText: { styleOverrides: { root: { ...type['body-sm'], marginLeft: 0, '&.Mui-error': { color: c['error-deep'] } } } },
        MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { rounded: { borderRadius: tokens.radius.panel } } },
        MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderRadius: tokens.radius.panel } } },
        MuiCardContent: { styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } } },
        MuiChip: { defaultProps: { size: 'small' }, styleOverrides: {
            root: { height: 24, borderRadius: tokens.radius.control, ...type['label-sm'],
                '&.MuiChip-outlined.MuiChip-colorSuccess, &.MuiChip-outlined.MuiChip-colorInfo': { color: c['link-deep'] },
                '&.MuiChip-outlined.MuiChip-colorWarning': { color: c['warning-deep'] },
                '&.MuiChip-outlined.MuiChip-colorError': { color: c['error-deep'] },
            },
            colorDefault: { backgroundColor: c['hairline-soft'], color: c.body },
            label: { overflow: 'hidden', textOverflow: 'ellipsis' },
        } },
        MuiAlert: { styleOverrides: {
            root: { borderRadius: tokens.radius.control, alignItems: 'center',
                '&.MuiAlert-standard.MuiAlert-colorSuccess, &.MuiAlert-standard.MuiAlert-colorInfo': { color: c['link-deep'], backgroundColor: c['link-soft'] },
                '&.MuiAlert-standard.MuiAlert-colorWarning': { color: c['warning-deep'], backgroundColor: c['warning-soft'] },
                '&.MuiAlert-standard.MuiAlert-colorError': { color: c['error-deep'], backgroundColor: c['canvas-elevated'], border: `1px solid ${c.hairline}` },
            }, message: { minWidth: 0 },
        } },
        MuiDialog: { defaultProps: { maxWidth: 'xs', fullWidth: true }, styleOverrides: { paper: { borderRadius: tokens.radius.large, boxShadow: tokens.elevation } } },
        MuiDialogTitle: { styleOverrides: { root: { padding: '24px 24px 12px', ...type['heading-md'] } } },
        MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },
        MuiMenu: { styleOverrides: { paper: { boxShadow: tokens.elevation, marginTop: 8 } } },
        MuiMenuItem: { styleOverrides: { root: { ...type['body-md'], minHeight: 36 } } },
        MuiCheckbox: { styleOverrides: { root: { color: c.mute, padding: 8, '&.Mui-focusVisible': { outline: `2px solid ${c.link}`, outlineOffset: -2 } } } },
        MuiTablePagination: { styleOverrides: { root: { color: c.body, '& .MuiInputBase-root': { ...type['body-md'], height: tokens.size.control, border: `1px solid ${c.hairline}`, borderRadius: tokens.radius.control, backgroundColor: c['canvas-elevated'] }, '& .MuiSelect-icon': { right: 8 }, '& .MuiTablePagination-select.MuiSelect-select.MuiInputBase-input': { ...type['body-md'], padding: '8px 32px 8px 12px', '&:focus': { borderRadius: tokens.radius.control, backgroundColor: c['hairline-soft'] } } }, selectLabel: type['body-sm'], displayedRows: { ...type['body-sm'], fontVariantNumeric: 'tabular-nums' } } },
        MuiTab: { styleOverrides: { root: { textTransform: 'none', minHeight: 44, ...type['label-sm'] } } },
        MuiTabs: { styleOverrides: { root: { minHeight: 44 }, indicator: { height: 2 } } },
        MuiTableCell: { styleOverrides: { root: { ...type['body-md'], padding: '12px 16px', borderColor: c.hairline }, head: { ...type['label-sm'], color: c.body, backgroundColor: c.canvas } } },
        MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { color: c['link-deep'], '&:hover': { color: c.link } } } },
        MuiTooltip: { defaultProps: { arrow: true }, styleOverrides: { tooltip: { ...type['body-sm'], backgroundColor: c.ink, color: c['on-primary'], boxShadow: tokens.elevation } } },
    },
});
