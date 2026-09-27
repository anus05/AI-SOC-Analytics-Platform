import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-on-background flex flex-col antialiased select-none pb-16 md:pb-0 relative overflow-x-hidden">
      {/* Ambient background glowing gradient blobs for Glassmorphism backdrop-blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-radial from-teal-500/10 via-cyan-600/5 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute top-[35%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-radial from-indigo-500/10 via-slate-800/5 to-transparent blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full bg-radial from-cyan-500/8 via-teal-900/5 to-transparent blur-3xl opacity-50"></div>
      </div>

      {/* Top Navbar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Main Container Area */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto relative z-10">
        {/* Responsive Sidebar (desktop left sidebar, mobile bottom-nav is handled inside) */}
        <Sidebar />

        {/* Content Canvas */}
        <main className="flex-1 w-full p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

