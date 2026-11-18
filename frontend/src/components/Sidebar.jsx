import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  CreditCard,
  BarChart3,
  CalendarCheck2,
  X,
  MapPin,
  Building2,
  ShieldCheck
} from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { to: '/masters', label: 'Master Directory', icon: Users, badge: 'Dealers' },
    { to: '/catalog', label: 'Product Catalogue', icon: Package, badge: 'SKUs' },
    { to: '/orders', label: 'Sales & Booking', icon: ShoppingCart, badge: 'Dual-Bill' },
    { to: '/dispatches', label: 'Dispatches & Splits', icon: Truck, badge: 'Challan' },
    { to: '/ledger', label: 'Ledger & Ageing', icon: CreditCard, badge: 'Due' },
    { to: '/analytics', label: 'BI & Analytics Hub', icon: BarChart3, badge: 'BI Hub' },
    { to: '/pjp', label: 'PJP Beat Planner', icon: CalendarCheck2, badge: 'Field Beat' }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Top Brand Logo Banner */}
      <div className="p-4 border-b border-amber-950/40">
        <div className="flex items-center justify-between">
          <div className="bg-white p-2 rounded-xl shadow-xs border border-amber-300/40 flex items-center justify-center flex-1">
            <img
              src={brandLogo}
              alt="Aditya Birla UltraTech Birla White"
              className="h-10 w-auto object-contain"
            />
          </div>
          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden ml-3 p-2 text-stone-400 hover:text-white rounded-xl bg-birlaRed-950/80 border border-amber-900/40"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-2.5 px-1 flex items-center justify-between text-[10px]">
          <span className="text-amber-200/70 font-semibold tracking-wider uppercase">Unit: Birla White</span>
          <span className="text-amber-400 font-bold">Suraj (PZ7550)</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-amber-300/60">
          Command Center
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                  isActive
                    ? 'bg-birlaRed-800 text-white font-bold shadow-md shadow-birlaRed-900/50 ring-1 ring-amber-400/40'
                    : 'text-stone-300 hover:bg-birlaRed-950/80 hover:text-amber-200 font-medium'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 text-amber-400/80 group-hover:text-amber-300" />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight border bg-birlaRed-950/60 text-amber-300/90 border-amber-900/40 group-hover:border-amber-700/60"
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Territory Node Footer Box */}
      <div className="p-3 m-3 bg-[#130709] rounded-xl border border-amber-950/50 text-xs text-stone-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/80">
            Territory Node
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950 animate-pulse"></span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-amber-100">Himachal Pradesh Operations</p>
          <p className="text-[10px] text-stone-400">Mandi • Sundernagar • Balh</p>
        </div>
        <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between text-[10px]">
          <span className="text-stone-400">Heritage Red & Cream</span>
          <span className="text-emerald-400 font-bold">● Active 100%</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Static/Fixed on lg+) */}
      <aside className="hidden lg:flex w-64 bg-[#1A0B0E] text-stone-300 flex-col flex-shrink-0 border-r border-amber-950/50 min-h-[calc(100vh-61px)] shadow-xl">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE OFF-CANVAS SLIDE-OVER DRAWER (< lg) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          ></div>

          {/* Sliding Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-[#1A0B0E] text-stone-300 shadow-2xl z-10 animate-in slide-in-from-left duration-300 flex flex-col h-full border-r border-amber-900/50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
