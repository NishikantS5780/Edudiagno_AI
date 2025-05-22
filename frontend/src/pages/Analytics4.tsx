import React from "react";
import DashboardSidebar4 from "@/components/DashboardSidebar4";
import DashboardTopbar4 from "@/components/DashboardTopbar4";
import { motion } from "framer-motion";

const metrics = [
  { label: "Avg. Time to Hire", value: "12 days" },
  { label: "Interview Success Rate", value: "78%" },
  { label: "Candidate Satisfaction", value: "92%" },
  { label: "Offer Acceptance", value: "85%" },
];

const Analytics4 = () => (
  <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)' }}>
    <DashboardSidebar4 />
    <div className="flex-1 flex flex-col">
      <DashboardTopbar4 />
      <main className="flex-1 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {metrics.map((m, i) => (
            <motion.div key={m.label} className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center backdrop-blur-lg border border-violet-400/30" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}>
              <div className="text-2xl font-bold mb-2">{m.value}</div>
              <div className="text-lg opacity-80">{m.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl border border-violet-400/30 min-h-[300px] flex items-center justify-center text-white text-2xl font-semibold" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}>
          [Animated Chart Area]
        </motion.div>
      </main>
    </div>
  </div>
);

export default Analytics4; 