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
  deleteInterview: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await api.delete(`/interview?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
};

export const jobAPI = {
  recruiterGetJob: async (jobId: string) => {
    const res = await api.get(`/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
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
