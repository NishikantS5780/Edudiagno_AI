import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

interface GenerateQuestionParams {
  jobDescription: string;
  resumeText: string;
  questionTypes: string[];
  maxQuestions: number;
  interviewId: number;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface ProcessResponseParams {
  response: string;
  interviewId: number;
  conversationHistory: Array<{ role: string; content: string }>;
}

export function useInterviewResponseProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateQuestion = async ({
    jobDescription,
    resumeText,
    questionTypes,
    maxQuestions,
    interviewId,
    conversationHistory = [],
  }: GenerateQuestionParams): Promise<{
    question: string;
    speech: string;
  } | null> => {
    try {
      setIsProcessing(true);
      const response = await api.post("/interview-ai/generate-question", {
        job_description: jobDescription,
        resume_text: resumeText,
        question_types: questionTypes,
        max_questions: maxQuestions,
        interview_id: interviewId,
        conversation_history: conversationHistory,
      });
      return {
        question: response.data.question,
        speech: response.data.audio_base64,
      };
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Failed to generate question");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processResponse = async ({
    response,
    interviewId,
    conversationHistory,
  }: ProcessResponseParams): Promise<{ nextQuestion: string } | null> => {
    try {
      setIsProcessing(true);
      const apiResponse = await api.post("/interview-ai/process-response", {
        response,
        interviewId,
        conversationHistory,
      });
      return apiResponse.data;
    } catch (error) {
      console.error("Error processing response:", error);
      toast.error("Failed to process response");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await api.post("/interview-ai/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.transcript;
    } catch (error) {
      toast.error("Failed to transcribe audio");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    generateQuestion,
    processResponse,
    transcribeAudio,
  };
}
