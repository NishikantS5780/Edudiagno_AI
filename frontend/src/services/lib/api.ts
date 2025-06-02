import { InterviewData } from "@/types/interview";
import { JobData } from "@/types/job";
import axios, { AxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include our custom properties
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryCount?: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Add retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 204;
  },
});

// Add response interceptor for retry logic
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !(config as CustomAxiosRequestConfig).retry) {
    return Promise.reject(err);
  }

  const customConfig = config as CustomAxiosRequestConfig;
  customConfig.retryCount = customConfig.retryCount || 0;

  if (customConfig.retryCount >= MAX_RETRIES) {
    return Promise.reject(err);
  }

  customConfig.retryCount += 1;
  await sleep(RETRY_DELAY * customConfig.retryCount);

  return api(config);
});

// Add request interceptor for network error handling
api.interceptors.request.use(
  (config) => {
    (config as CustomAxiosRequestConfig).retry = true; // Enable retry for all requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const recruiterAPI = {
  updateRecruiter: async (data: Partial<RecruiterData>) => {
    const token = localStorage.getItem("token");
    const res = await api.put("/recruiter", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
};

export const interviewAPI = {
  getInterviewRecruiterView: async (id: string) => {
    const token = localStorage.getItem("token");
    const interviewResponse = await api.get(
      `/interview/recruiter-view?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (interviewResponse.status != 200) {
      throw new Error(`Failed to fetch interview: ${interviewResponse.status}`);
    }
    return interviewResponse.data;
  },
  getInterviews: async (params?: {
    limit?: number;
    start?: number;
    job_id?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.start) queryParams.append("start", params.start.toString());
    if (params?.job_id) queryParams.append("job_id", params.job_id);

    const token = localStorage.getItem("token");
    const res = await api.get(
      `/interview/recruiter-view/all?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  candidateGetInterview: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.get("/interview", {
      headers: { Authorization: `Bearer ${iToken}` },
    });
    return res;
  },
  createInterview: async (data: InterviewData, jobId: number) => {
    const token = localStorage.getItem("token");
    const res = await api.post(
      "/interview",
      {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        work_experience: data.workExperience,
        education: data.education,
        skills: data.skills,
        location: data.location,
        linkedin_url: data.linkedinUrl,
        portfolio_url: data.portfolioUrl,
        resume_text: data.resumeText,
        job_id: jobId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  deleteInterview: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await api.delete(`/interview?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
  analyzeCandidate: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.post("/interview/analyze-resume", undefined, {
      headers: { Authorization: `Bearer ${iToken}` },
    });
    return res;
  },
  uploadResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const iToken = localStorage.getItem("i_token");
      const response = await api.put("/interview/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${iToken}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  },
  generateQuestions: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.post(
      "/interview-question-and-response/generate-questions",
      undefined,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },
  analyzeTranscript: async (transcript: string, jobContext: any) => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.post(
      "/interview/analyze-transcript",
      { transcript, jobContext },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res.data;
  },
  submitAudioResponse: async (
    audioFile: File,
    question_order_number: number
  ) => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);
    formData.append("question_id", question_order_number.toString());

    const iToken = localStorage.getItem("i_token");
    const res = await api.put(
      "interview-question-and-response/submit-audio-response",
      formData,
      {
        headers: {
          Authorization: `Bearer ${iToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res;
  },
  generateFeedback: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.put("/interview/generate-feedback", undefined, {
      headers: { Authorization: `Bearer ${iToken}` },
    });
    return res.data;
  },
  submitTextResponse: async (question_order: number, answer: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.put(
      "/interview-question-and-response/submit-text-response",
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
  getInterviewQuestionsAndResponses: async (interviewId: string) => {
    const token = localStorage.getItem("token");
    const res = await api.get(
      `/interview-question-and-response?interview_id=${interviewId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  sendOtp: async (email: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.post(
      "/interview/send-otp",
      { email },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await api.post(
      "/interview/verify-otp",
      { email, otp },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res.data;
  },
};

export const jobAPI = {
  recruiterGetJob: async (jobId: string) => {
    const res = await api.get(`/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  candidateGetJob: async (jobId: string) => {
    const res = await api.get(`/job/candidate-view?id=${jobId}`);
    return res;
  },
  getMcqQuestions: async (jobId: string) => {
    const res = await api.get(`/quiz-question?job_id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  updateMcqQuestions: async (jobId: string, questions: any[]) => {
    // First update each question
    for (const question of questions) {
      await api.put(
        `/quiz-question`,
        {
          id: question.id,
          description: question.description,
          type: question.type,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Then update each option
      for (const option of question.options) {
        await api.put(
          `/quiz-option`,
          {
            id: option.id,
            label: option.label,
            correct: option.correct,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    }
  },
};

export const textAPI = {
  textToSpeech: async (text: string) => {
    const res = api.post("/text/to-speech", { text });
    return res;
  },
};

export const resumeAPI = {
  extractResumeData: async (resume: File) => {
    const formdata = new FormData();
    formdata.append("file", resume);
    const res = await api.post("/resume/parse", formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },
};

export const userAPI = {
  getCurrentUser: async () => {
    const res = await api.get("/user/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put("/user/profile", data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },
};

export const dsaAPI = {
  runCode: async (data: any) => {
    await api.post("/dsa-response", data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
  },
};

export default api;
