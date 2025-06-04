import { config } from "@/config";
import { MCQuestion } from "@/types/job";
import axios from "axios";

export const quizAPI = {
  createQuizQuestions: async (data: MCQuestion, jobId: number, file?: File) => {
    if (!data.description || !data.type || !data.category) {
      throw new Error("Missing details");
    }
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("job_id", jobId.toString());
    if (data.time_seconds) {
      formData.append("time_seconds", data.time_seconds.toString());
    }
    if (file) {
      formData.append("image", file);
    }

    const res = await axios.post(
      `${config.API_BASE_URL}/quiz-question`,
      formData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  deleteQuizQuestion: async (id: number) => {
    await axios.delete(
      `${config.API_BASE_URL}/quiz-question?question_id=${id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },
  createQuizOption: async (
    option: { label?: string; correct?: boolean },
    question_id?: number
  ) => {
    if (!option.label || !question_id) {
      return;
    }
    if (!option.correct) {
      option.correct = false;
    }

    const res = await axios.post(
      `${config.API_BASE_URL}/quiz-option`,
      {
        label: option.label,
        correct: option.correct,
        question_id: question_id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  },
  getByJobId: async (jobId: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/quiz-question?job_id=${jobId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },
  getQuizQuestions: async (interviewId: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/quiz-question?interview_id=${interviewId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },
  submitQuizResponses: async (
    responses: { question_id: number; option_id: number }[]
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/quiz-response`,
      responses,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },
};
