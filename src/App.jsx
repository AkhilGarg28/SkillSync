import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

// Page Views
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/users/:id" element={<PublicProfile />} />

      {/* Protected Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirect root path to profile */}
        <Route index element={<Navigate to="/profile" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="onboarding" element={<Onboarding />} />
      </Route>

      {/* 404 Wildcard Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
