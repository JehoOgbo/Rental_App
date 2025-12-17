import React from 'react';
import { propertyService } from '../api/propertyService';

import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('[LOGIN PAGE] Form submitted');
        setError(''); // Clear previous errors
        try {
            console.log('[LOGIN PAGE] Calling login...');
            await login(email, password);
            console.log('[LOGIN PAGE] Login successful, navigating to /home');
            navigate('/home');
            console.log('[LOGIN PAGE] Navigate called');
        } catch (err) {
            console.error('[LOGIN PAGE] Login error:', err);
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700 transition-colors">Sign In</button>
                </form>
                <div className="mt-6 flex flex-col gap-3">
                    <Link to="/signup" className="text-center text-slate-600 hover:text-primary transition-colors">
                        Don't have an account? <span className="font-semibold">Sign Up</span>
                    </Link>
                    <Link to="/" className="text-center text-slate-500 hover:text-primary transition-colors text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const SignupPage = () => {
    const [formData, setFormData] = React.useState({ email: '', password: '', firstName: '', lastName: '' });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear previous errors
        try {
            // Split name into first/last for backend if needed, or just send as is
            // API expects email, password. Additional fields might need adjustment based on user model
            await propertyService.registerUser({
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            });
            window.location.href = '/login'; // Redirect on success
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during signup.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full p-2 border rounded"
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full p-2 border rounded"
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button disabled={loading} className="w-full bg-accent text-white py-2 rounded hover:bg-green-700 transition-colors">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="mt-6 flex flex-col gap-3">
                    <Link to="/login" className="text-center text-slate-600 hover:text-primary transition-colors">
                        Already have an account? <span className="font-semibold">Log In</span>
                    </Link>
                    <Link to="/" className="text-center text-slate-500 hover:text-primary transition-colors text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
};




