import React from "react";
import DashboardSidebar4 from "@/components/DashboardSidebar4";
import DashboardTopbar4 from "@/components/DashboardTopbar4";
import { motion } from "framer-motion";

const Settings4 = () => (
  <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)' }}>
    <DashboardSidebar4 />
    <div className="flex-1 flex flex-col w-full">
      <DashboardTopbar4 />
      <main className="flex-1 p-4 sm:p-6 md:p-12 w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full">
          <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white border border-violet-400/30 flex flex-col items-center" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <img src="/executive-avatar.png" alt="Profile" className="w-24 h-24 rounded-full border-2 border-violet-400 shadow-md mb-4" />
            <div className="text-xl font-bold mb-2">Jane Doe</div>
            <div className="opacity-80 mb-4">HR Manager</div>
            <button className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition">Edit Profile</button>
          </motion.div>
          <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white border border-violet-400/30" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="text-lg font-bold mb-4">Company Settings</div>
            <div className="mb-2">Company: <span className="font-semibold">AI Hire Inc.</span></div>
            <div className="mb-2">Plan: <span className="font-semibold">Enterprise</span></div>
            <button className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition mt-4">Manage Subscription</button>
          </motion.div>
        </div>
        <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white border border-violet-400/30 mt-8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="text-lg font-bold mb-4">Preferences</div>
          <div className="mb-2">Theme: <span className="font-semibold">Violet/Black</span></div>
          <div className="mb-2">Notifications: <span className="font-semibold">Enabled</span></div>
          <button className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition mt-4">Edit Preferences</button>
        </motion.div>
      </main>
    </div>
  </div>
);

export default Settings4; 