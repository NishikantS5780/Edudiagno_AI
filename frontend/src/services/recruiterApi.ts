import { config } from "@/config";
import axios from "axios";

export const recruiterAPI = {
  getAnaltyics: async (recruiterId: number) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/recruiter/analytics`,
      {
        params: { recruiter_id: recruiterId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response;
  },
};
