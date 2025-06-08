import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import toast from '../utils/toastNotifications'; // Import toast

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(null); // Can be removed if only using toasts for errors
    // const [successMessage, setSuccessMessage] = useState(''); // Can be removed if only using toasts for success

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // setError(null); // Clear local error state
        // setSuccessMessage(''); // Clear local success message

        try {
            await apiClient.post('/auth/register', {
                email: email,
                password: password,
                full_name: fullName,
            });

            toast.success('Registration successful! Please login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Delay navigation slightly to let user see toast

        } catch (err) {
            console.error("Signup failed:", err);
            const errorMsg = err.response?.data?.detail || "Signup failed. Please try again.";
            // setError(errorMsg); // Set local error state if needed
            toast.error(errorMsg); // Show toast notification
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        // required // Depending on your backend validation
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                {/* {error && <p style={{ color: 'red' }}>{error}</p>} */} {/* Replaced by toast */}
                {/* {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} */} {/* Replaced by toast */}
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default SignupPage;
