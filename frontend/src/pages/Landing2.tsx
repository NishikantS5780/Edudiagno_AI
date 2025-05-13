import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, CheckCircle, Users, BarChart3, Calendar, Star, Shield, Brain, Zap, Target } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8 text-blue-500" />, title: 'Lightning Fast AI Screening', desc: 'Instantly screen candidates with AI-powered algorithms for the best fit.'
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-purple-500" />, title: 'Data-Driven Insights', desc: 'Get actionable analytics and reports for every candidate.'
  },
  {
    icon: <Users className="w-8 h-8 text-green-500" />, title: 'Collaborative Hiring', desc: 'Invite your team to review, rate, and comment on candidates.'
  },
  {
    icon: <Calendar className="w-8 h-8 text-pink-500" />, title: 'Automated Scheduling', desc: 'Seamlessly schedule interviews with smart calendar integration.'
  },
];

const steps = [
  { num: 1, title: 'Post a Job', desc: 'Create your job listing in seconds.' },
  { num: 2, title: 'AI Screens Candidates', desc: 'Our AI shortlists the best matches instantly.' },
  { num: 3, title: 'Collaborate & Interview', desc: 'Your team reviews, rates, and interviews top talent.' },
  { num: 4, title: 'Hire Smarter', desc: 'Make data-driven hiring decisions with confidence.' },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'HR Lead, TechCorp',
    text: 'EduDiagno made our hiring 3x faster and our team loves the collaborative features!'
  },
  {
    name: 'Amit R.',
    role: 'Founder, StartupX',
    text: 'The AI screening is a game changer. We only interview the best candidates now.'
  },
  {
    name: 'Sara M.',
    role: 'Talent Manager, BigCo',
    text: 'The analytics and reports are so clear and actionable. Highly recommended!'
  },
];

const partners = [
  '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg',
];

const Landing2 = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  return (
    <div className="bg-gradient-to-br from-[#f8fafc] via-[#e0e7ff] to-[#f0fdfa] min-h-screen text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] py-20 px-4 text-center">
        {/* Animated background shapes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.ellipse cx="720" cy="300" rx="700" ry="180" fill="#a5b4fc" fillOpacity="0.15" animate={{ rx: [700, 750, 700], ry: [180, 200, 180] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} />
            <motion.ellipse cx="400" cy="100" rx="200" ry="60" fill="#38bdf8" fillOpacity="0.12" animate={{ cx: [400, 600, 400], rx: [200, 220, 200] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }} />
            <motion.ellipse cx="1100" cy="500" rx="180" ry="50" fill="#a7f3d0" fillOpacity="0.13" animate={{ cy: [500, 400, 500], rx: [180, 200, 180] }} transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }} />
          </svg>
        </motion.div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-400 text-transparent bg-clip-text">EduDiagno: AI-Powered Hiring</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-xl md:text-2xl mb-8 text-gray-700">Revolutionize your recruitment with instant AI screening, collaborative workflows, and actionable analytics.</motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/demo" className="px-8 py-4 rounded-full border-2 border-blue-600 text-blue-700 font-bold text-lg bg-white shadow hover:bg-blue-50 transition-colors flex items-center gap-2">
              Request Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-80 mt-6">
            {partners.map((logo, i) => (
              <img key={i} src={logo} alt="Partner logo" className="h-8 w-auto grayscale hover:grayscale-0 transition duration-300" />
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 bg-white/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Why EduDiagno?</h2>
            <p className="text-lg text-gray-600">Everything you need to hire smarter, faster, and together.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">{f.title}</h3>
                <p className="text-gray-600 text-center">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Process/Steps Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 via-purple-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-700">From job post to hire, AI and your team work together every step.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-4 border-4 border-white">{step.num}</div>
                <h3 className="text-lg font-bold mb-2 text-blue-900">{step.title}</h3>
                <p className="text-gray-600 text-center mb-2">{step.desc}</p>
                {i < steps.length - 1 && <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} className="w-1 h-10 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full my-2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-24 bg-white/90">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Real feedback from real hiring teams.</p>
          </div>
          <div className="relative flex flex-col items-center">
            <motion.div key={testimonialIdx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-xl p-10 max-w-xl text-center">
              <p className="text-xl mb-6 text-gray-800">“{testimonials[testimonialIdx].text}”</p>
              <div className="font-bold text-blue-900">{testimonials[testimonialIdx].name}</div>
              <div className="text-gray-500 text-sm">{testimonials[testimonialIdx].role}</div>
            </motion.div>
            <div className="flex gap-4 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-3 h-3 rounded-full ${i === testimonialIdx ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`} />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Partners Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {partners.map((logo, i) => (
              <img key={i} src={logo} alt="Partner logo" className="h-10 w-auto grayscale hover:grayscale-0 transition duration-300" />
            ))}
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-green-400 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Hire Smarter with EduDiagno?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Join the next generation of hiring teams using AI to find the best talent, faster.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-white text-blue-700 font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/demo" className="px-8 py-4 rounded-full border-2 border-white text-white font-bold text-lg bg-transparent shadow hover:bg-white hover:text-blue-700 transition-colors flex items-center gap-2">
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing2; 