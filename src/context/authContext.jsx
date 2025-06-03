// // src/context/AuthContext.js
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../api/api';
// import { registerUser as apiRegisterUser, loginUser as apiLoginUser } from '../api/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [user, setUser] = useState(null); // We might add user details later
//   const [loading, setLoading] = useState(true); // To handle initial load check
//   const navigate = useNavigate();


//   // Effect to set token from localStorage on initial load
//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       setToken(storedToken);
//       API.defaults.headers.common['x-auth-token'] = storedToken;
//       // You could add an API call here to fetch user details using the token
//     }
//     setLoading(false); // Finished initial check
//   }, []);

//   const handleAuthResponse = (data) => {
//     const { token } = data;
//     localStorage.setItem('token', token);
//     setToken(token);
//     API.defaults.headers.common['x-auth-token'] = token;
//     navigate('/'); // Navigate to home on successful auth
//   };

//   const register = async (userData) => {
//     const data = await apiRegisterUser(userData);
//     handleAuthResponse(data);
//   };

//   const login = async (userData) => {
//     const data = await apiLoginUser(userData);
//     handleAuthResponse(data);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//     delete API.defaults.headers.common['x-auth-token'];
//     navigate('/login'); // Navigate to login on logout
//   };

//   // The value provided to consuming components
//   const value = {
//     token,
//     user,
//     isAuthenticated: !!token, // Simple check if token exists
//     loading,
//     register,
//     login,
//     logout,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // Custom hook to easily use the Auth Context
// export const useAuth = () => {
//   return useContext(AuthContext);
// };


// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api'; // Your axios instance
import { registerUser as apiRegisterUser, loginUser as apiLoginUser } from '../api/auth';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORT jwt-decode (use this for v3+)
// If you installed an older version or a different library, the import might be:
// import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // This will now store { id, name, email }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to set user from token
  const setUserFromToken = (currentToken) => {
    if (currentToken) {
      try {
        const decodedToken = jwtDecode(currentToken); // Decode the token
        setUser(decodedToken.user); // Set user state with { id, name, email }
        API.defaults.headers.common['x-auth-token'] = currentToken;
        console.log("User set from token:", decodedToken.user);
      } catch (error) {
        console.error("Failed to decode token or token invalid:", error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete API.defaults.headers.common['x-auth-token'];
      }
    } else {
      setUser(null); // No token, no user
      delete API.defaults.headers.common['x-auth-token'];
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setUserFromToken(storedToken); // <-- Use the new function
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    const { token: newToken } = data; // Renamed to newToken to avoid conflict
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserFromToken(newToken); // <-- Use the new function
    navigate('/');
  };

  const register = async (userData) => {
    const data = await apiRegisterUser(userData);
    handleAuthResponse(data);
  };

  const login = async (userData) => {
    const data = await apiLoginUser(userData);
    handleAuthResponse(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null); // Clear user state
    delete API.defaults.headers.common['x-auth-token'];
    navigate('/login');
  };

  const value = {
    token,
    user, // Now user will have { id, name, email }
    isAuthenticated: !!token && !!user, // Make sure user is also set
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};