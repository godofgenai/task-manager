import { TextField, Button, Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        const res = await login({ email, password });
        if (res.token) {
            localStorage.setItem('token', res.token);
            navigate('/dashboard');
        } else {
            setError(res.message || 'Login failed');
        }
    };

    const handleRegister = async () => {
        setError('');
        const res = await register({ username, email, password });
        if (res.message === 'User registered') {
            setIsRegister(false);
        } else {
            setError(res.message || 'Registration failed');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
            <Typography variant="h5">{isRegister ? 'Register' : 'Login'}</Typography>
            {error && <Typography color="error">{error}</Typography>}
            {isRegister && <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />}
            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="contained" fullWidth onClick={isRegister ? handleRegister : handleLogin} sx={{ mt: 2 }}>
                {isRegister ? 'Register' : 'Login'}
            </Button>
            <Button color="secondary" fullWidth onClick={() => setIsRegister((prev) => !prev)} sx={{ mt: 1 }}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Button>
        </Box>
    );
}
