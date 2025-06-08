import React, { useState } from 'react';
import apiClient from '../../services/api';
import toast from '../../utils/toastNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { X } from 'lucide-react'; // For close button

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(null); // Using toast for errors

    const { token } = useAuth(); // Needed if apiClient doesn't pick up token for some reason, but it should
    const { fetchUserWorkspaces, selectWorkspace } = useWorkspace();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Workspace name cannot be empty.");
            return;
        }

        setIsLoading(true);
        // setError(null); // Clear previous errors

        const promise = apiClient.post('/workspaces', { name, description }, {
            // Headers already handled by apiClient interceptor if token is in localStorage
            // headers: { Authorization: `Bearer ${token}` }
        });

        toast.promise(
            promise,
            {
                pending: 'Creating workspace...',
                success: 'Workspace created successfully!',
                error: {
                    render({ data }) {
                        return data?.response?.data?.detail || data?.message || 'Failed to create workspace.';
                    }
                }
            }
        ).then(async (response) => { // response from apiClient.post
            await fetchUserWorkspaces(); // Refresh the list of workspaces
            if (response.data) {
                selectWorkspace(response.data); // Select the newly created workspace
            }
            onClose(); // Close the modal
            setName(''); // Reset form
            setDescription('');
        }).catch(() => {
            // Error is handled by toast.promise
            // setError(err.response?.data?.detail || "Failed to create workspace.");
        }).finally(() => {
            setIsLoading(false);
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
            onClick={onClose} // Close if overlay is clicked
        >
            <div
                style={{
                    backgroundColor: 'white', padding: '30px', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '350px', maxWidth: '500px',
                    border: '2px solid black'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Create New Workspace</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        aria-label="Close modal"
                    >
                        <X size={24} color="#555" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="workspaceName" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#444' }}>
                            Workspace Name <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="text"
                            id="workspaceName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Awesome Project"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="workspaceDescription" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#444' }}>
                            Description (Optional)
                        </label>
                        <textarea
                            id="workspaceDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            placeholder="A brief description of what this workspace is for."
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                    </div>
                    {/* Error display can be removed if toasts are sufficient */}
                    {/* {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>} */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '12px', backgroundColor: isLoading ? '#ccc' : '#007bff',
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                            fontSize: '1rem', fontWeight: 'bold', transition: 'background-color 0.2s ease'
                        }}
                    >
                        {isLoading ? 'Creating...' : 'Create Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
