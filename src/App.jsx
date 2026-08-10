import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Page Views
import LandingPage from './pages/LandingPage';
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

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
        <p className="text-sm font-medium tracking-wide animate-pulse">Initializing Session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

const App = () => {
  return (
    <Routes>
      {/* Public Root & Guest Routes */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/users/:id" element={<PublicProfile />} />

      {/* Protected Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
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
