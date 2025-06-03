import { FC, useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return toast.error("Something went wrong");
  }

  useEffect(() => {
    if (!authContext.recruiter) {
      authContext.verifyLogin().catch((_) => {
        return <Navigate to="/login" state={{ from: location }} replace />;
      });
    }
  }, []);

  return <>{authContext && authContext.recruiter && children}</>;
};

export default RequireAuth;
