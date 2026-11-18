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
  ShieldAlert
} from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { to: '/masters', label: 'Master Directory', icon: Users, badge: 'Stockist & Retailer' },
    { to: '/catalog', label: 'Product Catalogue', icon: Package, badge: '5 Units' },
    { to: '/orders', label: 'Sales & Booking', icon: ShoppingCart, badge: 'Dual-Receipt' },
    { to: '/dispatches', label: 'Dispatches & Splits', icon: Truck, badge: 'Challan' },
    { to: '/ledger', label: 'Ledger & Ageing', icon: CreditCard, badge: 'Due Days' },
    { to: '/analytics', label: 'BI Performance', icon: BarChart3, badge: 'Quarterly' },
    { to: '/pjp', label: 'PJP Beat Planner', icon: CalendarCheck2, badge: 'Field Visits' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800/80 min-h-[calc(100vh-61px)] shadow-lg select-none">
      {/* Top Sidebar Brand Banner */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="bg-white p-2 rounded-xl border border-slate-200/40 shadow-xs flex items-center justify-center">
          <img
            src={brandLogo}
            alt="Aditya Birla UltraTech Birla White"
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="mt-2.5 px-1 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-semibold tracking-wider uppercase">Unit: Birla White</span>
          <span className="text-birla-gold font-bold">PZ7550 • Suraj</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Core ERP Console
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-birla-crimson text-white shadow-md shadow-birla-crimson/25 ring-1 ring-white/10'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight border ${
                    item.badge === 'Due Days'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700/60 group-hover:border-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Territory & Regional Officer Footer Box */}
      <div className="p-3 m-3 bg-slate-950/60 rounded-xl border border-slate-800/90 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Territory Node
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-200">Himachal Pradesh Operations</p>
          <p className="text-[10px] text-slate-400">Mandi • Sundernagar • Joginder Nagar</p>
        </div>
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">Enterprise v2.0</span>
          <span className="text-emerald-400 font-bold">● Active 100%</span>
        </div>
      </div>
    </aside>
  );
}
