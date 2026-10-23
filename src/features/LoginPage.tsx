import { useState } from 'react';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppContext';
import { Brand } from '../app/AppShell';
import { FormField } from '../shared/ui';
const loginSchema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') });
type LoginInput = z.infer<typeof loginSchema>;
export function LoginPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: 'admin@example.com', password: 'Demo123!' } });
    const from: string = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('//') && !location.state.from.startsWith('/login') ? location.state.from : '/dashboard';
    const submit = async (values: LoginInput) => {
        setError(null);
        try {
            await login(values.email, values.password);
            navigate(from, { replace: true });
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
        }
    };
    return <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
    <Stack sx={{ px: 16, py: 10, justifyContent: 'space-between' }}>
      <Brand />
      <Box sx={{ maxWidth: 440 }}><Typography component="h2" variant="display" sx={{ maxWidth: '14ch', mb: 6 }}>A clear place to work.</Typography><Typography sx={{ color: 'text.secondary', maxWidth: '42ch' }}>People, projects, and the details that keep work moving. Everything in one consistent workspace.</Typography><Divider sx={{ my: 8 }}/><Stack direction="row" spacing={8}><Typography variant="body2">People</Typography><Typography variant="body2">Projects</Typography><Typography variant="body2">Progress</Typography></Stack></Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Local demo · Your changes stay in this browser.</Typography>
    </Stack>
    <Stack sx={{ bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider', justifyContent: 'center', px: 16 }}>
      <Box component="main" id="main-content" sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h1" component="h1">Sign in to your workspace</Typography><Typography sx={{ color: 'text.secondary', mt: 2, mb: 8 }}>Welcome back. Choose an account to get started.</Typography>
        <Box component="form" noValidate onSubmit={handleSubmit(submit)}><Stack spacing={6}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormField control={control} name="email" label="Email" type="email" autoComplete="username" autoFocus/>
          <FormField control={control} name="password" label="Password" type="password" autoComplete="current-password"/>
          <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
        </Stack></Box>
        <Divider sx={{ my: 8 }}/>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Explore with a demo account</Typography><Stack direction="row" spacing={3}>
          <Button variant="outlined" disabled={isSubmitting} onClick={() => { setError(null); reset({ email: 'admin@example.com', password: 'Demo123!' }); }}>Use Admin</Button><Button variant="outlined" disabled={isSubmitting} onClick={() => { setError(null); reset({ email: 'viewer@example.com', password: 'Demo123!' }); }}>Use Viewer</Button>
        </Stack><Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 4 }}>admin@example.com / viewer@example.com<br />Demo password: Demo123!</Typography>
      </Box>
    </Stack>
  </Box>;
}
