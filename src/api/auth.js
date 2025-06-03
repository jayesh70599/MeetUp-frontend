// src/api/auth.js
import API from './api';

export const registerUser = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data; // Should return { token: '...' }
  } catch (error) {
    // Re-throw the error so the component can catch it
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await API.post('/auth/login', userData);
    return response.data; // Should return { token: '...' }
  } catch (error) {
    // Re-throw the error so the component can catch it
    throw error.response ? error.response.data : new Error('Login failed');
  }
};