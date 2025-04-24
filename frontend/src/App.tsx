import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/common/RequireAuth";
import ChatbotButton from "@/components/common/ChatbotButton";
import { useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import VideoInterview from "@/pages/Interview/VideoInterview";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";

import Dashboard from "@/pages/Dashboard/Dashboard";
import JobsPage from "@/pages/Dashboard/Jobs/JobsPage";
import NewJob from "@/pages/Dashboard/Jobs/NewJob";
import JobDetail from "@/pages/Dashboard/Jobs/JobDetail";
import JobEdit from "@/pages/Dashboard/Jobs/JobEdit";
import InterviewsPage from "@/pages/Dashboard/Interviews/InterviewsPage";
import InterviewDetail from "@/pages/Dashboard/Interviews/InterviewDetail";
import Profile from "@/pages/Dashboard/Profile";
import Settings from "@/pages/Dashboard/Settings";
import Help from "@/pages/Dashboard/Help";

import PublicInterview from "@/pages/Interview/InterviewPage";
import InterviewFlow from "@/pages/Interview/InterviewFlow";
import CandidatePreCheck from "@/components/interview/CandidatePreCheck";
import DSAPlayground from "@/pages/Interview/DSAPlayground";

import NotFound from "@/pages/NotFound";
import { UserContext, UserProvider } from "./context/UserContext";
import LoadingSpinner from "./components/common/LoadingSpinner";
import RequireProfileVerified from "@/components/common/RequireProfileVerified";
import InterviewPage from "@/pages/Interview/InterviewPage";
import { NotificationProvider } from "@/context/NotificationContext";
import MCQTest from "@/pages/Interview/MCQTest";
import InterviewReport from "@/pages/Dashboard/Interviews/InterviewReport";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const userContext = useContext(UserContext);
  const isLoading = userContext?.isLoading ?? false;

  if (isLoading) {
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
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

                <Route path="/interview" element={<InterviewPage />} />
                <Route
                  path="/interview/compatibility"
                  element={<InterviewFlow />}
                />
                <Route
                  path="/interview/setup"
                  element={<CandidatePreCheck />}
                />
                <Route
                  path="/interview/video-interview"
                  element={<VideoInterview />}
                />

                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/dashboard/jobs"
                  element={
                    <RequireAuth>
                      <JobsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard/jobs/new"
                  element={
                    <RequireAuth>
                      <RequireProfileVerified>
                        <NewJob />
                      </RequireProfileVerified>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard/jobs/:id"
                  element={
                    <RequireAuth>
                      <RequireProfileVerified>
                        <JobDetail />
                      </RequireProfileVerified>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard/jobs/:id/edit"
                  element={
                    <RequireAuth>
                      <RequireProfileVerified>
                        <JobEdit />
                      </RequireProfileVerified>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/dashboard/interviews"
                  element={
                    <RequireAuth>
                      <InterviewsPage />
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

                <Route
                  path="/dashboard/interviews/new"
                  element={
                    <RequireAuth>
                      <RequireProfileVerified>
                        <InterviewDetail />
                      </RequireProfileVerified>
                    </RequireAuth>
                  }
                />

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

                <Route path="/interview" element={<PublicInterview />} />
                <Route path="/interview/flow" element={<InterviewFlow />} />
                <Route
                  path="/interview/precheck"
                  element={<CandidatePreCheck />}
                />
                <Route
                  path="/interview/dsa-playground"
                  element={<DSAPlayground />}
                />
                <Route path="/interview/video" element={<VideoInterview />} />

                <Route path="/mcq" element={<MCQTest />} />

                <Route
                  path="/dashboard/interviews/:id/report"
                  element={
                    <RequireAuth>
                      <InterviewReport />
                    </RequireAuth>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatbotButton />
            </TooltipProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
