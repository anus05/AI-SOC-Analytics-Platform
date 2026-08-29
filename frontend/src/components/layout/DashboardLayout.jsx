import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased select-none pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container Area */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Responsive Sidebar (desktop left sidebar, mobile bottom-nav is handled inside) */}
        <Sidebar />

        {/* Content Canvas */}
        <main className="flex-1 w-full p-margin-mobile md:p-margin-desktop overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
