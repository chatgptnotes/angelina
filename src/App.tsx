import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import NewProject from './pages/NewProject';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectView />} />
          <Route path="/new" element={<NewProject />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
