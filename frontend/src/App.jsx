import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import ListPropertyPage from './pages/ListPropertyPage';
import { LoginPage, SignupPage } from './pages/Placeholders';

// Protected Route Wrapper
const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    return children;
};

// Navigation Component (Separate to use auth hook)
const Navigation = () => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    if (!user) return null; // Hide nav on landing/login pages or make it different

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                <Link to="/home" className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Uniconnect Logo" className="h-20 w-auto object-contain" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                    <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                    <Link to="/list-property" className="hover:text-primary transition-colors">List Property</Link>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/settings" className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                            {user.profile_pic ? (
                                <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                    {user.first_name ? user.first_name[0] : 'U'}
                                </div>
                            )}
                        </div>
                        <span className="hidden md:inline">{user.first_name ? user.first_name : 'Account'}</span>
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-primary"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-primary rounded transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/list-property"
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-primary rounded transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            List Property
                        </Link>
                        <Link
                            to="/settings"
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-primary rounded transition-colors flex items-center gap-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                                {user.profile_pic ? (
                                    <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                        {user.first_name ? user.first_name[0] : 'U'}
                                    </div>
                                )}
                            </div>
                            <span>{user.first_name ? user.first_name : 'Account'}</span>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <Navigation />
                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            {/* Protected Routes */}
                            <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
                            <Route path="/search" element={<RequireAuth><SearchResultsPage /></RequireAuth>} />
                            <Route path="/property/:id" element={<RequireAuth><PropertyDetailPage /></RequireAuth>} />
                            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                            <Route path="/list-property" element={<RequireAuth><ListPropertyPage /></RequireAuth>} />
                        </Routes>
                    </main>
                    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
                        <div className="container mx-auto px-4 text-center text-slate-500">
                            <p>&copy; 2024 Uniconnect. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
