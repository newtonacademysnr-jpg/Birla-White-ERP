import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check existing session on application mount
  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'X-Requested-With': 'BirlaWhiteERP'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (mounted && data.authenticated && data.user) {
            setIsAuthenticated(true);
            setCurrentUser(data.user);
            setIsGuestMode(false);
            setIsCheckingSession(false);
            return;
          }
        }
      } catch (e) {
        // API server offline or running in standalone static GitHub Pages mode
      }

      // Check if user has an active guest sandbox session
      if (mounted) {
        try {
          const isGuest =
            sessionStorage.getItem('bw_erp_is_guest') === 'true' ||
            localStorage.getItem('bw_erp_is_guest') === 'true';
          const storedUser =
            sessionStorage.getItem('bw_erp_guest_user') ||
            localStorage.getItem('bw_erp_guest_user');

          if (isGuest && storedUser) {
            setIsAuthenticated(true);
            setCurrentUser(JSON.parse(storedUser));
            setIsGuestMode(true);
          }
        } catch (e) {}
        setIsCheckingSession(false);
      }
    }

    verifySession();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Secure Sign-In Handler
   * Connects to backend /api/auth/login with bcrypt validation and HttpOnly JWT cookies.
   * If running offline/static demo, supports user-created sandbox passcode with blank isolated data.
   */
  const login = async (username, password, rememberMe = true) => {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanPass) {
      return { success: false, error: 'Password is required' };
    }

    // 1. Attempt secure backend authentication
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'BirlaWhiteERP'
        },
        credentials: 'include',
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setIsGuestMode(false);
          setIsAuthModalOpen(false);

          if (pendingAction && typeof pendingAction === 'function') {
            const actionToRun = pendingAction;
            setPendingAction(null);
            setTimeout(() => actionToRun(), 100);
          }
          return { success: true, isGuest: false };
        }
      } else if (res.status === 401 || res.status === 400 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errData.error || errData.message || 'Invalid administrator credentials.'
        };
      }
    } catch (e) {
      // Backend is unreachable (e.g. static GitHub Pages demo environment)
    }

    // 2. Fallback for Static Host / Reviewer Sandbox Mode
    // Reviewer can activate their own custom passcode in the Help drawer
    const localCustomPass = (localStorage.getItem('bw_erp_custom_pass') || '').trim();
    if (localCustomPass && cleanPass === localCustomPass) {
      const guestInfo = {
        username: cleanUser || 'guest',
        role: 'Guest / Demo Sandbox',
        name: cleanUser ? cleanUser.toUpperCase() : 'Guest Reviewer',
        email: 'sandbox@internal-demo.erp',
        loginTime: new Date().toISOString(),
        isGuest: true
      };

      setIsAuthenticated(true);
      setCurrentUser(guestInfo);
      setIsGuestMode(true);

      sessionStorage.setItem('bw_erp_is_guest', 'true');
      sessionStorage.setItem('bw_erp_guest_user', JSON.stringify(guestInfo));

      if (rememberMe) {
        localStorage.setItem('bw_erp_is_guest', 'true');
        localStorage.setItem('bw_erp_guest_user', JSON.stringify(guestInfo));
      }

      setIsAuthModalOpen(false);

      if (pendingAction && typeof pendingAction === 'function') {
        const actionToRun = pendingAction;
        setPendingAction(null);
        setTimeout(() => actionToRun(), 100);
      }
      return { success: true, isGuest: true };
    }

    return {
      success: false,
      error: 'Invalid Administrator credentials. Please verify your username and password.'
    };
  };

  /**
   * Secure Sign-Out Handler
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'BirlaWhiteERP' },
        credentials: 'include'
      });
    } catch (e) {}

    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsGuestMode(false);

    sessionStorage.removeItem('bw_erp_is_guest');
    sessionStorage.removeItem('bw_erp_guest_user');
    localStorage.removeItem('bw_erp_is_guest');
    localStorage.removeItem('bw_erp_guest_user');
  };

  /**
   * Save custom sandbox secret for reviewers on static host
   */
  const saveCustomSecret = (secret) => {
    if (secret && secret.trim()) {
      const cleanSecret = secret.trim();
      localStorage.setItem('bw_erp_custom_pass', cleanSecret);
      localStorage.setItem('bw_erp_is_guest', 'true');
      sessionStorage.setItem('bw_erp_is_guest', 'true');
      setIsGuestMode(true);

      // Reset guest isolated storage so reviewers start with a blank workspace
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
        isCheckingSession,
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
