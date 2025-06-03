import { authAPI } from "@/services/authApi";
import { RecruiterData, RecruiterLoginData } from "@/types/recruiter";
import { createContext, FC, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  login: (data: RecruiterLoginData) => Promise<void>;
  logout: () => Promise<void>;
  verifyLogin: () => Promise<void>;
  recruiter?: RecruiterData;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [recruiter, setRecruiter] = useState<RecruiterData>();

  const login = async (data: RecruiterLoginData) => {
    const res = await authAPI.loginRecruiter(data);
    localStorage.setItem(
      "token",
      res.headers.authorization.split("Bearer ")[1]
    );
    setRecruiter(res.data);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setRecruiter({});
  };

  const verifyLogin = async () => {
    const res = await authAPI.verifyLogin();
    setRecruiter(res.data);
  };

  return (
    <AuthContext.Provider value={{ login, logout, recruiter, verifyLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
