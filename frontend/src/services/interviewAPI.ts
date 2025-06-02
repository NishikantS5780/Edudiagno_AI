import axios from "axios";
import { GetInterviewsParams } from "@/types/interview";
import { config } from "@/config";

export const interviewAPI = {
  getInterviews: async (params: GetInterviewsParams) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/interview/recruiter-view/all`,
      {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  },

  getInterview: async (id: string) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/interviews/recruiter-view`,
      {
        params: { interview_id: id },
      }
    );
    return response;
  },

  deleteInterview: async (id: string) => {
    const response = await axios.delete(`${config.API_BASE_URL}/interviews`, {
      params: { id },
    });
    return response;
  },
};
