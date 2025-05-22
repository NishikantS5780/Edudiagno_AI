import React from "react";
import DashboardSidebar4 from "@/components/DashboardSidebar4";
import DashboardTopbar4 from "@/components/DashboardTopbar4";
import { motion } from "framer-motion";

const candidates = [
  { name: "Alice Smith", status: "Interviewed", score: 9.1 },
  { name: "Bob Lee", status: "Screening", score: 7.8 },
  { name: "Carla Gomez", status: "Offer", score: 8.7 },
  { name: "David Kim", status: "Rejected", score: 6.2 },
];

const Candidates4 = () => (
  <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)' }}>
    <DashboardSidebar4 />
    <div className="flex-1 flex flex-col w-full">
      <DashboardTopbar4 />
      <main className="flex-1 p-4 sm:p-6 md:p-12 w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Candidates</h1>
        <div className="bg-white/10 rounded-2xl shadow-xl border border-violet-400/30 overflow-x-auto w-full">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-violet-600/40">
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Score</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <motion.tr key={c.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="hover:bg-violet-400/20 transition">
                  <td className="px-6 py-4 font-semibold">{c.name}</td>
                  <td className="px-6 py-4">{c.status}</td>
                  <td className="px-6 py-4">{c.score}</td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition">View</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
);

export default Candidates4; 