import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const HeroSection = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] py-20 px-4 text-center overflow-hidden">
      {/* Animated SVG background */}
      <motion.svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.ellipse cx="720" cy="400" rx="700" ry="200" fill="#a5b4fc" fillOpacity="0.13" animate={{ rx: [700, 800, 700], ry: [200, 220, 200] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }} />
        <motion.ellipse cx="300" cy="150" rx="180" ry="60" fill="#38bdf8" fillOpacity="0.10" animate={{ cx: [300, 600, 300], rx: [180, 220, 180] }} transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }} />
        <motion.ellipse cx="1200" cy="650" rx="200" ry="70" fill="#a7f3d0" fillOpacity="0.12" animate={{ cy: [650, 500, 650], rx: [200, 250, 200] }} transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }} />
        <motion.circle cx="900" cy="200" r="60" fill="#f472b6" fillOpacity="0.09" animate={{ r: [60, 80, 60] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} />
      </motion.svg>
      {/* Floating CTA Card */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 max-w-3xl mx-auto bg-white/80 rounded-3xl shadow-2xl p-10 backdrop-blur-lg border border-white/30">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-400 text-transparent bg-clip-text">EduDiagno: AI-Powered Hiring</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-xl md:text-2xl mb-8 text-gray-700">Still interviewing manually? Let AI do the work. Autopilot video interviews, instant screening, and more.</motion.p>
        <form className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 w-64" />
          <input type="email" placeholder="Work Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 w-64" />
          <button type="submit" className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <div className="text-gray-500 text-sm flex flex-col md:flex-row gap-2 justify-center items-center">
          <span>✨ Free 14-day trial.</span>
          <span>🪪 No credit card required.</span>
        </div>
      </motion.div>
      {/* Floating micro-animations */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute left-10 top-1/3 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-2xl opacity-60" />
      <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute right-20 bottom-1/4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50" />
    </section>
  );
};

export default HeroSection; 