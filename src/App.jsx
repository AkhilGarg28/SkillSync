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
import Dashboard from './pages/Dashboard';
import MatchExplorer from './components/MatchExplorer';
import MyMatchesTracker from './components/MyMatchesTracker';
import ChatWindow from './components/ChatWindow';
import Forum from './pages/Forum';
import MySessions from './pages/MySessions';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './routes/AdminRoute';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
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
        {/* Redirect root path to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<PublicProfile />} />
        <Route path="matches" element={<MatchExplorer />} />
        <Route path="tracker" element={<MyMatchesTracker />} />
        <Route path="sessions" element={<MySessions />} />
        <Route path="chat" element={<ChatWindow />} />
        <Route path="forum" element={<Forum />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="onboarding" element={<Onboarding />} />
      </Route>

      {/* 404 Wildcard Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
