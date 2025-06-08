import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import toast from '../../utils/toastNotifications';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { X, CheckCircle } from 'lucide-react';

const ConnectAccountModal = ({ isOpen, onClose, workspaceId, onAccountConnected }) => {
    const { socialPlatforms, isLoadingPlatforms } = useWorkspace();
    const [selectedPlatformId, setSelectedPlatformId] = useState('');
    const [mockAccessToken, setMockAccessToken] = useState('');
    const [accountName, setAccountName] = useState(''); // User-defined name for this connection
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Reset state when modal is opened/closed or workspaceId changes
        setSelectedPlatformId('');
        setMockAccessToken('');
        setAccountName('');
        setIsLoading(false);
    }, [isOpen, workspaceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlatformId) {
            toast.error("Please select a social platform.");
            return;
        }
        if (!accountName.trim()) {
            toast.error("Please provide a name for this account connection (e.g., 'My Business Page').");
            return;
        }
        if (!mockAccessToken.trim()) {
            toast.error("Please enter the mock access token.");
            return;
        }

        setIsLoading(true);

        const payload = {
            platform_id: parseInt(selectedPlatformId), // Ensure it's an integer
            access_token: mockAccessToken,
            account_name: accountName,
            workspace_id: workspaceId, // Make sure backend expects this if it's part of ConnectedAccountCreate schema
            // platform_account_id and platform_account_name would ideally be fetched from the platform via the token
            // For mock purposes, these might be omitted or set to defaults by backend if not provided.
            // Or, you could add more mock input fields for these if needed.
        };

        const promise = apiClient.post(`/workspaces/${workspaceId}/connected_accounts`, payload);

        toast.promise(
            promise,
            {
                pending: 'Connecting account...',
                success: 'Account connected successfully!',
                error: {
                    render({ data }) {
                        return data?.response?.data?.detail || data?.message || 'Failed to connect account.';
                    }
                }
            }
        ).then(() => {
            onAccountConnected(); // Trigger refresh in parent
            onClose(); // Close modal
        }).catch(() => {
            // Error handled by toast.promise
        }).finally(() => {
            setIsLoading(false);
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{ /* Basic Overlay Styles */
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 1050 // Higher z-index than other modals if any
            }}
            onClick={onClose}
        >
            <div
                style={{ /* Basic Modal Content Styles */
                    backgroundColor: 'white', padding: '30px', borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', minWidth: '400px', maxWidth: '550px',
                    border: '2px solid black'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#333' }}>Connect New Social Account</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} aria-label="Close modal">
                        <X size={28} color="#555" />
                    </button>
                </div>

                {isLoadingPlatforms ? <p>Loading social platforms...</p> : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>
                            Select Social Platform <span style={{color: 'red'}}>*</span>
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {socialPlatforms.map(platform => (
                                <button
                                    type="button"
                                    key={platform.id}
                                    onClick={() => setSelectedPlatformId(platform.id.toString())}
                                    style={{
                                        padding: '10px 15px', borderRadius: '6px', border: '2px solid',
                                        borderColor: selectedPlatformId === platform.id.toString() ? '#007bff' : '#ccc',
                                        backgroundColor: selectedPlatformId === platform.id.toString() ? '#007bff' : 'white',
                                        color: selectedPlatformId === platform.id.toString() ? 'white' : '#333',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        fontWeight: selectedPlatformId === platform.id.toString() ? '600' : 'normal'
                                    }}
                                >
                                    {/* Placeholder for platform icon - you might map platform.name to an icon component */}
                                    <span>{platform.name}</span>
                                    {selectedPlatformId === platform.id.toString() && <CheckCircle size={18} />}
                                </button>
                            ))}
                        </div>
                         {socialPlatforms.length === 0 && <p className="text-sm text-gray-500">No social platforms available. Contact admin.</p>}
                    </div>

                    {selectedPlatformId && (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label htmlFor="accountName" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#444' }}>
                                    Account Nickname <span style={{color: 'red'}}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="accountName"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g., My Company's Twitter"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="mockAccessToken" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#444' }}>
                                    Mock Access Token <span style={{color: 'red'}}>*</span> (for this demo)
                                </label>
                                <input
                                    type="text" // In real OAuth, this field wouldn't exist or would be handled differently
                                    id="mockAccessToken"
                                    value={mockAccessToken}
                                    onChange={(e) => setMockAccessToken(e.target.value)}
                                    placeholder="Enter any string for mock token"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                                <p style={{fontSize: '0.8em', color: '#666', marginTop: '5px'}}>
                                    In a real application, you would be redirected to the social platform to authorize.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '12px', backgroundColor: isLoading ? '#ccc' : '#28a745',
                                    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    fontSize: '1rem', fontWeight: 'bold', transition: 'background-color 0.2s ease'
                                }}
                            >
                                {isLoading ? 'Connecting...' : 'Connect Account'}
                            </button>
                        </>
                    )}
                </form>
                )}
            </div>
        </div>
    );
};

export default ConnectAccountModal;
