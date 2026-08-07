import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../../routes/ProtectedRoute';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-brand-500 selection:text-white">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Central Main View */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <main className="flex-1 px-4 py-8 md:px-8 bg-slate-950/90 relative">
              {/* Blur decorators */}
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

              <div className="max-w-5xl mx-auto w-full">
                <Outlet />
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
