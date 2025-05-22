import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { name: "Dashboard", icon: <LayoutDashboard />, to: "/dashboard4" },
  { name: "Candidates", icon: <Users />, to: "/candidates4" },
  { name: "Jobs", icon: <Briefcase />, to: "/jobs4" },
  { name: "Analytics", icon: <BarChart3 />, to: "/analytics4" },
  { name: "Settings", icon: <Settings />, to: "/settings4" },
];

const DashboardSidebar4 = () => {
  const location = useLocation();
  return (
    <aside className="h-screen w-20 md:w-64 bg-white/10 backdrop-blur-lg border-r border-violet-400/30 flex flex-col py-8 px-2 md:px-6 z-20">
      <div className="mb-12 flex items-center justify-center md:justify-start">
        <img src="/executive-avatar.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-violet-400 shadow-md mr-0 md:mr-3" />
        <span className="hidden md:inline text-white text-xl font-bold tracking-wide">AI Hire</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link, i) => {
          const active = location.pathname === link.to;
          return (
            <motion.div key={link.name} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <Link to={link.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all ${active ? 'bg-violet-600/80 shadow-lg' : 'hover:bg-violet-400/20'}`}>
                <span className="text-xl">{link.icon}</span>
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar4; 