import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import signalRService from '../services/signalr';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Always start unauthenticated — only restore if a real token exists in storage.
  // Also purge any legacy mock-user data the old code may have stored.
  const [token, setToken] = useState(() => {
    localStorage.removeItem('campusfind_user'); // remove legacy mock user
    return localStorage.getItem('campusfind_token') || null;
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('campusfind_token'));
  const [notification, setNotification] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4500);
  };

  // Sync token to localStorage and manage SignalR connection
  useEffect(() => {
    if (token) {
      localStorage.setItem('campusfind_token', token);
      signalRService.startConnection();
    } else {
      localStorage.removeItem('campusfind_token');
      localStorage.removeItem('campusfind_user');
      signalRService.stopConnection();
    }
  }, [token]);

  // When a real token is present on mount, fetch the current user from the API
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    async function restoreSession() {
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setIsBackendOnline(true);
          setUser({
            id: res.data.id,
            name: res.data.fullName,
            email: res.data.email,
            studentId: res.data.studentOrStaffId || '',
            department: res.data.department || '',
            phone: res.data.phoneNumber || '',
            role: res.data.role,
            avatar: res.data.profileImageUrl || '',
            trustScore: 95,
            badges: ['Verified Student'],
            karmaPoints: 300
          });
        } else {
          // Token present but backend returned nothing — clear session
          setToken(null);
          setUser(null);
        }
      } catch {
        // Token invalid or backend unreachable — clear session
        setToken(null);
        setUser(null);
        setIsBackendOnline(false);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to real-time SignalR notifications & live lost item broadcasts
  useEffect(() => {
    const unsubNotification = signalRService.onReceiveNotification((notif) => {
      notify(`🔔 ${notif.title}: ${notif.message}`, 'info');
    });

    const unsubBroadcast = signalRService.onLostItemBroadcast((broadcast) => {
      notify(`🚨 Campus Alert: New lost '${broadcast.title}' reported near ${broadcast.location}`, 'info');
    });

    return () => {
      unsubNotification();
      unsubBroadcast();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res?.data?.token) {
        setToken(res.data.token);
        const u = res.data.user;
        const loggedUser = {
          id: u.id,
          name: u.fullName,
          email: u.email,
          studentId: u.studentOrStaffId || '',
          department: u.department || '',
          phone: u.phoneNumber || '',
          role: u.role,
          avatar: u.profileImageUrl || '',
          trustScore: 98,
          badges: ['Verified Campus Member'],
          karmaPoints: 420
        };
        setUser(loggedUser);
        setIsBackendOnline(true);
        notify(`Welcome back, ${loggedUser.name}!`);
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server.' };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        studentOrStaffId: formData.studentId,
        department: formData.department,
        phoneNumber: formData.phone,
        role: formData.role || 'User'
      });

      if (res?.data?.token) {
        setToken(res.data.token);
        const u = res.data.user;
        const newUser = {
          id: u.id,
          name: u.fullName,
          email: u.email,
          studentId: u.studentOrStaffId || '',
          department: u.department || '',
          phone: u.phoneNumber || '',
          role: u.role,
          avatar: u.profileImageUrl || '',
          trustScore: 80,
          badges: ['Verified Student'],
          karmaPoints: 100
        };
        setUser(newUser);
        setIsBackendOnline(true);
        notify('Account created successfully! Welcome to CampusFind.');
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server.' };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    notify('Successfully signed out.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isBackendOnline,
      login,
      register,
      logout,
      notification,
      notify
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
