import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1', // Your API base URL
    // timeout: 10000, // Optional: Timeout after 10 seconds
    headers: {
        'Content-Type': 'application/json',
        // You can set other default headers here
    }
});

// Interceptor to add the Authorization token to requests
// This assumes you'll store the token in localStorage or manage it via a state management solution
// For this example, we'll try to get it from localStorage directly.
// A more robust solution would be to have AuthContext provide the token to this apiClient instance,
// perhaps by configuring the interceptor after AuthContext is initialized, or by having AuthContext
// update a global variable or a ref that this interceptor can access.

// Simple way: Read from localStorage on each request.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// You can also add response interceptors for global error handling, e.g.:
apiClient.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);

            if (error.response.status === 401) {
                // Handle unauthorized errors, e.g., redirect to login
                // This should ideally be handled more gracefully, perhaps by dispatching an action
                // or calling a method from AuthContext to logout the user.
                console.warn('Unauthorized request. Logging out or redirecting...');
                localStorage.removeItem('authToken'); // Clear invalid token
                // window.location.href = '/login'; // Force redirect
                // Or use a more integrated router navigation if apiClient has access to it
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API No Response:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Request Setup Error:', error.message);
        }
        return Promise.reject(error); // This is important to propagate the error
    }
);


export default apiClient;
