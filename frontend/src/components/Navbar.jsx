import React, { useState, useEffect } from 'react';
import { Phone, Clock, PlusCircle, ShieldCheck, Sparkles, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function Navbar({ onOpenNewOrder }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Portal Identity */}
        <div className="flex items-center space-x-3.5">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center">
              <img
                src={brandLogo}
                alt="Aditya Birla UltraTech & Birla White"
                className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <div className="flex items-center space-x-2">
                <span className="font-display text-xs font-extrabold tracking-tight text-slate-900 uppercase">
                  Enterprise Sales ERP
                </span>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  HP Mandi Division
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                UltraTech Cement Ltd. • Unit: Birla White
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Time & Engine Sync Pill */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50/90 rounded-full text-xs text-slate-600 border border-slate-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-700 font-mono text-[11px]">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} •{' '}
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse ml-0.5" title="Live Database Synced"></span>
          </div>

          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Blind Drop-Shipping Compliant</span>
          </div>
        </div>

        {/* Right: Quick Action & Officer Profile Badge */}
        <div className="flex items-center space-x-3">
          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Book Order</span>
            </button>
          )}

          {/* User Profile Badge: Suraj (PZ7550) */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-display font-black text-xs flex items-center justify-center shadow-sm border border-slate-700">
                S
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-slate-900">Suraj (PZ7550)</span>
                <span className="text-[9px] bg-slate-900 text-amber-300 font-extrabold px-1.5 py-0.2 rounded-md tracking-wider">
                  TSO
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5 font-medium">
                <Phone className="w-2.5 h-2.5 text-slate-400" />
                <span>8219796922</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600 font-semibold">Mandi HQ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
