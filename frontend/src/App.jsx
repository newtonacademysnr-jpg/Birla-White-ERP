import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

export default function App() {
  const navigate = useNavigate();
  const [openOrderModal, setOpenOrderModal] = useState(false);

  const handleOpenNewOrder = () => {
    navigate('/orders');
    setOpenOrderModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Corporate Navbar */}
      <Navbar onOpenNewOrder={handleOpenNewOrder} />

      <div className="flex flex-1">
        {/* Left ERP Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full overflow-x-hidden">
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
    </div>
  );
}
