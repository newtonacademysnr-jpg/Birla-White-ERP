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

  // Determines whether the current session is an isolated Guest / Blank Data session
  const [isGuestMode, setIsGuestMode] = useState(() => {
    try {
      return (
        sessionStorage.getItem('bw_erp_is_guest') === 'true' ||
        localStorage.getItem('bw_erp_is_guest') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  // Configuration loaded from Vite environment variables (supplied by GitHub Secrets in CI/CD)
  const envAdminUser = (import.meta.env.VITE_ADMIN_USER || 'suraj').trim();
  const envAdminPass = (import.meta.env.VITE_ADMIN_PASS || 'birla@2026').trim();

  const login = async (username, password, rememberMe = true) => {
    // Normalization for mobile & desktop keyboards (trim whitespace, lowercase)
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const cleanPassLower = cleanPass.toLowerCase();

    const expectedUser = String(envAdminUser).trim().toLowerCase();
    const expectedPass = String(envAdminPass).trim();
    const expectedPassLower = expectedPass.toLowerCase();

    // Custom locally saved passkey if someone created one in Help section
    const localCustomPass = (localStorage.getItem('bw_erp_custom_pass') || '').trim();
    const localCustomPassLower = localCustomPass.toLowerCase();

    // Official Real Officer Passwords (full access to real production business data)
    const officialAdminPasswords = [
      expectedPass,
      'birla@2026',
      'birla2026',
      'pz7550',
      'PZ7550',
      '8219796922',
      'suraj',
      'suraj@2026',
      'suraj123',
      'admin',
      'admin123'
    ].filter(Boolean);

    const isOfficialPassValid =
      cleanPass === expectedPass ||
      cleanPassLower === expectedPassLower ||
      officialAdminPasswords.some(
        (p) => p === cleanPass || p.toLowerCase() === cleanPassLower
      );

    // Custom / Guest Passcode (set via Help section by external reviewer)
    const isCustomPassValid =
      localCustomPass &&
      (cleanPass === localCustomPass || cleanPassLower === localCustomPassLower);

    if (isOfficialPassValid) {
      // 1. OFFICIAL ADMINISTRATOR / OFFICER (Suraj) -> Real Data Mode
      const userInfo = {
        username: cleanUser || 'suraj',
        role: 'Sales Executive (SE) • Admin',
        name: 'Suraj (PZ7550)',
        email: 'suraj-v@adityabirla.com',
        loginTime: new Date().toISOString(),
        isGuest: false
      };

      setIsAuthenticated(true);
      setCurrentUser(userInfo);
      setIsGuestMode(false);

      sessionStorage.setItem('bw_erp_admin_auth', 'true');
      sessionStorage.setItem('bw_erp_admin_user', JSON.stringify(userInfo));
      sessionStorage.setItem('bw_erp_is_guest', 'false');

      if (rememberMe) {
        localStorage.setItem('bw_erp_admin_auth', 'true');
        localStorage.setItem('bw_erp_admin_user', JSON.stringify(userInfo));
        localStorage.setItem('bw_erp_is_guest', 'false');
      }

      setIsAuthModalOpen(false);

      if (pendingAction && typeof pendingAction === 'function') {
        const actionToRun = pendingAction;
        setPendingAction(null);
        setTimeout(() => actionToRun(), 100);
      }
      return { success: true, isGuest: false };
    } else if (isCustomPassValid) {
      // 2. GUEST / DEMO SESSION (Set via Help) -> Blank Data Mode for privacy & security
      const guestInfo = {
        username: cleanUser || 'guest',
        role: 'Guest / Demo Sandbox',
        name: cleanUser ? cleanUser.toUpperCase() : 'Guest User',
        email: 'guest@internal-demo.erp',
        loginTime: new Date().toISOString(),
        isGuest: true
      };

      setIsAuthenticated(true);
      setCurrentUser(guestInfo);
      setIsGuestMode(true);

      sessionStorage.setItem('bw_erp_admin_auth', 'true');
      sessionStorage.setItem('bw_erp_admin_user', JSON.stringify(guestInfo));
      sessionStorage.setItem('bw_erp_is_guest', 'true');

      if (rememberMe) {
        localStorage.setItem('bw_erp_admin_auth', 'true');
        localStorage.setItem('bw_erp_admin_user', JSON.stringify(guestInfo));
        localStorage.setItem('bw_erp_is_guest', 'true');
      }

      setIsAuthModalOpen(false);

      if (pendingAction && typeof pendingAction === 'function') {
        const actionToRun = pendingAction;
        setPendingAction(null);
        setTimeout(() => actionToRun(), 100);
      }
      return { success: true, isGuest: true };
    } else {
      return {
        success: false,
        error: 'Invalid Administrator passcode. Please verify your credentials.'
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsGuestMode(false);
    sessionStorage.removeItem('bw_erp_admin_auth');
    sessionStorage.removeItem('bw_erp_admin_user');
    sessionStorage.removeItem('bw_erp_is_guest');
    localStorage.removeItem('bw_erp_admin_auth');
    localStorage.removeItem('bw_erp_admin_user');
    localStorage.removeItem('bw_erp_is_guest');
  };

  // Called when someone sets a custom password from the Help drawer
  const saveCustomSecret = (secret) => {
    if (secret && secret.trim()) {
      const cleanSecret = secret.trim();
      localStorage.setItem('bw_erp_custom_pass', cleanSecret);
      localStorage.setItem('bw_erp_is_guest', 'true');
      sessionStorage.setItem('bw_erp_is_guest', 'true');
      setIsGuestMode(true);

      // Reset guest isolated storage so they begin with a 100% blank workspace
      try {
        localStorage.removeItem('bw_guest_orders');
        localStorage.removeItem('bw_guest_payments');
        localStorage.removeItem('bw_guest_retailers');
        localStorage.removeItem('bw_guest_stockists');
        localStorage.removeItem('PJP_GUEST_DB');
      } catch (e) {}

      return true;
    }
    return false;
  };

  const requireAuth = (
    actionCallback,
    message = 'Administrator login required to perform this action.'
  ) => {
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
        isGuestMode,
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
