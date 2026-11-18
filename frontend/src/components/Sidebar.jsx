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
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function Sidebar() {
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

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800/70 min-h-[calc(100vh-61px)] shadow-xl select-none">
      {/* Brand Card at top */}
      <div className="p-3.5 border-b border-slate-800/80">
        <div className="bg-white p-2 rounded-xl shadow-xs flex items-center justify-center">
          <img
            src={brandLogo}
            alt="Aditya Birla UltraTech Birla White"
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="mt-2 px-1 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-semibold tracking-wider uppercase">Unit: Birla White</span>
          <span className="text-amber-400 font-bold">PZ7550 • Suraj</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Command Center
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight border bg-slate-800/80 text-slate-300 border-slate-700/60 group-hover:border-slate-600"
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Territory Node Footer Box */}
      <div className="p-3 m-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Territory Node
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950 animate-pulse"></span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-200">Himachal Pradesh Operations</p>
          <p className="text-[10px] text-slate-400">Mandi • Sundernagar • Balh</p>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Enterprise BI v2.5</span>
          <span className="text-emerald-400 font-bold">● Active 100%</span>
        </div>
      </div>
    </aside>
  );
}
