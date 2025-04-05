
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequireProfileCompletionProps {
  children: React.ReactNode;
}

const RequireProfileCompletion: React.FC<RequireProfileCompletionProps> = ({ children }) => {
  const { user, checkProfileCompletion } = useAuth();
  const location = useLocation();
  
  // Skip this check for the profile page itself to avoid redirect loops
  if (location.pathname.includes('/dashboard/profile')) {
    return <>{children}</>;
  }

  // Only restrict access to certain pages that require a complete profile
  const requiresCompleteProfile = [
    '/dashboard/jobs/new',
    '/dashboard/interviews/new',
  ].some(path => location.pathname.includes(path));

  if (requiresCompleteProfile && user && !checkProfileCompletion()) {
    return (
      <div className="container max-w-7xl py-6">
        <Alert variant="warning" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 mb-6">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Profile Completion Required</AlertTitle>
          <AlertDescription>
            You need to complete your profile before you can access this feature.
            <div className="mt-4">
              <Button onClick={() => window.location.href = '/dashboard/profile'}>
                Complete Your Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireProfileCompletion;
