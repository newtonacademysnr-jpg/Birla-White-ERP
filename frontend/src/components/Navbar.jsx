import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoSvg from '../assets/birlaabg.svg';

export default function Navbar({ onOpenNewOrder }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logoSvg}
              alt="Aditya Birla - Birla White"
              className="h-10 object-contain transition-transform group-hover:scale-102"
            />
            <div className="hidden lg:block border-l border-slate-200 pl-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-birla-crimson block leading-tight">
                Sales & Distribution ERP
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                UltraTech Cement Ltd. - Unit Birla White
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Time & System Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-birla-blue" />
          <span className="font-medium">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} •{' '}
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="PostgreSQL Live"></span>
        </div>

        {/* Right: Default User Badge & Quick Action */}
        <div className="flex items-center space-x-3">
          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-1.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </button>
          )}

          {/* User Profile Badge: Suraj (PZ7550) */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-birla-crimson/10 text-birla-crimson font-extrabold text-xs flex items-center justify-center border border-birla-crimson/20">
              S
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-slate-900">Suraj (PZ7550)</span>
                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 py-0.2 rounded">SO</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                <Phone className="w-2.5 h-2.5 text-slate-400" />
                <span>8219796922</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
