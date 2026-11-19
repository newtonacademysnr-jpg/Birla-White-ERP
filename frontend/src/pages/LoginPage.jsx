import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
  Truck,
  FileSpreadsheet,
  TrendingUp,
  HelpCircle,
  Key,
  Save,
  Check
} from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, saveCustomSecret } = useAuth();

  const [username, setUsername] = useState('suraj');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Troubleshooting / Custom Sandbox Key Panel
  const [showHelp, setShowHelp] = useState(false);
  const [customPassInput, setCustomPassInput] = useState('');
  const [customPassSaved, setCustomPassSaved] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage('Please enter your administrator passcode.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your passcode.');
      }
    } catch (err) {
      setErrorMessage('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('bw_erp_admin_auth');
      localStorage.removeItem('bw_erp_admin_user');
      localStorage.removeItem('bw_erp_is_guest');
      window.location.reload(true);
    } catch (e) {
      window.location.reload();
    }
  };

  const handleSaveCustomPass = () => {
    if (!customPassInput.trim()) return;
    saveCustomSecret(customPassInput.trim());
    setPassword(customPassInput.trim());
    setCustomPassSaved(true);
    setTimeout(() => setCustomPassSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF6E8] flex flex-col justify-between text-stone-900 selection:bg-birlaRed-800 selection:text-white">
      {/* Top Corporate Heritage Bar */}
      <div className="h-1.5 bg-gradient-to-r from-birlaRed-950 via-birlaRed-700 via-amber-500 to-birlaRed-900 shadow-xs"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#EEDFB8] shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center">
            <img
              src={brandLogo}
              alt="Aditya Birla UltraTech & Birla White"
              className="h-12 sm:h-16 md:h-18 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-950 mb-2">
            <ShieldCheck className="w-4 h-4 text-birlaRed-800" />
            <span>ADITYA BIRLA GROUP • ULTRATECH CEMENT LTD.</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-birlaRed-950 uppercase">
            Sales & Distribution ERP
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-1 font-medium">
            Mandi Territory Regional Hub • Himachal Pradesh
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#EEDFB8] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden w-full max-w-md transition-all">
          {/* Card Header with Officer Badge */}
          <div className="bg-gradient-to-r from-birlaRed-950 via-birlaRed-900 to-stone-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-amber-900/40">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-birlaRed-950 font-display font-black text-lg flex items-center justify-center shadow-md border border-amber-200">
                S
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="font-display font-bold text-base text-white">Suraj (PZ7550)</h2>
                  <span className="text-[10px] bg-amber-400 text-birlaRed-950 font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
                    SE
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 font-medium">Sales Executive • HP Mandi</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Protected</span>
              </div>
            </div>
          </div>

          {/* Card Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm p-3 rounded-xl flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Username / Officer ID */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Officer ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. suraj or PZ7550"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6E8]/50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-birlaRed-800 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Passcode / Secret */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Passcode / Admin Secret
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="off"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#FAF6E8]/50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-birlaRed-800 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Link */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-birlaRed-800 rounded border-stone-300 focus:ring-birlaRed-800 focus:ring-offset-0"
                />
                <span>Remember me on this device</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-amber-800 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help / Sandbox</span>
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-birlaRed-800 to-birlaRed-900 hover:from-birlaRed-700 hover:to-birlaRed-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Access ERP Command Center</span>
                </>
              )}
            </button>

            {/* Expandable Help & Privacy Sandbox Panel */}
            {showHelp && (
              <div className="pt-3 border-t border-stone-200 mt-3 space-y-2 text-xs text-stone-600 bg-[#FAF6E8]/80 p-3.5 rounded-xl border border-amber-200">
                <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-birlaRed-800" />
                  <span>Security & Data Confidentiality</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  Only authorized territory officers with official credentials have access to live commercial invoicing and proprietary dealer ledgers.
                </p>

                <div className="pt-2 border-t border-amber-200/60">
                  <span className="block font-bold text-stone-800 text-[11px] mb-1">
                    Create Sandbox Passcode (Blank Data Mode):
                  </span>
                  <p className="text-[10px] text-stone-500 mb-1.5 leading-normal">
                    If you are an external reviewer or testing without credentials, enter a passcode below to create an isolated demo session. You will be provided with a completely blank workspace to test without accessing real sales data.
                  </p>
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      value={customPassInput}
                      onChange={(e) => setCustomPassInput(e.target.value)}
                      placeholder="Enter custom passcode"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomPass}
                      className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-900 text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      {customPassSaved ? <Check className="w-3 h-3 text-emerald-300" /> : <Save className="w-3 h-3" />}
                      <span>Activate</span>
                    </button>
                  </div>
                  {customPassSaved && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                      ✓ Sandbox passcode activated! Sign in above to view your blank workspace.
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">Need to reset device cache?</span>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="text-[10px] text-birlaRed-800 font-bold hover:underline cursor-pointer"
                  >
                    🔄 Clear Cache & Reload
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ERP Features Showcase Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 w-full max-w-3xl">
          <div className="bg-white/80 p-3 sm:p-3.5 rounded-xl border border-[#EEDFB8] shadow-xs text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-birlaRed-50 border border-birlaRed-200 flex items-center justify-center text-birlaRed-800 mb-1.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Orders & Invoicing</h4>
            <p className="text-[10px] text-stone-500 mt-0.5">GST 18% inclusive billings</p>
          </div>

          <div className="bg-white/80 p-3 sm:p-3.5 rounded-xl border border-[#EEDFB8] shadow-xs text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-1.5">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Dispatches & Splits</h4>
            <p className="text-[10px] text-stone-500 mt-0.5">Blind drop & PDF challans</p>
          </div>

          <div className="bg-white/80 p-3 sm:p-3.5 rounded-xl border border-[#EEDFB8] shadow-xs text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-1.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Ledger & Aging</h4>
            <p className="text-[10px] text-stone-500 mt-0.5">FIFO credit & payment receipts</p>
          </div>

          <div className="bg-white/80 p-3 sm:p-3.5 rounded-xl border border-[#EEDFB8] shadow-xs text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800 mb-1.5">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">PJP Beat Planner</h4>
            <p className="text-[10px] text-stone-500 mt-0.5">Himachal market tour plans</p>
          </div>
        </div>
      </div>

      {/* Corporate Security Footer */}
      <footer className="border-t border-[#EEDFB8] bg-[#FFFDF7] py-3 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>© 2026 UltraTech Cement Ltd. • Unit: Birla White. All Rights Reserved.</span>
          <span className="font-semibold text-birlaRed-900">Authorized Territory Personnel Only • Internal ERP</span>
        </div>
      </footer>
    </div>
  );
}
