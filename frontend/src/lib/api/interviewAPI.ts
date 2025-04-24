import axios from "axios";
import { API_URL } from "@/lib/constants";
import { GetInterviewsParams } from "@/types/interview";

export const interviewAPI = {
  getInterviews: async (params: GetInterviewsParams) => {
    const response = await axios.get(`${API_URL}/interviews/recruiter-view/all`, {
      params,
    });
    return response;
  },
  
  getInterview: async (id: string) => {
    const response = await axios.get(`${API_URL}/interviews/recruiter-view`, {
      params: { interview_id: id },
    });
    return response;
  },

  deleteInterview: async (id: string) => {
    const response = await axios.delete(`${API_URL}/interviews`, {
      params: { id },
    });
    return response;
  },
}; 