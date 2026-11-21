import React, { useState } from 'react';
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MasterManagement from './pages/MasterManagement';
import ProductCatalogue from './pages/ProductCatalogue';
import Orders from './pages/Orders';
import Dispatches from './pages/Dispatches';
import LedgerPayments from './pages/LedgerPayments';
import Analytics from './pages/Analytics';
import PjpModule from './pages/PjpModule';
import LoginPage from './pages/LoginPage';
import AdminLoginModal from './components/AdminLoginModal';
import { useAuth } from './context/AuthContext';
import { LayoutDashboard, ShoppingCart, CalendarCheck2, CreditCard, Menu } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const navigate = useNavigate();
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenNewOrder = () => {
    navigate('/orders');
    setOpenOrderModal(true);
  };

  // While validating server session cookie
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#FAF6E8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-birlaRed-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, display full-screen Login Homepage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAF6E8] flex flex-col text-stone-900 selection:bg-birlaRed-800 selection:text-white">
      {/* Top Corporate Navbar with Red & Cream Theme + Mobile Hamburger */}
      <Navbar
        onOpenNewOrder={handleOpenNewOrder}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex flex-1 relative">
        {/* Left ERP Sidebar (Desktop fixed/static + Mobile Off-Canvas Drawer) */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area (padding adjusted for mobile bottom dock) */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-[1600px] mx-auto w-full overflow-x-hidden pb-24 lg:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard onOpenNewOrder={handleOpenNewOrder} />} />
            <Route path="/masters" element={<MasterManagement />} />
            <Route path="/catalog" element={<ProductCatalogue />} />
            <Route
              path="/orders"
              element={
                <Orders
                  openCreateModalProp={openOrderModal}
                  onCloseCreateModalProp={() => setOpenOrderModal(false)}
                />
              }
            />
            <Route path="/dispatches" element={<Dispatches />} />
            <Route path="/ledger" element={<LedgerPayments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pjp" element={<PjpModule />} />
          </Routes>
        </main>
      </div>

      {/* MOBILE NATIVE BOTTOM DOCK (Visible only on screens < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A0B0E]/95 backdrop-blur-md border-t border-amber-900/40 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold scale-105' : 'text-stone-400 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold scale-105' : 'text-stone-400 hover:text-white'
            }`
          }
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Orders</span>
        </NavLink>

        {/* Fast Action Center Button (+ Book Order) */}
        <button
          onClick={handleOpenNewOrder}
          className="flex flex-col items-center -mt-5 bg-gradient-to-r from-birlaRed-700 to-birlaRed-800 text-white p-2.5 rounded-full shadow-lg border-2 border-amber-300 active:scale-95 transition-transform"
          title="Book New Order"
        >
          <span className="text-xl font-black leading-none">+</span>
        </button>

        <NavLink
          to="/pjp"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-400 font-bold scale-105' : 'text-stone-400 hover:text-white'
            }`
          }
        >
          <CalendarCheck2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">PJP Beat</span>
        </NavLink>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            mobileMenuOpen ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>

      {/* Global Administrator Login Modal */}
      <AdminLoginModal />
    </div>
  );
}
