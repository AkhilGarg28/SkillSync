import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AnnouncementBanner from '../AnnouncementBanner';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-brand-500 selection:text-white">
      {/* Platform Announcement Banner */}
      <AnnouncementBanner />

      {/* Header Navigation */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Panel */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-slate-950/90 relative">
          {/* Decorative gradients */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

          {/* Child routes */}
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
