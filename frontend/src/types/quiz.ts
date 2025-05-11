export interface QuizQuestion {
  id: number;
  title: string;
  type: "single" | "multiple" | "true_false";
  category: "technical" | "aptitude";
  options: Array<{
    id: number;
    label: string;
    correct: boolean;
  }>;
}

export interface QuizResponse {
  id: number;
  question_id: number;
  option_id: number;
  interview_id: number;
} 