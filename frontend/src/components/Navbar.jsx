import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, Clock, PlusCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function Navbar({ onOpenNewOrder }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-5 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Portal Identity */}
        <div className="flex items-center space-x-3.5">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-1 rounded-lg border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center">
              <img
                src={brandLogo}
                alt="Aditya Birla UltraTech - Birla White"
                className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="hidden lg:block border-l border-slate-200 pl-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
                  Sales & Distribution ERP
                </span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                  HP Territory
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                UltraTech Cement Ltd. • Unit: Birla White
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Time & System Sync Badge */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50 rounded-full text-xs text-slate-600 border border-slate-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-birla-blue" />
            <span className="font-semibold text-slate-700">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} •{' '}
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Live Database Synced"></span>
          </div>

          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Blind Drop-Shipping Engine Active</span>
          </div>
        </div>

        {/* Right: Default User Badge & Quick Action */}
        <div className="flex items-center space-x-3">
          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Book Order</span>
            </button>
          )}

          {/* User Profile Badge: Suraj (PZ7550) */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs border border-slate-800">
              S
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900">Suraj (PZ7550)</span>
                <span className="text-[9px] bg-slate-900 text-white font-extrabold px-1.5 py-0.2 rounded tracking-wider">
                  OFFICER
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5 font-medium">
                <Phone className="w-2.5 h-2.5 text-slate-400" />
                <span>8219796922</span>
                <span className="text-slate-300">•</span>
                <span className="text-birla-blue">Mandi HQ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
