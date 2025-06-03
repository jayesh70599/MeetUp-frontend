// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MeetingRoom from './pages/MeetingRoom';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { AuthProvider } from './context/authContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Any route nested inside here will be protected */}
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
            {/* You could add more protected routes here, like a Dashboard */}
            {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
          </Route>

          {/* Optional: Add a 404 Not Found route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;