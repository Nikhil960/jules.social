import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { useAuth } from './AuthContext';
import toast from '../utils/toastNotifications'; // Import toast

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const { token, isAuthenticated, user } = useAuth();
    const [userWorkspaces, setUserWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // For workspaces
    const [error, setError] = useState(null); // For workspaces

    const [socialPlatforms, setSocialPlatforms] = useState([]);
    const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
    const [errorPlatforms, setErrorPlatforms] = useState(null);


    useEffect(() => {
        // Load current workspace from localStorage on initial mount
        const storedWorkspace = localStorage.getItem('currentWorkspace');
        if (storedWorkspace) {
            try {
                setCurrentWorkspace(JSON.parse(storedWorkspace));
            } catch (e) {
                console.error("Error parsing stored workspace:", e);
                localStorage.removeItem('currentWorkspace');
            }
        }
    }, []);

    const fetchUserWorkspaces = async () => {
        if (!isAuthenticated || !token) {
            setUserWorkspaces([]);
            // If not authenticated, currentWorkspace should ideally be cleared or validated
            // For now, we leave it, and the validation against fetched workspaces will handle it.
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // apiClient will automatically add Authorization header
            const response = await apiClient.get('/workspaces');
            const fetchedWorkspaces = response.data || [];
            setUserWorkspaces(fetchedWorkspaces);

            const storedWorkspaceString = localStorage.getItem('currentWorkspace');
            let localCurrentWorkspace = null;
            if (storedWorkspaceString) {
                try {
                    localCurrentWorkspace = JSON.parse(storedWorkspaceString);
                } catch (e) {
                    console.error("Error parsing stored workspace on fetch:", e);
                    localStorage.removeItem('currentWorkspace');
                }
            }

            if (localCurrentWorkspace && fetchedWorkspaces.some(ws => ws.id === localCurrentWorkspace.id)) {
                setCurrentWorkspace(localCurrentWorkspace);
            } else if (fetchedWorkspaces.length > 0) {
                setCurrentWorkspace(fetchedWorkspaces[0]);
                localStorage.setItem('currentWorkspace', JSON.stringify(fetchedWorkspaces[0]));
            } else {
                setCurrentWorkspace(null);
                localStorage.removeItem('currentWorkspace');
            }
        } catch (err) {
            console.error("Failed to fetch workspaces:", err);
            const errorMsg = err.response?.data?.detail || "Failed to fetch workspaces.";
            setError(errorMsg);
            toast.error(errorMsg); // Show toast notification
            setUserWorkspaces([]);
            // Consider clearing currentWorkspace if fetch fails and it's invalid
            // setCurrentWorkspace(null);
            // localStorage.removeItem('currentWorkspace');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSocialPlatforms = async () => {
        if (!isAuthenticated || !token) {
            setSocialPlatforms([]);
            return;
        }
        setIsLoadingPlatforms(true);
        setErrorPlatforms(null);
        try {
            const response = await apiClient.get('/social_platforms');
            setSocialPlatforms(response.data || []);
        } catch (err) {
            console.error("Failed to fetch social platforms:", err);
            const errorMsg = err.response?.data?.detail || "Failed to fetch social platforms.";
            setErrorPlatforms(errorMsg);
            toast.error(errorMsg);
            setSocialPlatforms([]);
        } finally {
            setIsLoadingPlatforms(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchUserWorkspaces();
            fetchSocialPlatforms(); // Fetch platforms when authenticated
        } else {
            // Clear workspaces and platforms if user logs out
            setUserWorkspaces([]);
            setCurrentWorkspace(null);
            localStorage.removeItem('currentWorkspace');
            setSocialPlatforms([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token]); // Rerun when auth state changes

    const selectWorkspace = (workspace) => {
        if (workspace && userWorkspaces.some(ws => ws.id === workspace.id)) {
            setCurrentWorkspace(workspace);
            localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
            setError(null);
        } else if (workspace === null) { // Allow explicitly clearing workspace
            setCurrentWorkspace(null);
            localStorage.removeItem('currentWorkspace');
        } else {
            console.error("Selected workspace is not valid or not in user's workspaces list.");
            // Optionally set an error state here
            setError("Failed to select workspace: Not found in user's list.");
        }
    };

    return (
        <WorkspaceContext.Provider value={{
            userWorkspaces,
            currentWorkspace,
            isLoading, // workspace loading
            error, // workspace error
            selectWorkspace,
            fetchUserWorkspaces,
            socialPlatforms,
            isLoadingPlatforms,
            errorPlatforms, // platform error
            fetchSocialPlatforms // if needed to be called manually elsewhere
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
