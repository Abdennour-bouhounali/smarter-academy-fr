import React, { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser, logout as logoutRequest, updateGrade as updateGradeRequest } from '../services/authService';
import { storage } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    storage.setItem('token', jwtToken);
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    storage.removeItem('token');
  };

  const logout = async () => {
    const currentToken = token;
    // Clear local state immediately so the UI reflects logout without
    // waiting on the network; the revocation call happens best-effort after.
    clearSession();

    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch (error) {
        console.error('Error revoking session:', error);
      }
    }
  };

  const updateGrade = async (grade) => {
    const updatedUser = await updateGradeRequest(token, grade);
    setUser(updatedUser);
    return updatedUser;
  };

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser(token);
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateGrade }}>
      {children}
    </AuthContext.Provider>
  );
};
