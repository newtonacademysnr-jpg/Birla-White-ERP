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
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
    { to: '/masters', label: 'Master Management', icon: Users, badge: 'Stockist & Retailer' },
    { to: '/catalog', label: 'Product Catalogue', icon: Package },
    { to: '/orders', label: 'Order Booking', icon: ShoppingCart, badge: 'Dual-Receipt' },
    { to: '/dispatches', label: 'Dispatches & Split', icon: Truck, badge: 'Partial Engine' },
    { to: '/ledger', label: 'Payments & Ledger', icon: CreditCard, badge: 'Live Ageing' },
    { to: '/analytics', label: 'BI Analytics', icon: BarChart3, badge: 'Quarterly' },
    { to: '/pjp', label: 'PJP Beat Plan', icon: CalendarCheck2, badge: 'Visits' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 min-h-[calc(100vh-57px)]">
      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Main ERP Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-birla-crimson text-white shadow-md shadow-birla-crimson/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-slate-800/80 group-hover:bg-slate-700 text-slate-400 group-hover:text-slate-200 px-1.5 py-0.5 rounded-md font-medium border border-slate-700/50">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Territory & Regional Officer Footer Box */}
      <div className="p-4 m-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400">
        <p className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1">
          Territory Office
        </p>
        <p className="text-[11px] text-slate-300">Himachal Pradesh Zone</p>
        <p className="text-[10px] text-slate-500">Mandi • Sundernagar • Balh</p>
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-semibold">● Postgres Connected</span>
          <span className="text-slate-500">v1.0 Pro</span>
        </div>
      </div>
    </aside>
  );
}
