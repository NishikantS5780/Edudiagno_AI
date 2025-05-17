import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap, Target, Sparkles, Users, BarChart3, Calendar, Search, Star, CheckCircle, Shield, Clock } from 'lucide-react';

const featuredLogos = [
  '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'
];

const integrations = [
  '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'
];

const faqs = [
  {
    q: 'How does the AI personalize learning?',
    a: 'Our AI analyzes your progress and adapts content and feedback to your unique learning style.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes, we use industry-leading encryption and privacy practices to keep your data safe.'
  },
  {
    q: 'Can I integrate with other platforms?',
    a: 'Absolutely! We support integrations with major LMS and HR platforms.'
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, you can try all features free for 14 days.'
  }
];

const stats = [
  { label: '98% Satisfaction', value: 98, icon: <Star className="w-6 h-6 text-yellow-400" /> },
  { label: '100K+ Users', value: 100000, icon: <Users className="w-6 h-6 text-blue-400" /> },
  { label: '120+ Integrations', value: 120, icon: <CheckCircle className="w-6 h-6 text-green-400" /> },
  { label: 'Enterprise Grade Security', value: 1, icon: <Shield className="w-6 h-6 text-purple-400" /> },
];

function useTypewriter(text: string, speed = 60) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

const Landing1 = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const headline = useTypewriter('Transform Your Learning With AI', 40);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center pb-12">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        {/* Animated SVG blobs and lines */}
        <svg className="absolute top-0 left-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
          <defs>
            <radialGradient id="blobGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="20%" cy="30%" r="120" fill="url(#blobGradient)">
            <animate attributeName="cx" values="20%;80%;20%" dur="12s" repeatCount="indefinite" />
            <animate attributeName="cy" values="30%;70%;30%" dur="10s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="70%" r="90" fill="url(#blobGradient)">
            <animate attributeName="cx" values="80%;30%;80%" dur="14s" repeatCount="indefinite" />
            <animate attributeName="cy" values="70%;20%;70%" dur="11s" repeatCount="indefinite" />
          </circle>
          <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="#a78bfa" strokeWidth="2" strokeDasharray="8 8">
            <animate attributeName="stroke-dashoffset" values="0;16" dur="2s" repeatCount="indefinite" />
          </line>
        </svg>
        {/* Animated particle background */}
        <canvas id="particles-bg" className="absolute inset-0 w-full h-full z-0" />
        {/* Animated AI Avatar */}
        <motion.img
          src="/AIAvatar.svg"
          alt="AI Avatar"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-64 h-64 mx-auto mb-8 drop-shadow-2xl animate-float"
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Education Platform
            </span>
          </motion.div>
          {/* Typewriter headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
            {headline}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Experience personalized education powered by advanced AI. Get real-time feedback, adaptive learning paths, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-purple-600 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
              <span className="absolute inset-0 w-full h-full bg-purple-500 border-2 border-purple-600 group-hover:bg-purple-600"></span>
              <span className="relative flex items-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-300 hover:text-white transition-colors"
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          {/* Featured logos */}
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-80">
            {featuredLogos.map((logo, i) => (
              <motion.img
                key={i}
                src={logo}
                alt="Featured logo"
                className="h-8 w-auto grayscale hover:grayscale-0 transition duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              />
            ))}
          </div>
        </div>
        {/* Scroll Indicator */}
        <motion.div
          style={{ y, opacity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="relative py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Cutting-Edge Features</h2>
            <p className="text-lg text-gray-400">Our platform streamlines learning with powerful AI tools designed for modern education.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Brain className="w-8 h-8" />, title: "AI-Powered Learning", description: "Personalized learning paths that adapt to your progress and style." },
              { icon: <Zap className="w-8 h-8" />, title: "Real-time Feedback", description: "Instant analysis and feedback to help you improve faster." },
              { icon: <Target className="w-8 h-8" />, title: "Smart Analytics", description: "Comprehensive insights into your learning journey and performance." },
              { icon: <Calendar className="w-8 h-8" />, title: "Flexible Scheduling", description: "Learn at your own pace, anytime, anywhere." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-8 border border-white/10 shadow-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative z-10">
                  <div className="text-purple-400 mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-400">Our streamlined AI-driven process makes learning easier than ever.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Lottie AI/robot animation */}
            <motion.img
              src="/AIAvatar.svg"
              alt="AI Flowchart"
              className="w-80 h-80 mx-auto md:mx-0 drop-shadow-2xl animate-float"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            />
            {/* Steps */}
            <div className="flex-1 grid grid-cols-1 gap-8">
              {[
                { num: 1, title: 'Sign Up & Set Goals', desc: 'Create your profile and set your learning objectives.' },
                { num: 2, title: 'Personalized AI Path', desc: 'AI builds a custom learning path and adapts as you progress.' },
                { num: 3, title: 'Track & Improve', desc: 'Get real-time feedback, analytics, and recommendations.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-6 bg-white/5 rounded-lg p-6 shadow-md hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold shadow-lg">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-gray-300 text-base">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-400">Unparalleled benefits for modern learners and educators.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Save Time</h3>
                  <p className="text-gray-300">Reduce learning time by up to 70% with automated, adaptive content.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Better Outcomes</h3>
                  <p className="text-gray-300">AI ensures you focus on what matters most for your goals.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Data-Driven Insights</h3>
                  <p className="text-gray-300">Make decisions based on real data and AI-powered analytics.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Reduce Bias</h3>
                  <p className="text-gray-300">Our AI is designed to minimize bias and promote fairness.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact/Stats Section */}
      <section className="py-24 bg-gradient-to-b from-black via-purple-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact So Far</h2>
            <p className="text-lg text-gray-400">See how our platform is making a difference for learners worldwide.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center bg-white/5 rounded-xl p-8 shadow-lg min-w-[200px]"
              >
                <div className="mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold mb-2">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-lg text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations/Partners Section */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Integrations & Partners</h2>
            <p className="text-lg text-gray-400">Connect with your favorite tools and platforms.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {integrations.map((logo, i) => (
              <motion.img
                key={i}
                src={logo}
                alt="Integration logo"
                className="h-12 w-auto grayscale hover:grayscale-0 transition duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                viewport={{ once: true }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-400">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-lg p-6 cursor-pointer shadow-md"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{faq.q}</h3>
                  <span className="ml-4 text-purple-400">{openFAQ === i ? '-' : '+'}</span>
                </div>
                {openFAQ === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-300 mt-4"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and educators who are achieving more with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-purple-600 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
              <span className="absolute inset-0 w-full h-full bg-purple-500 border-2 border-purple-600 group-hover:bg-purple-600"></span>
              <span className="relative flex items-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-300 hover:text-white transition-colors"
            >
              Request Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing1; 