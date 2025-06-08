import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import toast from '../utils/toastNotifications'; // Import toast

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        }
    }, []);

    const fetchCurrentUser = async (currentToken) => {
        if (!currentToken) {
            setIsAuthenticated(false);
            setUser(null);
            return;
        }
        setIsLoading(true);
        try {
            // apiClient will add the token header automatically
            const response = await apiClient.get('/users/me');
            setUser(response.data);
            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch user or token invalid:", err);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            const errorMsg = err.response?.data?.detail || "Failed to fetch user data. Session might be invalid.";
            setError(errorMsg);
            // Show toast only if it's not an initial silent check or if it's a significant error
            // For now, let's show it if there was a currentToken, implying user expected to be logged in.
            if (currentToken) { // Only show toast if we were trying to validate an existing session
                 toast.error("Session error: " + errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            // For the /auth/token endpoint, we usually don't use the apiClient's JSON content type
            // and Authorization header if it's a form-urlencoded request and doesn't need a prior token.
            // So, we might use axios directly here or configure apiClient to handle this case.
            // For simplicity, using axios directly for this specific call.
            // OR, if apiClient's baseURL is /api/v1, then path should be 'auth/token'
            const response = await apiClient.post('/auth/token', new URLSearchParams({
                username: email,
                password: password
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // apiClient might add Authorization header if a token exists,
                    // which is usually fine for token refresh, but not for initial login.
                    // If it causes issues, create a separate axios instance for token endpoint.
                    // For now, assume it works or the backend ignores Authorization for this route.
                }
            });
            const { access_token } = response.data;
            localStorage.setItem('authToken', access_token); // apiClient interceptor will pick this up for subsequent requests
            setToken(access_token);
            await fetchCurrentUser(access_token); // Sets user and isAuthenticated
        } catch (err) {
            console.error("Login failed:", err);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            const errorMsg = err.response?.data?.detail || "Login failed. Please check credentials.";
            setError(errorMsg);
            toast.error(errorMsg); // Show toast on login failure
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        // Optionally redirect to login page or home page via window.location or router context if available
        // Example: window.location.href = '/login';
    };

    // Effect to refetch user if token changes from external source (e.g. another tab)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'authToken') {
                const newToken = event.newValue;
                setToken(newToken);
                if (newToken) {
                    fetchCurrentUser(newToken);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, error, login, logout, fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
