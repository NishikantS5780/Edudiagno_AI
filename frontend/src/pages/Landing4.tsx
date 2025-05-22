import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Users,
  BarChart3,
  Calendar,
  Search,
  Brain,
  Clock,
  Star,
} from "lucide-react";
import MascotOrb from "@/components/MascotOrb";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const slideInCenter = fadeInUp;
const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};
const popupVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
};

const featureDetails = [
  {
    title: "Enterprise-Grade Security",
    desc: "GDPR compliant, SSO, and advanced encryption to keep your data safe.",
    more: "We are certified for ISO 27001 and SOC 2. All data is encrypted at rest and in transit, with regular security audits for peace of mind.",
  },
  {
    title: "AI-Powered Insights",
    desc: "Get actionable analytics and candidate scoring, powered by state-of-the-art AI.",
    more: "Our AI models are trained on millions of data points, providing you with predictive analytics and bias mitigation.",
  },
  {
    title: "Seamless Integrations",
    desc: "Connect with your favorite HR tools, calendars, and communication platforms.",
    more: "Integrate with Slack, Google, Microsoft, and more. Our open API allows custom integrations for your workflow.",
  },
  {
    title: "Custom Workflows",
    desc: "Tailor interview flows and assessments to your unique hiring process.",
    more: "Drag-and-drop workflow builder lets you automate, customize, and optimize every step of your hiring pipeline.",
  },
  {
    title: "Global Scalability",
    desc: "Built to support teams and candidates in 100+ countries, 24/7.",
    more: "Multi-language support, global compliance, and 24/7 uptime for distributed teams and candidates worldwide.",
  },
  {
    title: "Dedicated Support",
    desc: "24/7 priority support and onboarding for all clients, big or small.",
    more: "Our customer success team is available around the clock, with dedicated onboarding for enterprise clients.",
  },
];

const caseStudies = [
  {
    title: "GlobalTech Inc.",
    desc: "Reduced time-to-hire by 60% and improved candidate quality with AI-driven interviews.",
    more: "GlobalTech integrated our platform with their ATS, resulting in a 2x increase in recruiter productivity and a 30% reduction in hiring costs.",
    stats: "1000+ hires | 20+ countries",
  },
  {
    title: "StartupX",
    desc: "Scaled from 5 to 100 employees in 6 months using our automated screening and interview tools.",
    more: "StartupX leveraged our workflow automation to reduce manual screening by 80%, allowing rapid scaling with high candidate satisfaction.",
    stats: "95% candidate satisfaction",
  },
];

const Landing4 = () => {
  const [featurePopup, setFeaturePopup] = useState<number | null>(null);
  const [casePopup, setCasePopup] = useState<number | null>(null);

  return (
    <LandingLayout>
      {/* Hero section */}
      <motion.section
        className="relative overflow-hidden py-20 md:py-32 px-4"
        style={{
          background: 'linear-gradient(135deg, #A259E6 0%, #1a0025 100%)',
        }}
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Gradient background shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#6D249F] opacity-30 blur-2xl -z-10" style={{ top: '-4rem', left: '-4rem' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#A259E6] opacity-30 blur-2xl -z-10" style={{ bottom: '-6rem', right: '-6rem' }} />
        {/* Large purple circle behind robot */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#A259E6] opacity-80 -z-10" style={{ right: '6%', top: '50%' }} />
        {/* Decorative circles */}
        <div className="absolute left-1/3 top-1/4 w-16 h-16 rounded-full bg-[#A259E6] opacity-60 -z-10" />
        <div className="absolute left-1/2 top-2/3 w-10 h-10 rounded-full bg-[#6D249F] opacity-40 -z-10" />
        <div className="absolute right-1/4 top-1/3 w-8 h-8 rounded-full bg-[#A259E6] opacity-50 -z-10" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Left: Text */}
            <div className="flex-1 text-left space-y-4">
              <motion.div variants={slideInLeft} className="inline-block">
                <div className="inline-flex items-center rounded-full border border-violet-200 bg-white/30 px-4 py-1.5 text-sm mb-8 backdrop-blur">
                  <span className="flex h-2 w-2 rounded-full bg-white mr-2"></span>
                  <span className="text-white font-semibold">
                    AI-powered Candidate Selection
                  </span>
                </div>
              </motion.div>
              <motion.h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight" variants={slideInRight}>
                Smarter Hiring with AI<br />for Modern Teams
              </motion.h1>
              <motion.p className="text-white text-lg md:text-xl max-w-2xl" variants={slideInLeft}>
                Automated interviews, instant insights, and data-driven hiring. Transform your recruitment process with our AI-powered platform—trusted by MNCs and startups worldwide.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-6" variants={slideInCenter}>
                <Button size="lg" className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white rounded-xl px-10 py-4 text-lg font-semibold">
                  Start Slide
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-purple-400 text-white hover:bg-purple-400/20 rounded-xl px-10 py-4 text-lg font-semibold flex items-center gap-2">
                  Watch Video <span className="inline-block bg-white/20 rounded-full p-1"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.2"/><polygon points="10,8 16,12 10,16" fill="white"/></svg></span>
                </Button>
                <Link to="/dashboard4">
                  <Button size="lg" className="w-full sm:w-auto bg-violet-900 hover:bg-violet-800 text-white rounded-xl px-10 py-4 text-lg font-semibold">
                    Go to Dashboard
                  </Button>
                </Link>
              </motion.div>
            </div>
            {/* Right: Avatar */}
            <motion.div className="flex-1 flex justify-center md:justify-end items-center" variants={slideInRight}>
              <img
                src="/executive-avatar.png"
                alt="Executive Avatar"
                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl border-4 border-white/30 bg-white/10 max-w-full max-h-full"
                style={{ maxWidth: '320px', maxHeight: '320px' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Cutting-Edge Features</h2>
            <p className="text-violet-700">
              Our platform streamlines the hiring process with powerful AI tools
              designed specifically for employers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="border-violet-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="h-2 bg-violet-600 w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-violet-900">AI Video Interviews</h3>
                <p className="text-violet-700">
                  Conduct interviews in real-time with an AI interviewer that
                  asks job-relevant questions and evaluates responses.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-violet-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="h-2 bg-violet-600 w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-violet-900">Instant Insights</h3>
                <p className="text-violet-700">
                  AI analyzes candidate responses and generates comprehensive
                  hiring reports with scores and recommendations.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-violet-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="h-2 bg-violet-600 w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-violet-900">Shareable Links</h3>
                <p className="text-violet-700">
                  Invite candidates with a simple shareable link that can be
                  distributed via email or social media platforms.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-violet-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="h-2 bg-violet-600 w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-violet-900">Smart Screening</h3>
                <p className="text-violet-700">
                  AI filters only the best-matched candidates by analyzing
                  resumes against your job requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 bg-violet-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-violet-900 mb-4">How It Works</h2>
            <p className="text-violet-700">
              Our streamlined AI-driven hiring process makes finding the right
              candidates easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-violet-900">Create Job Listings</h3>
              <p className="text-violet-700">
                Create detailed job listings, specify requirements, and let AI
                generate optimized job descriptions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-violet-900">AI Screens Candidates</h3>
              <p className="text-violet-700">
                Our AI analyzes resumes and identifies candidates that best
                match your job requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-violet-900">Automated Interviews</h3>
              <p className="text-violet-700">
                Candidates participate in AI-conducted video interviews, with
                responses analyzed for key insights.
              </p>
            </div>
          </div>

          <div className="max-w-lg mx-auto mt-16 text-center">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="border-violet-600 text-violet-600 hover:bg-violet-50">
                Learn more about the process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Trusted by Employers</h2>
            <p className="text-violet-700">
              See how companies are transforming their hiring process with
              InterviewPro AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-violet-600 text-violet-600" />
                ))}
              </div>
              <p className="mb-6 italic text-violet-700">
                "InterviewPro AI has completely transformed our hiring process.
                The AI interviews have saved our team countless hours and
                improved our candidate selection."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 mr-4" />
                <div>
                  <p className="font-semibold text-violet-900">Sarah Johnson</p>
                  <p className="text-sm text-violet-700">
                    HR Director, TechGrowth Inc.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-violet-600 text-violet-600" />
                ))}
              </div>
              <p className="mb-6 italic text-violet-700">
                "The AI-powered screening process has helped us find better
                candidates faster. The automated interviews are incredibly
                efficient and insightful."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 mr-4" />
                <div>
                  <p className="font-semibold text-violet-900">Michael Chen</p>
                  <p className="text-sm text-violet-700">
                    CTO, InnovateTech
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-violet-600 text-violet-600" />
                ))}
              </div>
              <p className="mb-6 italic text-violet-700">
                "We've seen a significant improvement in our hiring quality
                since implementing InterviewPro AI. The platform is intuitive
                and the results are impressive."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 mr-4" />
                <div>
                  <p className="font-semibold text-violet-900">Emily Rodriguez</p>
                  <p className="text-sm text-violet-700">
                    Talent Acquisition Lead, GrowthCorp
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <motion.section className="py-12 bg-violet-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInLeft}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-violet-700 mb-6">Trusted by leading companies</h3>
          <motion.div className="flex flex-wrap justify-center items-center gap-8 opacity-80" variants={stagger}>
            <motion.img src="/logos/company1.svg" alt="Company 1" className="h-10" variants={fadeIn} />
            <motion.img src="/logos/company2.svg" alt="Company 2" className="h-10" variants={fadeIn} />
            <motion.img src="/logos/company3.svg" alt="Company 3" className="h-10" variants={fadeIn} />
            <motion.img src="/logos/company4.svg" alt="Company 4" className="h-10" variants={fadeIn} />
            <motion.img src="/logos/company5.svg" alt="Company 5" className="h-10" variants={fadeIn} />
          </motion.div>
        </div>
      </motion.section>

      {/* Expanded Features section */}
      <motion.section className="py-20 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={slideInRight}>
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Features for Modern Teams</h2>
            <p className="text-violet-700">
              Built for scale, security, and speed—our platform adapts to the needs of both global enterprises and fast-moving startups.
            </p>
          </motion.div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" variants={stagger}>
            {featureDetails.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-violet-50 rounded-2xl p-8 shadow-sm relative cursor-pointer group"
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                onMouseEnter={() => setFeaturePopup(i)}
                onMouseLeave={() => setFeaturePopup(null)}
                tabIndex={0}
                onFocus={() => setFeaturePopup(i)}
                onBlur={() => setFeaturePopup(null)}
              >
                <h4 className="font-bold text-violet-900 mb-2">{f.title}</h4>
                <p className="text-violet-700">{f.desc}</p>
                <AnimatePresence>
                  {featurePopup === i && (
                    <motion.div
                      className="absolute left-1/2 top-full z-20 w-80 -translate-x-1/2 mt-4 bg-white border border-violet-200 rounded-xl shadow-xl p-5 text-left"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={popupVariant}
                    >
                      <h5 className="font-bold text-violet-900 mb-2">More Info</h5>
                      <p className="text-violet-700 text-sm">{f.more}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us section */}
      <motion.section className="py-20 bg-violet-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInRight}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-12" variants={slideInLeft}>
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Why Choose Us?</h2>
            <p className="text-violet-700">We empower both Fortune 500s and startups to hire smarter, faster, and more fairly.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-10" variants={stagger}>
            <motion.div className="bg-white rounded-2xl p-8 shadow-md" variants={slideInLeft}>
              <h4 className="font-bold text-violet-900 mb-2">For Enterprises</h4>
              <ul className="list-disc pl-5 text-violet-700 space-y-2">
                <li>Robust compliance & security</li>
                <li>Advanced analytics & reporting</li>
                <li>Custom SLAs & onboarding</li>
                <li>Multi-region support</li>
              </ul>
            </motion.div>
            <motion.div className="bg-white rounded-2xl p-8 shadow-md" variants={slideInRight}>
              <h4 className="font-bold text-violet-900 mb-2">For Startups</h4>
              <ul className="list-disc pl-5 text-violet-700 space-y-2">
                <li>Easy setup, no IT required</li>
                <li>Affordable, scalable pricing</li>
                <li>Plug-and-play integrations</li>
                <li>Rapid support & onboarding</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Security & Compliance section */}
      <motion.section className="py-20 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInLeft}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-12" variants={slideInRight}>
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Security & Compliance</h2>
            <p className="text-violet-700">Your data is protected with enterprise-grade security, privacy, and compliance standards.</p>
          </motion.div>
          <motion.div className="flex flex-wrap justify-center gap-8" variants={stagger}>
            {["GDPR Compliant", "SSO & Encryption", "99.99% Uptime"].map((title, i) => (
              <motion.div key={title} className="bg-violet-50 rounded-xl p-6 w-64 text-center" variants={i % 2 === 0 ? slideInLeft : slideInRight}>
                <h5 className="font-bold text-violet-900 mb-2">{title}</h5>
                <p className="text-violet-700 text-sm">{[
                  "We adhere to the strictest data privacy regulations worldwide.",
                  "Single sign-on and end-to-end encryption for all users.",
                  "Reliable, global infrastructure for uninterrupted access."
                ][i]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Integrations section */}
      <motion.section className="py-20 bg-violet-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInRight}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Integrations</h2>
            <p className="text-violet-700">Works seamlessly with your existing HR, ATS, and productivity tools.</p>
          </div>
          <motion.div className="flex flex-wrap justify-center gap-8 items-center" variants={stagger}>
            <motion.img src="/integrations/slack.svg" alt="Slack" className="h-10" variants={fadeIn} />
            <motion.img src="/integrations/google.svg" alt="Google" className="h-10" variants={fadeIn} />
            <motion.img src="/integrations/office365.svg" alt="Office 365" className="h-10" variants={fadeIn} />
            <motion.img src="/integrations/zoom.svg" alt="Zoom" className="h-10" variants={fadeIn} />
            <motion.img src="/integrations/teams.svg" alt="Teams" className="h-10" variants={fadeIn} />
          </motion.div>
        </div>
      </motion.section>

      {/* Case Studies section */}
      <motion.section className="py-20 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-12" variants={slideInLeft}>
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Success Stories</h2>
            <p className="text-violet-700">See how we've helped companies transform their hiring process.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-10" variants={stagger}>
            {caseStudies.map((c, i) => (
              <motion.div
                key={c.title}
                className="bg-violet-50 rounded-2xl p-8 shadow-sm relative cursor-pointer group"
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                onMouseEnter={() => setCasePopup(i)}
                onMouseLeave={() => setCasePopup(null)}
                tabIndex={0}
                onFocus={() => setCasePopup(i)}
                onBlur={() => setCasePopup(null)}
              >
                <h4 className="font-bold text-violet-900 mb-2">{c.title}</h4>
                <p className="text-violet-700 mb-2">{c.desc}</p>
                <span className="text-violet-600 text-sm">{c.stats}</span>
                <AnimatePresence>
                  {casePopup === i && (
                    <motion.div
                      className="absolute left-1/2 top-full z-20 w-80 -translate-x-1/2 mt-4 bg-white border border-violet-200 rounded-xl shadow-xl p-5 text-left"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={popupVariant}
                    >
                      <h5 className="font-bold text-violet-900 mb-2">More Info</h5>
                      <p className="text-violet-700 text-sm">{c.more}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ section */}
      <motion.section className="py-20 bg-violet-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInCenter}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-12" variants={slideInLeft}>
            <h2 className="text-4xl font-bold text-violet-900 mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <motion.div className="max-w-3xl mx-auto space-y-6" variants={stagger}>
            {["Is my data secure?", "Can I integrate with my existing HR tools?", "Do you offer support for global teams?"].map((q, i) => (
              <motion.div key={q} className="bg-white rounded-xl p-6 shadow-sm" variants={i % 2 === 0 ? slideInLeft : slideInRight}>
                <h5 className="font-semibold text-violet-900 mb-2">{q}</h5>
                <p className="text-violet-700">{[
                  "Absolutely. We use industry-leading security and compliance standards to protect your data.",
                  "Yes, we support integrations with all major HR, ATS, and productivity platforms.",
                  "Our platform is built for global scale, with 24/7 support and multi-language capabilities."
                ][i]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact & Demo section */}
      <motion.section className="py-20 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInLeft}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-violet-900 mb-4">Ready to transform your hiring?</h2>
          <p className="text-violet-700 mb-8">Contact us for a personalized demo or to discuss your hiring needs.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-xl font-semibold">Request a Demo</Button>
            <Button size="lg" variant="outline" className="border-violet-600 text-violet-600 hover:bg-violet-50 px-10 py-4 rounded-xl font-semibold">Contact Sales</Button>
          </div>
        </div>
      </motion.section>

      {/* About Us / Mission section */}
      <motion.section className="py-20 bg-violet-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={slideInRight}>
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-violet-900 mb-4">Our Mission</h2>
          <p className="text-violet-700 text-lg">We believe in a world where hiring is fair, fast, and data-driven. Our mission is to empower organizations of all sizes to find the best talent—anywhere, anytime—using the power of AI and automation.</p>
        </div>
      </motion.section>

      {/* New Dashboard Suite Preview Section */}
      <motion.section className="py-20 bg-gradient-to-br from-[#A259E6]/80 to-[#1a0025]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
        <div className="container mx-auto px-4 overflow-x-auto">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={slideInLeft}>
            <h2 className="text-4xl font-bold text-white mb-4">Explore the New Dashboard Suite</h2>
            <p className="text-violet-200 text-lg">A modern, AI-powered workspace for all your hiring needs. Try the new dashboard, candidate management, analytics, and more!</p>
          </motion.div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" variants={stagger}>
            <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer" variants={slideInLeft}>
              <h3 className="text-2xl font-bold mb-2">Dashboard</h3>
              <p className="mb-4 text-violet-200">Your AI-powered hiring overview, stats, and quick actions.</p>
              <Link to="/dashboard4" className="inline-block"><Button className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2">Open</Button></Link>
            </motion.div>
            <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer" variants={slideInRight}>
              <h3 className="text-2xl font-bold mb-2">Candidates</h3>
              <p className="mb-4 text-violet-200">Manage, screen, and track candidates with ease.</p>
              <Link to="/candidates4" className="inline-block"><Button className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2">Open</Button></Link>
            </motion.div>
            <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer" variants={slideInLeft}>
              <h3 className="text-2xl font-bold mb-2">Jobs</h3>
              <p className="mb-4 text-violet-200">Create, edit, and manage job postings and pipelines.</p>
              <Link to="/jobs4" className="inline-block"><Button className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2">Open</Button></Link>
            </motion.div>
            <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer" variants={slideInRight}>
              <h3 className="text-2xl font-bold mb-2">Analytics</h3>
              <p className="mb-4 text-violet-200">Visualize hiring funnel, interview success, and more.</p>
              <Link to="/analytics4" className="inline-block"><Button className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2">Open</Button></Link>
            </motion.div>
            <motion.div className="bg-white/10 rounded-2xl p-8 shadow-xl text-white text-center border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer" variants={slideInLeft}>
              <h3 className="text-2xl font-bold mb-2">Settings</h3>
              <p className="mb-4 text-violet-200">Profile, company, and preferences in one place.</p>
              <Link to="/settings4" className="inline-block"><Button className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2">Open</Button></Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <MascotOrb />
    </LandingLayout>
  );
};

export default Landing4; 