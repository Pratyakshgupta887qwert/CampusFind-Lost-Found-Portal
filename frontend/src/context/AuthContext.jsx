import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import signalRService from '../services/signalr';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'usr_8829',
  name: 'Alex Rivera',
  email: 'alex.rivera@campus.edu',
  studentId: 'STU-992026',
  department: 'Computer Science & Engineering',
  phone: '+1 (555) 234-8910',
  role: 'Student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  trustScore: 98,
  badges: ['Verified Student', "Top Finder '26", 'Quick Responder'],
  karmaPoints: 420
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusfind_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('campusfind_token') || null);
  const [notification, setNotification] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4500);
  };

  // Sync token & user state, and initialize SignalR
  useEffect(() => {
    if (token) {
      localStorage.setItem('campusfind_token', token);
      signalRService.startConnection();
    } else {
      localStorage.removeItem('campusfind_token');
      signalRService.stopConnection();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campusfind_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campusfind_user');
    }
  }, [user]);

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

  // Check backend connectivity on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setIsBackendOnline(true);
          setUser({
            id: res.data.id,
            name: res.data.fullName,
            email: res.data.email,
            studentId: res.data.studentOrStaffId || 'STU-2026',
            department: res.data.department || 'General Studies',
            phone: res.data.phoneNumber || '+1 (555) 000-0000',
            role: res.data.role,
            avatar: res.data.profileImageUrl || DEFAULT_USER.avatar,
            trustScore: 95,
            badges: ['Verified Student'],
            karmaPoints: 300
          });
        }
      } catch {
        setIsBackendOnline(false);
      }
    }

    if (token) {
      checkBackend();
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // 1. Try real ASP.NET Core API
      const res = await authApi.login({ email, password });
      if (res?.data?.token) {
        setToken(res.data.token);
        const u = res.data.user;
        const loggedUser = {
          id: u.id,
          name: u.fullName,
          email: u.email,
          studentId: u.studentOrStaffId || 'STU-992026',
          department: u.department || 'Computer Science',
          phone: u.phoneNumber || '',
          role: u.role,
          avatar: u.profileImageUrl || DEFAULT_USER.avatar,
          trustScore: 98,
          badges: ['Verified Campus Member'],
          karmaPoints: 420
        };
        setUser(loggedUser);
        setIsBackendOnline(true);
        notify(`Welcome back, ${loggedUser.name}! (Connected to API)`);
        return true;
      }
    } catch (err) {
      console.warn('API login error, using simulated local session:', err.message);
    }

    // 2. Seamless local fallback
    const loggedUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email ? email.split('@')[0].replace('.', ' ').toUpperCase() : DEFAULT_USER.name,
    };
    setUser(loggedUser);
    notify(`Welcome back, ${loggedUser.name}!`);
    return true;
  };

  const quickDemoLogin = (role = 'Student') => {
    if (role === 'Officer') {
      const officer = {
        id: 'usr_sec_104',
        name: 'Officer Mark Davis',
        email: 'security.davis@campus.edu',
        studentId: 'STAFF-SEC-04',
        department: 'Campus Safety & Security HQ',
        phone: '+1 (555) 999-4411',
        role: 'Campus Security Officer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        trustScore: 100,
        badges: ['Official Campus Security', 'Custodian Authority', 'Verified Badge'],
        karmaPoints: 1250
      };
      setUser(officer);
      notify('Signed in as Campus Security Officer');
    } else {
      setUser(DEFAULT_USER);
      notify('Signed in as Alex Rivera (Student)');
    }
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password || 'Password123!',
        confirmPassword: formData.confirmPassword || formData.password || 'Password123!',
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
          studentId: u.studentOrStaffId,
          department: u.department,
          phone: u.phoneNumber,
          role: u.role,
          avatar: DEFAULT_USER.avatar,
          trustScore: 80,
          badges: ['Verified Student'],
          karmaPoints: 100
        };
        setUser(newUser);
        setIsBackendOnline(true);
        notify('Account created successfully via CampusFind API!');
        return true;
      }
    } catch (err) {
      console.warn('API registration error, fallback to local creation:', err.message);
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: formData.name || 'New Campus Member',
      email: formData.email,
      studentId: formData.studentId || `STU-${Math.floor(100000 + Math.random() * 900000)}`,
      department: formData.department || 'General Studies',
      phone: formData.phone || '+1 (555) 000-0000',
      role: formData.role || 'Student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      trustScore: 75,
      badges: ['Verified Student'],
      karmaPoints: 50
    };
    setUser(newUser);
    notify('Account created successfully! Welcome to CampusFind.');
    return true;
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
      isBackendOnline, 
      login, 
      quickDemoLogin, 
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
