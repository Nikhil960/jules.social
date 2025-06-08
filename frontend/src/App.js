import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard'; // Assuming Dashboard is the main page after login
import LoginPage from './pages/LoginPage'; // To be created
import SignupPage from './pages/SignupPage'; // To be created
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for react-toastify
import './App.css'; // Assuming this is your main CSS file

// It's good practice to have a Layout component that includes Header, Sidebar, etc.
// For now, Dashboard will be the main protected content.
// import Header from './components/Header'; // If you want a persistent header

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Router>
          {/* <Header /> You might want a global header here, or handle it within routes */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // or "dark" or "colored"
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Define other protected routes here, wrapped with ProtectedRoute
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            */}
          </Routes>
        </Router>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;