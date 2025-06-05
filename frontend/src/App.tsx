import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useParams } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import RequireAuth from "@/components/common/RequireAuth";
import { useEffect, useContext, useState } from "react";
import VideoInterview from "@/pages/Interview/VideoInterview";
import ScrollToTop from "@/components/common/ScrollToTop";

import Landing from "@/pages/Landing";
import Landing1 from "@/pages/Landing1";
import Landing2 from "@/pages/Landing2";
import Landing4 from "@/pages/Landing4";
import Features from "@/pages/Features";
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
import InterviewsPage from "@/pages/Dashboard/Interviews/InterviewsPage";
import InterviewDetail from "@/pages/Dashboard/Interviews/InterviewDetail";
import Profile from "@/pages/Dashboard/Profile";
import RecruiterEmailVerification from "@/pages/Dashboard/RecruiterEmailVerification";
import Settings from "@/pages/Dashboard/Settings";
import Help from "@/pages/Dashboard/Help";

import InterviewFlow from "@/pages/Interview/InterviewFlow";
import CandidatePreCheck from "@/components/interview/CandidatePreCheck";
import DSAPlayground from "@/pages/Interview/DSAPlayground";

import NotFound from "@/pages/NotFound";
import LoadingSpinner from "./components/common/LoadingSpinner";
import RequireProfileVerified from "@/components/common/RequireProfileVerified";
import InterviewPage from "@/pages/Interview/InterviewPage";
import MCQTest from "@/pages/Interview/MCQTest";
import InterviewReport from "@/pages/Dashboard/Interviews/InterviewReport";
import InterviewOverview from "@/pages/Interview/InterviewOverview";
import Dashboard4 from "@/pages/Dashboard4";
import Candidates4 from "@/pages/Candidates4";
import Jobs4 from "@/pages/Jobs4";
import Analytics4 from "@/pages/Analytics4";
import Settings4 from "@/pages/Settings4";

import AdminLayout from "@/pages/Admin/AdminLayout";
import AdminDashboard from "@/pages/Admin/Dashboard";
import UserManagement from "@/pages/Admin/Users";
import DevelopmentManagement from "@/pages/Admin/Development";
import ContentManagement from "@/pages/Admin/Content";
import SecurityCompliance from "@/pages/Admin/Security";
import SystemHealth from "@/pages/Admin/Health";
import SystemSettings from "@/pages/Admin/Settings";
import PlatformAnalytics from "@/pages/Admin/Analytics";
import BillingManagement from "@/pages/Admin/Billing";
import IntegrationManagement from "@/pages/Admin/Integrations";
import SupportManagement from "@/pages/Admin/Support";
import { InterviewData } from "./types/interview";
import { interviewAPI } from "./services/interviewApi";
import { JobData } from "./types/job";
import { jobAPI } from "./services/jobApi";

// import { interviewAPI, jobAPI } from "@/lib/api";

const App = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing1" element={<Landing1 />} />
        <Route path="/landing2" element={<Landing2 />} />
        <Route path="/landing4" element={<Landing4 />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route
              path="/recruiter-email-verification"
              element={<RecruiterEmailVerification />}
            /> */}
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interview/compatibility" element={<InterviewFlow />} />
        {/* <Route path="/interview/setup" element={<CandidatePreCheck />} /> */}
        {/* <Route
              path="/interview/video-interview"
              element={<VideoInterview />}
            /> */}
        {/* <Route path="/interview/flow" element={<InterviewFlow />} /> */}
        {/* <Route path="/interview/precheck" element={<CandidatePreCheck />} /> */}
        <Route path="/interview/dsa-playground" element={<DSAPlayground />} />
        <Route path="/interview/video" element={<VideoInterview />} />
        <Route path="/interview/overview" element={<InterviewOverview />} />
        <Route path="/mcq" element={<MCQTest />} />
        {/* Protected Dashboard Routes */}
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
        {/* <Route
              path="/dashboard/interviews/new"
              element={
                <RequireAuth>
                  <RequireProfileVerified>
                    <InterviewDetail />
                  </RequireProfileVerified>
                </RequireAuth>
              }
            /> */}
        <Route
          path="/dashboard/interviews/:id/report"
          element={
            <RequireAuth>
              <InterviewReportWrapper />
            </RequireAuth>
          }
        />
        {/* <Route
              path="/dashboard/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            /> */}
        {/* <Route
              path="/dashboard/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            /> */}
        {/* <Route
              path="/dashboard/help"
              element={
                <RequireAuth>
                  <Help />
                </RequireAuth>
              }
            /> */}

        {/* Admin Routes */}
        <Route
          path="/admin-test/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="development" element={<DevelopmentManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="security" element={<SecurityCompliance />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="analytics" element={<PlatformAnalytics />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="integrations" element={<IntegrationManagement />} />
          <Route path="support" element={<SupportManagement />} />
          Legacy Routes
        </Route>
        <Route path="/dashboard4" element={<Dashboard4 />} />
        <Route path="/candidates4" element={<Candidates4 />} />
        <Route path="/jobs4" element={<Jobs4 />} />
        <Route path="/analytics4" element={<Analytics4 />} />
        <Route path="/settings4" element={<Settings4 />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const InterviewReportWrapper = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState<InterviewData>({});
  const [job, setJob] = useState<JobData>({});
  useEffect(() => {
    if (!id) {
      return;
    }
    interviewAPI.getInterview(id).then((res) => {
      setInterview(res.data);
      jobAPI.getCurrentRecruiterJob(res.data.job_id.toString()).then((res) => {
        setJob(res.data);
      });
    });
  }, []);

  if (!interview || !job) return null;
  return <InterviewReport jobTitle={job.title || ""} />;
};

export default App;
