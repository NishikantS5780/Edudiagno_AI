import { recruiterAPI } from "@/lib/api";
import {
  RecruiterData,
  RecruiterLoginData,
  RecruiterRegistrationData,
} from "@/types/recruiter";
import { createContext, useContext, useEffect, useState } from "react";
import { replace, useNavigate } from "react-router-dom";

interface UserContextType {
  recruiter: RecruiterData;
  isLoading: Boolean;
  signup: (data: RecruiterRegistrationData) => Promise<void>;
  login: (data: RecruiterLoginData) => Promise<void>;
  logout: () => Promise<void>;
  setRecruiter: (recruiter: RecruiterData) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [recruiter, setRecruiter] = useState<RecruiterData>();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLogin = async () => {
      if (localStorage.getItem("token")) {
        try {
          const res = await recruiterAPI.verifyLogin();
          setRecruiter({ name: res.data.name, verified: res.data.verified });
          // Only navigate to dashboard if we're on the login or landing page
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/login") {
            navigate("dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };
    verifyLogin();
  }, []);

  return (
    <UserContext.Provider
      value={{
        isLoading: isLoading,
        recruiter: recruiter,
        signup: async (data: RecruiterRegistrationData) => {
          await recruiterAPI.signup(data);
        },
        login: async (data: RecruiterLoginData) => {
          const res = await recruiterAPI.login(data);
          localStorage.setItem(
            "token",
            res.headers["authorization"].split("Bearer ")[1]
          );
          setRecruiter({ name: res.data.name, verified: res.data.verified });
        },
        logout: async () => {
          localStorage.removeItem("token");
        },
        setRecruiter: (recruiter: RecruiterData) => {
          setRecruiter(recruiter);
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
