import { config } from "@/config";
import { DSAQuestion, TestCase } from "@/types/job";
import axios from "axios";

export const dsaAPI = {
  createDSAQuestion: async (job_id: string, dsaQuestion: DSAQuestion) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/dsa-question`,
      {
        job_id,
        ...dsaQuestion,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
  },
  deleteQuestion: async (id: number) => {
    await axios.post(`${config.API_BASE_URL}/dsa-question?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  createTestCase: async (data: TestCase, dsaQuestionId: number) => {
    await axios.post(
      `${config.API_BASE_URL}/dsa-test-case`,
      { ...data, dsa_question_id: dsaQuestionId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },
  deleteTestCase: async (id: number) => {
    await axios.delete(`${config.API_BASE_URL}/dsa-test-case?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  update: async (data: DSAQuestion) => {
    await axios.put(`${config.API_BASE_URL}/dsa-question`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  getDSAQuestion: async (jobId: string) => {
    const response = await axios.get(`${config.API_BASE_URL}/dsa-question`, {
      params: { job_id: jobId },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response;
  },
};
