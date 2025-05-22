import React from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

const DashboardTopbar4 = () => {
  return (
    <motion.header className="w-full flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-lg border-b border-violet-400/30" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex-1">
        <input type="text" placeholder="Search..." className="w-full max-w-xs px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>
      <div className="flex items-center gap-6 ml-6">
        <button className="relative p-2 rounded-full hover:bg-violet-400/20 transition">
          <Bell className="w-6 h-6 text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
        </button>
        <img src="/executive-avatar.png" alt="User" className="w-10 h-10 rounded-full border-2 border-violet-400 shadow-md" />
      </div>
    </motion.header>
  );
};

export default DashboardTopbar4; 