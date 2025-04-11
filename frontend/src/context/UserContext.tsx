import { recruiterAPI } from "@/lib/api";
import {
  RecruiterData,
  RecruiterLoginData,
  RecruiterRegistrationData,
} from "@/types/recruiter";
import { createContext, useEffect, useState } from "react";
import { replace, useNavigate } from "react-router-dom";

interface UserContextType {
  recruiter: RecruiterData;
  isLoading: Boolean;
  signup: (data: RecruiterRegistrationData) => Promise<void>;
  login: (data: RecruiterLoginData) => Promise<void>;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }) => {
  const [recruiter, setRecruiter] = useState<RecruiterData>();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLogin = async () => {
      if (localStorage.getItem("token")) {
        const res = await recruiterAPI.verifyLogin();
        setRecruiter({ name: res.data.name, verified: res.data.verified });
        navigate("dashboard", { replace: true });
      }
    };
    verifyLogin();
    setIsLoading(false);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
