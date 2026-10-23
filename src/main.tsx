import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { theme } from './theme';
import { router } from './app/router';

createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider theme={theme}><CssBaseline /><RouterProvider router={router} /></ThemeProvider></StrictMode>);
