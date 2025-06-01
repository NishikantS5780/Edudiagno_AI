import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

interface RequireProfileCompletionProps {
  children: React.ReactNode;
}

const RequireProfileVerified: React.FC<RequireProfileCompletionProps> = ({
  children,
}) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    toast("Something went wrong");
    return;
  }
  const location = useLocation();

  if (location.pathname.includes("/dashboard/profile")) {
    return <>{children}</>;
  }

  if (authContext.recruiter && authContext.recruiter.verified) {
    return (
      <div className="container max-w-7xl py-6">
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 mb-6">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Profile verification Required</AlertTitle>
          <AlertDescription>
            You need to verify your profile before you can access this feature.
            <div className="mt-4">
              <Button
                onClick={() => (window.location.href = "/dashboard/profile")}
              >
                Verify Your Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireProfileVerified;
