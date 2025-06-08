import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, token } = useAuth();
    const location = useLocation();

    // Check for token directly as well, as isAuthenticated might have a slight delay in updating
    // This is a belt-and-suspenders approach. isLoading should ideally cover this.
    const hasToken = !!token;

    if (isLoading) {
        // You can replace this with a more sophisticated loading spinner
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!isAuthenticated && !hasToken) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
