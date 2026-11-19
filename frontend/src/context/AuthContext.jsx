import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Check both sessionStorage and localStorage (for Remember Me)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return (
        sessionStorage.getItem('bw_erp_admin_auth') === 'true' ||
        localStorage.getItem('bw_erp_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored =
        sessionStorage.getItem('bw_erp_admin_user') ||
        localStorage.getItem('bw_erp_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  // Configuration loaded from Vite environment variables (supplied by GitHub Secrets in CI/CD)
  const envAdminUser = (import.meta.env.VITE_ADMIN_USER || 'suraj').trim();
  const envAdminPass = (import.meta.env.VITE_ADMIN_PASS || 'birla@2026').trim();

  const login = async (username, password, rememberMe = true) => {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    const expectedUser = String(envAdminUser).trim().toLowerCase();
    const expectedPass = String(envAdminPass).trim();

    // Custom locally saved passkey if user set one
    const localCustomPass = (localStorage.getItem('bw_erp_custom_pass') || '').trim();

    // Accepted usernames
    const validUsers = [
      expectedUser,
      'suraj',
      'pz7550',
      'suraj (pz7550)',
      'admin',
      'administrator',
      'se',
      'sales'
    ];

    // Accepted passwords: supports GitHub Secret, corporate defaults, officer code, and phone
    const validPasswords = [
      expectedPass,
      'birla@2026',
      'birla2026',
      'admin',
      'admin123',
      'suraj',
      'suraj@2026',
      'suraj123',
      'pz7550',
      'PZ7550',
      '8219796922',
      localCustomPass
    ].filter(Boolean);

    // Any matching username or any non-empty name with valid password
    const isUserValid = validUsers.includes(cleanUser) || cleanUser.length > 0;
    const isPassValid = validPasswords.includes(cleanPass) || cleanPass === expectedPass;

    if (isUserValid && isPassValid) {
      const userInfo = {
        username: cleanUser || 'suraj',
        role: 'Sales Executive (SE) • Admin',
        name: 'Suraj (PZ7550)',
        email: 'suraj-v@adityabirla.com',
        loginTime: new Date().toISOString()
      };

      setIsAuthenticated(true);
      setCurrentUser(userInfo);

      sessionStorage.setItem('bw_erp_admin_auth', 'true');
      sessionStorage.setItem('bw_erp_admin_user', JSON.stringify(userInfo));

      if (rememberMe) {
        localStorage.setItem('bw_erp_admin_auth', 'true');
        localStorage.setItem('bw_erp_admin_user', JSON.stringify(userInfo));
      }

      setIsAuthModalOpen(false);

      // Execute pending action if any was queued
      if (pendingAction && typeof pendingAction === 'function') {
        const actionToRun = pendingAction;
        setPendingAction(null);
        setTimeout(() => actionToRun(), 100);
      }
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid Administrator credentials. Please verify username and password.'
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('bw_erp_admin_auth');
    sessionStorage.removeItem('bw_erp_admin_user');
    localStorage.removeItem('bw_erp_admin_auth');
    localStorage.removeItem('bw_erp_admin_user');
  };

  const saveCustomSecret = (secret) => {
    if (secret && secret.trim()) {
      localStorage.setItem('bw_erp_custom_pass', secret.trim());
      return true;
    }
    return false;
  };

  const requireAuth = (actionCallback, message = 'Administrator login required to perform this action.') => {
    if (isAuthenticated) {
      if (actionCallback && typeof actionCallback === 'function') {
        actionCallback();
      }
      return true;
    } else {
      setAuthPromptMessage(message);
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        saveCustomSecret,
        requireAuth,
        isAuthModalOpen,
        openAuthModal: (message = '') => {
          setAuthPromptMessage(message || 'Administrator login required.');
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        },
        authPromptMessage,
        envAdminUser,
        hasCustomPass: !!localStorage.getItem('bw_erp_custom_pass')
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
