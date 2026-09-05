import React, { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser, logout as logoutRequest, updateGrade as updateGradeRequest } from '../services/authService';
import { storage, migrateLegacyStorageToUser } from '../utils/storage';
import { setCurrentUserId } from '../utils/authUserId';
import { LEGACY_PER_STUDENT_KEYS, isLegacyLessonKey } from '../lessons/common/studentStorageKeys';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const applyUser = (userData) => {
    setUser(userData);
    setCurrentUserId(userData?.id ?? null);
    if (userData?.id != null) {
      // One-time: fold any pre-scoping / anonymous local progress into this
      // account the first time it's seen on this browser. A no-op on every
      // subsequent login once the legacy keys are gone.
      migrateLegacyStorageToUser(LEGACY_PER_STUDENT_KEYS, isLegacyLessonKey);
    }
  };

  const login = (userData, jwtToken) => {
    applyUser(userData);
    setToken(jwtToken);
    storage.setItem('token', jwtToken);
  };

  const clearSession = () => {
    setUser(null);
    setCurrentUserId(null);
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
    setCurrentUserId(updatedUser?.id ?? null);
    return updatedUser;
  };

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser(token);
      applyUser(currentUser);
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
