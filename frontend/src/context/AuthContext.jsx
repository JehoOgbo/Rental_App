import React, { createContext, useContext, useState, useEffect } from 'react';
import { propertyService } from '../api/propertyService';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validate token and restore session on mount
        const initAuth = async () => {
            if (token) {
                try {
                    // We might want a specific /me endpoint, but for now we'll assume token validity 
                    // or fetch dashboard data to verify.
                    // Since dashboard endpoint returns user info:
                    const response = await fetch(`${API_BASE_URL}/dashboard`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData.all); // Backend returns { name, all: { ...userObj } }
                    } else {
                        logout();
                    }
                } catch (e) {
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);


    const login = async (email, password) => {
        setLoading(true);
        try {
            console.log('[AUTH] Attempting login...');
            const data = await propertyService.userLogin({ email, password });
            console.log('[AUTH] Login successful, got token');

            setToken(data.access_token);
            localStorage.setItem('token', data.access_token);

            // Fetch user details immediately (but don't fail login if this fails)
            try {
                console.log('[AUTH] Fetching user dashboard...');
                const userResp = await fetch(`${API_BASE_URL}/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                if (userResp.ok) {
                    const userData = await userResp.json();
                    setUser(userData.all);
                    console.log('[AUTH] User data loaded');
                } else {
                    console.warn('[AUTH] Dashboard fetch failed with status:', userResp.status);
                    // Set minimal user object so auth guard doesn't block
                    setUser({ email });
                }
            } catch (dashboardError) {
                console.error('[AUTH] Dashboard fetch error (non-fatal):', dashboardError);
                // Set minimal user object so auth guard doesn't block
                setUser({ email });
            }

            return true;
        } catch (e) {
            console.error('[AUTH] Login failed:', e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
