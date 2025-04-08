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
import RequireProfileCompletion from "@/components/common/RequireProfileCompletion";
import ChatbotButton from "@/components/common/ChatbotButton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { publicInterviewApi } from "@/lib/api";
import VideoInterview from "@/pages/Interview/VideoInterview";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
import JobDetail from "@/pages/Dashboard/Jobs/JobDetail";
import JobEdit from "@/pages/Dashboard/Jobs/JobEdit";
import InterviewsIndex from "@/pages/Dashboard/Interviews/InterviewsIndex";
import InterviewDetail from "@/pages/Dashboard/Interviews/InterviewDetail";
import CandidatesIndex from "@/pages/Dashboard/Candidates/CandidatesIndex";
import CandidateDetail from "@/pages/Dashboard/Candidates/CandidateDetail";
import Analytics from "@/pages/Dashboard/Analytics";
import Profile from "@/pages/Dashboard/Profile";
import Settings from "@/pages/Dashboard/Settings";
import Help from "@/pages/Dashboard/Help";

// Candidate Interview Experience
import PublicInterview from "@/pages/Interview/PublicInterview";
import InterviewStart from "@/pages/Interview/InterviewStart";
import InterviewFlow from "@/pages/Interview/InterviewFlow";
import InterviewSetupStage from "@/pages/Interview/InterviewSetupStage";
import CandidatePreCheck from "@/components/interview/CandidatePreCheck";

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

const VideoInterviewWrapper = () => {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const [interviewData, setInterviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await publicInterviewApi.getByAccessCode(accessCode!);
        if (
          !response.data ||
          !response.data.job ||
          !response.data.job.title ||
          !response.data.job.company?.name
        ) {
          throw new Error("Invalid interview data");
        }
        setInterviewData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching interview data:", error);
        toast.error("Failed to load interview data");
        navigate(`/interview/${accessCode}`);
      }
    };

    fetchInterviewData();
  }, [accessCode, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (
    !interviewData ||
    !interviewData.job ||
    !interviewData.job.title ||
    !interviewData.job.company?.name
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">
            Invalid interview data. Please try again.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/interview/${accessCode}`)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VideoInterview
      jobTitle={interviewData.job.title}
      companyName={interviewData.job.company.name}
      interviewId={interviewData.id}
      candidate={interviewData.candidate}
      jobDescription={interviewData.job.description || ""}
      resumeText={interviewData.candidate?.resume_text || ""}
      onComplete={() => navigate(`/interview/${accessCode}/complete`)}
    />
  );
};

const CandidatePreCheckWrapper = () => {
  const { accessCode } = useParams();
  const navigate = useNavigate();

  return (
    <CandidatePreCheck
      onReady={() => navigate(`/interview/${accessCode}/video-interview`)}
    />
  );
};

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

              {/* Public Interview Routes */}
              <Route
                path="/interview/:accessCode"
                element={<PublicInterview />}
              />
              <Route
                path="/interview/:accessCode/start"
                element={<InterviewStart />}
              />
              <Route
                path="/interview/:accessCode/compatibility"
                element={<InterviewFlow />}
              />
              <Route
                path="/interview/:accessCode/setup"
                element={<CandidatePreCheckWrapper />}
              />
              <Route
                path="/interview/:accessCode/video-interview"
                element={<VideoInterviewWrapper />}
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />

              {/* Jobs Routes - Protected with Profile Completion Requirement */}
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
                    <RequireProfileCompletion>
                      <NewJob />
                    </RequireProfileCompletion>
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/jobs/:id"
                element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <JobDetail />
                    </RequireProfileCompletion>
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/jobs/:id/edit"
                element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <JobEdit />
                    </RequireProfileCompletion>
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

              {/* New Interview - Protected with Profile Completion */}
              <Route
                path="/dashboard/interviews/new"
                element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <InterviewDetail />
                    </RequireProfileCompletion>
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
              <Route
                path="/dashboard/*"
                element={<Navigate to="/dashboard" replace />}
              />

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
