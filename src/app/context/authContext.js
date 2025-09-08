'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = typeof window !== 'undefined' && localStorage.getItem('studentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (dataFromAPI) => {
    try {
      const fullUser = {
        token: dataFromAPI.token,
        user: dataFromAPI.user,
        student: {
          id: dataFromAPI.student?.id || '',
          first_name: dataFromAPI.student?.first_name || '',
          last_name: dataFromAPI.student?.last_name || '',
          email: dataFromAPI.student?.email || '',
          phone: dataFromAPI.student?.phone || '',
          nationality: dataFromAPI.student?.nationality || '',
          gender: dataFromAPI.student?.gender || '',
          city: dataFromAPI.student?.city || '',
          program_type: dataFromAPI.student?.program_type || '',
        },
      };

      setUser(fullUser);
      localStorage.setItem('studentUser', JSON.stringify(fullUser));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('studentUser');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateStudent = (updatedStudent) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, student: { ...prev.student, ...updatedStudent } };
      localStorage.setItem('studentUser', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
