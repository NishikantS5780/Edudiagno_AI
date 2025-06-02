import { config } from "@/config";
import { JobData } from "@/types/job";
import axios from "axios";

export const jobAPI = {
  createJob: async (data: JobData) => {
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

    const jobResponse = await axios.post(
      `${config.API_BASE_URL}/job`,
      jobData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    return jobResponse;
  },
  getCurrentRecruiterAllJobs: async (params: {
    limit?: number;
    start?: number;
    sort?: "ascending" | "descending";
    sort_field?:
      | "title"
      | "department"
      | "city"
      | "type"
      | "show_salary"
      | "status";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.start) queryParams.append("start", params.start.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.sort_field) queryParams.append("sort_field", params.sort_field);

    const res = await axios.get(
      `${config.API_BASE_URL}/job/all?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  getCurrentRecruiterJob: (jobId: string) =>
    axios.get(`${config.API_BASE_URL}/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
  updateJob: async (jobId: string, data: JobData) => {
    const res = await axios.put(
      `${config.API_BASE_URL}/job`,
      {
        ...data,
        id: parseInt(jobId),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  generateDescription: async (
    jobTitle: string,
    department: string,
    location: string,
    keyQualification: string,
    minExperience: string,
    maxExperience: string
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/job/generate-description`,
      {
        title: jobTitle,
        department: department,
        location: location,
        key_qualification: keyQualification,
        min_experience: minExperience,
        max_experience: maxExperience,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  generateRequirements: async (
    jobTitle: string,
    department: string,
    location: string,
    keyQualification: string,
    minExperience: string,
    maxExperience: string,
    keywords: string
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/job/generate-requirements`,
      {
        title: jobTitle,
        department: department,
        location: location,
        key_qualification: keyQualification,
        min_experience: minExperience,
        max_experience: maxExperience,
        keywords: keywords,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  deleteJob: async (jobId: string) => {
    const res = await axios.delete(`${config.API_BASE_URL}/job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
};
