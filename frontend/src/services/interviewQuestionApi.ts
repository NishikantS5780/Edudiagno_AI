import { config } from "@/config";
import { InterviewQuestion } from "@/types/job";
import axios from "axios";

export const interviewQuestionAPI = {
  create: async (question: InterviewQuestion, jobId: number) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/recruiter/interview-question`,
      {
        question: question.question,
        question_type: question.question_type,
        order_number: question.order_number,
        job_id: jobId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  },
  getByJob: async (jobId: number) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/interview-question?job_id=${jobId}`
    );
    return res;
  },
};
