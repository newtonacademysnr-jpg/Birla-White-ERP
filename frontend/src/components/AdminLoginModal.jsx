import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function AdminLoginModal() {
  const { isAuthModalOpen, closeAuthModal, login, authPromptMessage } = useAuth();
  const [username, setUsername] = useState('suraj');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed.');
      } else {
        setPassword('');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF6E8] rounded-2xl max-w-md w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1A0B0E] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-amber-100">
                ADMINISTRATOR AUTHENTICATION
              </h3>
              <p className="text-[10px] text-stone-400">
                UltraTech Cement Ltd. • Birla White ERP Security
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="p-4 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-950 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-birlaRed-800 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[11px] text-birlaRed-950">
              {authPromptMessage || 'Protected Action Required'}
            </p>
            <p className="text-[10px] text-stone-600 mt-0.5 leading-relaxed">
              To prevent unauthorized changes on this public portal, Excel downloads, order bookings, edits, and deletions require administrator credentials.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Admin Username / Officer ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. suraj or admin"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C496] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-birlaRed-800 shadow-2xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C496] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-birlaRed-800 shadow-2xs pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Configured via GitHub Secrets (<code className="text-birlaRed-900 font-semibold">ADMIN_PASSWORD</code>).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={closeAuthModal}
              className="px-4 py-2 text-xs font-bold text-stone-700 bg-white border border-[#D9C496] rounded-xl hover:bg-stone-50 transition-all cursor-pointer"
            >
              Cancel (Read-Only)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-birlaRed-800 hover:bg-birlaRed-700 disabled:opacity-75 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Unlock Admin Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
