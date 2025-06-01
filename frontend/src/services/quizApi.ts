import { config } from "@/config";
import { MCQuestion } from "@/types/job";
import axios from "axios";

export const quizAPI = {
  createQuizQuestions: async (data: MCQuestion, jobId: number, file?: File) => {
    const formData = new FormData();
    if (
      !data.title ||
      !data.type ||
      !data.category ||
      !data.time_seconds ||
      !file
    ) {
      return;
    }
    formData.append("description", data.title);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("job_id", jobId.toString());
    formData.append("time_seconds", data.time_seconds.toString());
    formData.append("image", file);

    const res = await axios.post(
      `${config.API_BASE_URL}/quiz-question`,
      formData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    return res;
  },
  createQuizOption: async (
    option: { label?: string; correct?: boolean },
    question_id?: number
  ) => {
    if (!option.label || !option.correct || !question_id) {
      return;
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
