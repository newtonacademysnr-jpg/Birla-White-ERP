import React, { useState, useEffect } from 'react';
import { Phone, Clock, PlusCircle, ShieldCheck, Menu, X, Lock, Unlock, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenNewOrder, onToggleMobileMenu, mobileMenuOpen }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isAuthenticated, currentUser, logout, openAuthModal, requireAuth } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#EEDFB8] sticky top-0 z-40 shadow-[0_2px_8px_rgba(158,27,34,0.04)]">
      {/* Top Heritage Red Ribbon Line */}
      <div className="h-1 bg-gradient-to-r from-birlaRed-900 via-birlaRed-700 via-amber-500 to-birlaRed-900"></div>

      <div className="px-3 sm:px-5 lg:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Mobile Hamburger & Brand Logo */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:text-birlaRed-800 hover:bg-[#FAF6E8] border border-[#EEDFB8] transition-all"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-birlaRed-800" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="bg-white p-1 rounded-xl border border-[#EEDFB8] shadow-xs hover:border-birlaRed-700 hover:shadow-md transition-all flex items-center">
              <img
                src={brandLogo}
                alt="Aditya Birla UltraTech & Birla White"
                className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="hidden sm:block border-l border-[#EEDFB8] pl-2.5 sm:pl-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-display text-xs font-black tracking-tight text-birlaRed-900 uppercase">
                  Sales & Distribution ERP
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full">
                  HP Mandi
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium block">
                UltraTech Cement Ltd. • Unit: Birla White
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Time & Blind Drop-Shipping (Desktop only) */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-[#FAF6E8] rounded-full text-xs text-stone-700 border border-[#EEDFB8] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-birlaRed-700" />
            <span className="font-medium text-stone-800 font-mono text-[11px]">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} •{' '}
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse ml-0.5" title="Live Database Synced"></span>
          </div>

          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Blind Drop-Shipping Active</span>
          </div>
        </div>

        {/* Right: Quick Action, Admin Auth & Officer Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Admin Auth Toggle Button */}
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal('Enter Administrator credentials to unlock order booking, Excel exports, and edit privileges.')}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-400/50 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
              title="Click to Login as Administrator"
            >
              <Lock className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-300 hover:border-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-2xs cursor-pointer"
              title="Logout from Administrator Session"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500 hover:text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {onOpenNewOrder && (
            <button
              onClick={() => requireAuth(onOpenNewOrder, 'Admin login required to book and create new sales orders.')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-birlaRed-800 to-birlaRed-900 hover:from-birlaRed-700 hover:to-birlaRed-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:shadow-birlaRed-800/20 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ Book Order</span>
              <span className="xs:hidden">+ Order</span>
            </button>
          )}

          {/* User Profile Badge: Suraj (PZ7550) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 pl-2 sm:pl-3 border-l border-[#EEDFB8]">
            <div className="relative">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-br from-birlaRed-950 to-stone-900 text-amber-300 font-display font-black text-xs flex items-center justify-center shadow-xs border border-amber-500/40">
                S
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 sm:w-3 h-2.5 sm:h-3 border-2 border-white rounded-full ${
                  isAuthenticated ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={isAuthenticated ? 'Admin Authenticated' : 'Guest Read-Only'}
              ></span>
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="flex items-center space-x-1">
                <span className="font-display font-bold text-stone-900 text-xs sm:text-sm">Suraj</span>
                <span className="text-[9px] bg-birlaRed-900 text-amber-300 font-extrabold px-1.5 py-0.2 rounded tracking-wider">
                  SE
                </span>
                {!isAuthenticated && (
                  <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1 rounded hidden md:inline">
                    Read-Only
                  </span>
                )}
              </div>
              <div className="text-[10px] text-stone-500 flex items-center space-x-1 mt-0.5 font-medium">
                <Phone className="w-2.5 h-2.5 text-stone-400 hidden sm:inline" />
                <span className="hidden sm:inline">8219796922</span>
                <span className="hidden sm:inline text-stone-300">•</span>
                <span className="text-birlaRed-800 font-bold">Mandi HQ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
