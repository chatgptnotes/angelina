import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';

// App pages
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import QSEstimate from './pages/QSEstimate';
import DrawingAnalysis from './pages/DrawingAnalysis';
import NewProject from './pages/NewProject';
import RatesPage from './pages/RatesPage';
import ComparePage from './pages/ComparePage';
import ProjectSettings from './pages/ProjectSettings';
import SharePage from './pages/SharePage';
import SmartTemplates from './pages/SmartTemplates';
import VendorDatabase from './pages/VendorDatabase';
import MaterialLibrary from './pages/MaterialLibrary';

// Settings pages
import ProfilePage from './pages/settings/ProfilePage';
import TeamPage from './pages/settings/TeamPage';
import BillingPage from './pages/settings/BillingPage';
import BillOfMaterial from './pages/BillOfMaterial';
import SABIEstimate from './pages/SABIEstimate';
import ActivityPage from './pages/settings/ActivityPage';
import NotificationsPage from './pages/settings/NotificationsPage';
import HelpPage from './pages/help/HelpPage';

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/share/:id" element={<SharePage />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/project/:id" element={<ProjectView />} />
            <Route path="/app/project/:id/settings" element={<ProjectSettings />} />
            <Route path="/app/project/:id/qs-estimate" element={<QSEstimate />} />
            <Route path="/app/project/:id/drawing-analysis" element={<DrawingAnalysis />} />
            <Route path="/app/project/:id/bom" element={<BillOfMaterial />} />
            <Route path="/app/project/:id/sabi" element={<SABIEstimate />} />
            <Route path="/app/new" element={<NewProject />} />
            <Route path="/app/rates" element={<RatesPage />} />
            <Route path="/app/compare" element={<ComparePage />} />
            <Route path="/app/templates" element={<SmartTemplates />} />
            <Route path="/app/vendors" element={<VendorDatabase />} />
            <Route path="/app/materials" element={<MaterialLibrary />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/team" element={<TeamPage />} />
            <Route path="/app/billing" element={<BillingPage />} />
            <Route path="/app/activity" element={<ActivityPage />} />
            <Route path="/app/notifications" element={<NotificationsPage />} />
            <Route path="/app/help" element={<HelpPage />} />
          </Route>
        </Route>

        {/* Legacy redirects */}
        <Route path="/project/:id" element={<Navigate to="/app" replace />} />
        <Route path="/new" element={<Navigate to="/app/new" replace />} />
        <Route path="/rates" element={<Navigate to="/app/rates" replace />} />
        <Route path="/compare" element={<Navigate to="/app/compare" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
