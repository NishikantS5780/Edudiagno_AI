
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/common/RequireAuth";
import ChatbotButton from "@/components/common/ChatbotButton";

// Landing pages
import Landing from "@/pages/Landing";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import CaseStudies from "@/pages/CaseStudies";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Careers from "@/pages/Careers";
import Integrations from "@/pages/Integrations";
import Changelog from "@/pages/Changelog";
import HowItWorks from "@/pages/HowItWorks";

// Auth pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";

// Dashboard pages
import Dashboard from "@/pages/Dashboard/Dashboard";
import JobsIndex from "@/pages/Dashboard/Jobs/JobsIndex";
import NewJob from "@/pages/Dashboard/Jobs/NewJob";
import InterviewsIndex from "@/pages/Dashboard/Interviews/InterviewsIndex";
import InterviewDetail from "@/pages/Dashboard/Interviews/InterviewDetail";
import CandidatesIndex from "@/pages/Dashboard/Candidates/CandidatesIndex";
import CandidateDetail from "@/pages/Dashboard/Candidates/CandidateDetail";
import Analytics from "@/pages/Dashboard/Analytics";
import Profile from "@/pages/Dashboard/Profile";
import Settings from "@/pages/Dashboard/Settings";
import Help from "@/pages/Dashboard/Help";

// Candidate Interview Experience
import CandidateInterview from "@/pages/Interview/CandidateInterview";

// Error pages
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Candidate Interview Experience (Public) */}
              <Route path="/interview/:interviewId" element={<CandidateInterview />} />
              
              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } 
              />
              
              {/* Jobs Routes */}
              <Route 
                path="/dashboard/jobs" 
                element={
                  <RequireAuth>
                    <JobsIndex />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/jobs/new" 
                element={
                  <RequireAuth>
                    <NewJob />
                  </RequireAuth>
                } 
              />

              {/* Candidates Routes */}
              <Route 
                path="/dashboard/candidates" 
                element={
                  <RequireAuth>
                    <CandidatesIndex />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/candidates/:id" 
                element={
                  <RequireAuth>
                    <CandidateDetail />
                  </RequireAuth>
                } 
              />

              {/* Interviews Routes */}
              <Route 
                path="/dashboard/interviews" 
                element={
                  <RequireAuth>
                    <InterviewsIndex />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/interviews/:id" 
                element={
                  <RequireAuth>
                    <InterviewDetail />
                  </RequireAuth>
                } 
              />

              {/* Analytics Route */}
              <Route 
                path="/dashboard/analytics" 
                element={
                  <RequireAuth>
                    <Analytics />
                  </RequireAuth>
                } 
              />

              {/* Profile & Settings Routes */}
              <Route 
                path="/dashboard/profile" 
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/settings" 
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/help" 
                element={
                  <RequireAuth>
                    <Help />
                  </RequireAuth>
                } 
              />
              
              {/* Redirects */}
              <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 - Must be the last route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatbotButton />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
