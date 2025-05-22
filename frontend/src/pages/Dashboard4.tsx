import React from "react";
import DashboardSidebar4 from "@/components/DashboardSidebar4";
import DashboardTopbar4 from "@/components/DashboardTopbar4";
import { motion } from "framer-motion";

const statCards = [
  { title: "Open Jobs", value: 12 },
  { title: "Interviews Today", value: 5 },
  { title: "Candidates in Pipeline", value: 37 },
  { title: "Avg. Interview Score", value: "8.4/10" },
];

const Dashboard4 = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)' }}>
      <DashboardSidebar4 />
      <div className="flex-1 flex flex-col w-full">
        <DashboardTopbar4 />
        <main className="flex-1 p-4 sm:p-6 md:p-12 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12 w-full">
            {statCards.map((card, i) => (
              <motion.div
                key={card.title}
                className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center backdrop-blur-lg border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.07 }}
              >
                <div className="text-3xl font-bold mb-2">{card.value}</div>
                <div className="text-lg opacity-80">{card.title}</div>
              </motion.div>
            ))}
          </div>
          {/* Sample Chart Area */}
          <motion.div className="bg-white/10 rounded-2xl p-4 sm:p-8 shadow-xl border border-violet-400/30 min-h-[200px] sm:min-h-[300px] flex items-center justify-center text-white text-xl sm:text-2xl font-semibold w-full overflow-x-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}>
            [Animated Chart Area]
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard4; 