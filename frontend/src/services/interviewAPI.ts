import axios from "axios";
import { GetInterviewsParams, InterviewData } from "@/types/interview";
import { config } from "@/config";

export const interviewAPI = {
  createInterview: async (data: InterviewData, jobId: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview`,
      {
        ...data,
        job_id: jobId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
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
      `${config.API_BASE_URL}/interview/recruiter-view`,
      {
        params: { id },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response;
  },

  candidateGetInterview: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.get(`${config.API_BASE_URL}/interview`, {
      headers: { Authorization: `Bearer ${iToken}` },
    });
    return res;
  },

  deleteInterview: async (id: string) => {
    const response = await axios.delete(`${config.API_BASE_URL}/interviews`, {
      params: { id },
    });
    return response;
  },

  extractResumeData: async (resume: File) => {
    const formdata = new FormData();
    formdata.append("file", resume);
    const res = await axios.post(
      `${config.API_BASE_URL}/resume/parse`,
      formdata,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res;
  },

  uploadResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const iToken = localStorage.getItem("i_token");
      const response = await axios.put(
        `${config.API_BASE_URL}/interview/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${iToken}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  },

  analyzeCandidate: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/analyze-resume`,
      undefined,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  sendOtp: async (email: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/send-otp`,
      { email },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/verify-otp`,
      { email, otp },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res.data;
  },

  textToSpeech: async (text: string) => {
    const res = axios.post(`${config.API_BASE_URL}/text/to-speech`, { text });
    return res;
  },

  speechToText: async (file: File) => {
    const formData = new FormData();
    formData.append("audio_file", file);

    const res = await axios.post(
      `${config.API_BASE_URL}/audio/to-text`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("i_token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res;
  },

  submitTextResponse: async (question_order: number, answer: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.put(
      `${config.API_BASE_URL}/interview-question-and-response/submit-text-response`,
      {
        question_order,
        answer,
      },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  generateFeedback: async (transcript: string, jobRequirements: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.put(
      `${config.API_BASE_URL}/interview/generate-feedback`,
      JSON.stringify({
        transcript,
        job_requirements: jobRequirements,
      }),
      {
        headers: {
          Authorization: `Bearer ${iToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return res.data;
  },

  generateQuestions: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview-question-and-response/generate-questions`,
      undefined,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  getInterviewQuestionsAndResponses: async (interviewId: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${config.API_BASE_URL}/interview-question-and-response?interview_id=${interviewId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
};
