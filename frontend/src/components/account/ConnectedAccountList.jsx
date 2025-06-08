import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import toast from '../../utils/toastNotifications';
import { useAuth } from '../../contexts/AuthContext'; // To ensure user is authenticated for API calls
import { PlusCircle, Trash2 } from 'lucide-react'; // Icons

// Placeholder for individual account item styling
const AccountItem = ({ account, onDelete }) => (
    <div style={{
        border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', marginBottom: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
        <div>
            <h4 style={{ margin: 0, fontWeight: '600', color: '#333' }}>
                {account.platform?.name || 'Unknown Platform'}
            </h4>
            <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.9em' }}>
                {account.platform_account_name || account.account_name || `ID: ${account.platform_account_id}`}
            </p>
            {account.account_name && account.platform_account_name && account.account_name !== account.platform_account_name &&
                 <p style={{ margin: '2px 0 0', color: '#888', fontSize: '0.8em' }}>(Nickname: {account.account_name})</p>
            }
        </div>
        <button
            onClick={() => onDelete(account.id)}
            title="Disconnect Account"
            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '5px' }}
        >
            <Trash2 size={18} />
        </button>
    </div>
);


const ConnectedAccountList = ({ workspaceId, onOpenConnectModal, refreshKey }) => {
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(null); // Using toasts for errors
    const { token } = useAuth(); // For API calls

    const fetchConnectedAccounts = useCallback(async () => {
        if (!workspaceId || !token) {
            setConnectedAccounts([]);
            return;
        }
        setIsLoading(true);
        // setError(null);
        try {
            const response = await apiClient.get(`/workspaces/${workspaceId}/connected_accounts`);
            setConnectedAccounts(response.data || []);
        } catch (err) {
            console.error('Error fetching connected accounts:', err);
            toast.error(err.response?.data?.detail || 'Failed to load connected accounts.');
            setConnectedAccounts([]);
            // setError(err.response?.data?.detail || 'Failed to load connected accounts.');
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, token]);

    useEffect(() => {
        fetchConnectedAccounts();
    }, [fetchConnectedAccounts, refreshKey]); // refreshKey change will trigger refetch

    const handleDeleteAccount = async (accountId) => {
        // Optimistic delete (optional)
        // const originalAccounts = [...connectedAccounts];
        // setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));

        const promise = apiClient.delete(`/workspaces/${workspaceId}/connected_accounts/${accountId}`);
        toast.promise(promise, {
            pending: 'Disconnecting account...',
            success: 'Account disconnected successfully!',
            error: {
                render({data}) {
                    // setConnectedAccounts(originalAccounts); // Revert optimistic delete
                    return data.response?.data?.detail || 'Failed to disconnect account.';
                }
            }
        })
        .then(() => {
            fetchConnectedAccounts(); // Refresh list on success
        })
        .catch(() => {
            // Error handled by toast, and optimistic delete (if used) should be reverted
        });
    };


    if (isLoading) {
        return <p style={{color: '#555', fontStyle: 'italic'}}>Loading connected accounts...</p>;
    }

    // Error state is handled by toasts, but you could show a specific UI message too
    // if (error) {
    //     return <p style={{color: 'red'}}>Error: {error}</p>;
    // }

    return (
        <div className="nb-card p-6 border-2 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="text-xl font-black text-gray-800">Connected Social Accounts</h3>
                <button
                    onClick={onOpenConnectModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
                >
                    <PlusCircle size={20} className="mr-2" /> Connect New Account
                </button>
            </div>

            {connectedAccounts.length === 0 ? (
                <p style={{color: '#777'}}>No social accounts connected to this workspace yet.</p>
            ) : (
                <div>
                    {connectedAccounts.map(account => (
                        <AccountItem key={account.id} account={account} onDelete={handleDeleteAccount} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConnectedAccountList;
