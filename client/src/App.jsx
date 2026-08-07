import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedLayout from './components/Layout/ProtectedLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import EditProfile from './pages/EditProfile';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      {/* Guest Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Public profile view route */}
      <Route path="/profile/:id" element={<PublicProfile />} />

      {/* Protected Routes wrapped in Navbar/Sidebar layout */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
      </Route>

      {/* Protected onboarding wizard (no navbar/sidebar sidebar) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Wildcard 404 handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
