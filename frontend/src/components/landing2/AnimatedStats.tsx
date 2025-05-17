import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Candidates Screened', value: 120000, color: 'from-blue-500 to-purple-500' },
  { label: 'Avg. Time Saved', value: 72, suffix: '%', color: 'from-green-400 to-blue-400' },
  { label: 'Companies Onboarded', value: 3500, color: 'from-purple-500 to-pink-500' },
  { label: 'AI Accuracy', value: 99.2, suffix: '%', color: 'from-yellow-400 to-pink-400' },
];

const AnimatedStats = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Impact in Numbers</h2>
          <p className="text-lg text-gray-600">See how EduDiagno is transforming hiring for teams worldwide.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center group overflow-hidden`}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                viewport={{ once: true }}
                className={`absolute inset-0 z-0 blur-2xl opacity-40 bg-gradient-to-br ${stat.color}`}
              />
              <motion.div
                initial={{ scale: 0.7 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <div className="mt-4 text-lg font-semibold text-gray-800 text-center drop-shadow-lg">
                  {stat.label}
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.2 }}
                  viewport={{ once: true }}
                  className={`h-2 mt-6 rounded-full bg-gradient-to-r ${stat.color}`}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AnimatedCounter = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let increment = end / 100;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      setDisplay(Number(current.toFixed(0)));
    }, 10);
    return () => clearInterval(timer);
  }, [value]);
  return <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-400 drop-shadow-lg">{display}{suffix}</div>;
};

export default AnimatedStats; 