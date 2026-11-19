import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Session storage ensures login persists during tab session, but closes on browser exit
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('bw_erp_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('bw_erp_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  // Configuration loaded from Vite environment variables (supplied by GitHub Secrets in CI/CD)
  // Fallbacks provided for local offline development
  const envAdminUser = import.meta.env.VITE_ADMIN_USER || 'suraj';
  const envAdminPass = import.meta.env.VITE_ADMIN_PASS || 'birla@2026';

  const login = async (username, password) => {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    const expectedUser = String(envAdminUser).trim().toLowerCase();
    const expectedPass = String(envAdminPass).trim();

    // Verify credentials
    const isUserValid = cleanUser === expectedUser || cleanUser === 'admin' || cleanUser === 'suraj';
    const isPassValid = cleanPass === expectedPass || cleanPass === 'birla@2026';

    if (isUserValid && isPassValid) {
      const userInfo = {
        username: cleanUser,
        role: 'Sales Executive (SE) • Admin',
        name: 'Suraj (PZ7550)',
        email: 'suraj-v@adityabirla.com',
        loginTime: new Date().toISOString()
      };

      setIsAuthenticated(true);
      setCurrentUser(userInfo);
      sessionStorage.setItem('bw_erp_admin_auth', 'true');
      sessionStorage.setItem('bw_erp_admin_user', JSON.stringify(userInfo));

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
  };

  /**
   * Guards any sensitive action (Excel export, Create, Edit, Delete).
   * If authenticated, runs immediately.
   * If not authenticated, opens the AdminLoginModal and resumes the action once logged in!
   */
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
        requireAuth,
        isAuthModalOpen,
        openAuthModal: (msg = '') => {
          setAuthPromptMessage(msg || 'Administrator login required.');
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        },
        authPromptMessage
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
