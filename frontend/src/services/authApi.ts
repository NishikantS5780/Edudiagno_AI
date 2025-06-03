import { config } from "@/config";
import {
  RecruiterLoginData,
  RecruiterRegistrationData,
} from "@/types/recruiter";
import axios from "axios";

export const authAPI = {
  signupRecruiter: async (data: RecruiterRegistrationData) => {
    await axios.post(`${config.API_BASE_URL}/recruiter`, data);
  },
  loginRecruiter: async (data: RecruiterLoginData) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/recruiter/login`,
      data
    );
    return res;
  },
  verifyLogin: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${config.API_BASE_URL}/recruiter/verify-token`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
};
