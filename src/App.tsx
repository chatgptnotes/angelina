import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import NewProject from './pages/NewProject';
import RatesPage from './pages/RatesPage';
import ComparePage from './pages/ComparePage';
import ProjectSettings from './pages/ProjectSettings';
import SharePage from './pages/SharePage';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public share link - no layout */}
        <Route path="/share/:id" element={<SharePage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectView />} />
          <Route path="/project/:id/settings" element={<ProjectSettings />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/rates" element={<RatesPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
