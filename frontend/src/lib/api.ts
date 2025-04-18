import { InterviewData } from "@/types/interview";
import { JobData } from "@/types/job";
import {
  RecruiterLoginData,
  RecruiterRegistrationData,
} from "@/types/recruiter";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 204; // Accept 204 No Content
  },
});

export const recruiterAPI = {
  signup: async (data: RecruiterRegistrationData) => {
    await api.post("/recruiter", data);
  },
  login: async (data: RecruiterLoginData) => {
    const res = await api.post("/recruiter/login", data);
    return res;
  },
  verifyLogin: async () => {
    const res = await api.get("/recruiter/verify-token", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
};

export const interviewAPI = {
  getInterviews: async (params?: {
    limit?: number;
    start?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.start) queryParams.append('start', params.start.toString());

    const res = await api.get(`/interview/recruiter-view/all?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  candidateGetInterview: async () => {
    const res = await api.get("/interview", {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
    return res;
  },
  createInterview: async (data: InterviewData, jobId: number) => {
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
    });
    return res;
  },
  deleteInterview: async (id: number) => {
    const res = await api.delete(`/interview?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  analyzeCandidate: async () => {
    const res = await api.post("/interview/analyze-resume", undefined, {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
    return res;
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await api.put("/interview/upload-resume", formData, {
      headers: {
        "Content-Type": "multipart/formdata",
        Authorization: `Bearer ${localStorage.getItem("i_token")}`,
      },
    });
  },
  generateQuestions: async () => {
    const res = await api.post(
      "/interview-question-and-response/generate-questions",
      undefined,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },
  analyzeTranscript: async (transcript: string, jobContext: any) => {
    const res = await api.post(
      "/interview/analyze-transcript",
      { transcript, jobContext },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res.data;
  },
  submitAudioResponse: async (audioFile: File, question_order_number) => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);
    formData.append("question_id", question_order_number);

    const res = await api.put(
      "interview-question-and-response/submit-audio-response",
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
  generateFeedback: async () => {
    const res = await api.put("/interview/generate-feedback", undefined, {
      headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
    });
    return res.data;
  },
};

export const jobAPI = {
  recruiterGetAllJobs: async (params?: {
    limit?: number;
    start?: number;
    sort?: 'ascending' | 'descending';
    sort_field?: 'title' | 'department' | 'location' | 'type' | 'show_salary' | 'status';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.start) queryParams.append('start', params.start.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.sort_field) queryParams.append('sort_field', params.sort_field);

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
  createJob: async (data: JobData) => {
    const transformedData = {
      title: data.title,
      description: data.description,
      department: data.department,
      city: data.city,
      location: data.location,
      type: data.type,
      min_experience: data.min_experience,
      max_experience: data.max_experience,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      currency: data.currency,
      show_salary: data.show_salary,
      requirements: data.requirements,
      benefits: data.benefits,
      status: data.status || 'active'
    };

    const res = await api.post(
      "/job",
      transformedData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
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
};

export const textAPI = {
  textToSpeech: async (text: string) => {
    const res = api.post("/text/to-speech", { text });
    return res;
  },
};

export const resumeAPI = {
  extractResumeData: async (resume) => {
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

export default api;
