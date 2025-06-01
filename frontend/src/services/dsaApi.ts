import { config } from "@/config";
import { DSAQuestion } from "@/types/job";
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
};
