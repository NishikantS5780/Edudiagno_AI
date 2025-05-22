import React from "react";
import DashboardSidebar4 from "@/components/DashboardSidebar4";
import DashboardTopbar4 from "@/components/DashboardTopbar4";
import { motion } from "framer-motion";

const jobs = [
  { title: "Frontend Engineer", status: "Open" },
  { title: "Backend Developer", status: "Closed" },
  { title: "AI Researcher", status: "Open" },
  { title: "HR Manager", status: "Draft" },
];

const Jobs4 = () => (
  <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)' }}>
    <DashboardSidebar4 />
    <div className="flex-1 flex flex-col">
      <DashboardTopbar4 />
      <main className="flex-1 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-8">Jobs</h1>
        <div className="bg-white/10 rounded-2xl shadow-xl border border-violet-400/30 overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-violet-600/40">
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, i) => (
                <motion.tr key={j.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="hover:bg-violet-400/20 transition">
                  <td className="px-6 py-4 font-semibold">{j.title}</td>
                  <td className="px-6 py-4">{j.status}</td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition">Edit</button>
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

export default Jobs4; 