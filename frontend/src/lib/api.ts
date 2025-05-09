import { InterviewData } from "@/types/interview";
import { JobData } from "@/types/job";
import {
  RecruiterLoginData,
  RecruiterRegistrationData,
  RecruiterData,
} from "@/types/recruiter";
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  signup: async (data: RecruiterRegistrationData) => {
    await api.post("/recruiter", data);
  },
  login: async (data: RecruiterLoginData) => {
    const res = await api.post("/recruiter/login", data);
    return res;
  },
  verifyLogin: async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/recruiter/verify-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
  updateRecruiter: async (data: Partial<RecruiterData>) => {
    const token = localStorage.getItem("token");
    const res = await api.put("/recruiter", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
};

export const interviewAPI = {
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
    const res = await api.post("/interview", {
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
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
};

export const jobAPI = {
  recruiterGetAllJobs: async (params?: {
    limit?: number;
    start?: number;
    sort?: "ascending" | "descending";
    sort_field?:
      | "title"
      | "department"
      | "location"
      | "type"
      | "show_salary"
      | "status";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.start) queryParams.append("start", params.start.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.sort_field) queryParams.append("sort_field", params.sort_field);

    const res = await api.get(`/job/all?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  recruiterGetJob: async (jobId: string) => {
    const res = await api.get(`/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  updateJob: async (jobId: string, data: Partial<JobData>) => {
    const res = await api.put(
      `/job`,
      {
        id: parseInt(jobId),
        ...data,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  createJob: async (data: JobData) => {
    // First create the job without DSA questions
    const jobData = {
      title: data.title,
      description: data.description,
      department: data.department,
      city: data.city,
      location: data.location,
      type: data.type,
      min_experience: data.min_experience,
      max_experience: data.max_experience,
      duration_months: data.duration_months,
      key_qualification: data.key_qualification,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      currency: data.currency,
      show_salary: data.show_salary,
      requirements: data.requirements,
      benefits: data.benefits,
      status: data.status || "active",
    };

    const jobResponse = await api.post("/job", jobData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // If job has DSA questions, create them
    if (
      data.requires_dsa &&
      data.dsa_questions &&
      data.dsa_questions.length > 0
    ) {
      for (const question of data.dsa_questions) {
        // Create DSA question
        const dsaQuestionData = {
          title: question.title,
          description: question.description,
          difficulty: question.difficulty,
          job_id: jobResponse.data.id,
        };

        const questionResponse = await api.post(
          "/dsa-question",
          dsaQuestionData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Create test cases for this question
        if (question.test_cases && question.test_cases.length > 0) {
          for (const testCase of question.test_cases) {
            const testCaseData = {
              input: testCase.input,
              expected_output: testCase.expected_output,
              dsa_question_id: questionResponse.data.id,
            };

            await api.post("/dsa-test-case", testCaseData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
          }
        }
      }
    }

    return jobResponse;
  },
  candidateGetJob: async (jobId: string) => {
    const res = await api.get(`/job/candidate-view?id=${jobId}`);
    return res;
  },
  deleteJob: async (jobId: string) => {
    const res = await api.delete(`/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  generateDescription: async (
    jobTitle: string,
    department: string,
    location: string
  ) => {
    const res = await api.post("/job/generate-description", {
      title: jobTitle,
      department: department,
      location: location,
    });
    return res;
  },
  generateRequirements: async (
    jobTitle: string,
    department: string,
    location: string,
    keywords: string
  ) => {
    const res = await api.post("/job/generate-requirements", {
      title: jobTitle,
      department: department,
      location: location,
      keywords: keywords,
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

export const quizAPI = {
  getQuizQuestions: async (interviewId: string) => {
    const res = await api.get(`/quiz-question?interview_id=${interviewId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
    return res;
  },
  submitQuizResponses: async (
    responses: { question_id: number; option_id: number }[]
  ) => {
    const res = await api.post("/quiz-response", responses, {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
    return res;
  },
};

export default api;
