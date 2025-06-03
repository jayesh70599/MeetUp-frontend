// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // 1. If we are still loading the auth state, show a loading message
  //    This prevents a brief flash of the login page for logged-in users
  //    on page refresh.
  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  // 2. If we are done loading and the user IS authenticated,
  //    render the child route using <Outlet />.
  //    <Outlet /> acts as a placeholder for the nested route's element.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // 3. If we are done loading and the user IS NOT authenticated,
  //    redirect them to the login page. The 'replace' prop means
  //    the login page will replace the current entry in the history,
  //    so the user can't click "back" to the protected route.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;