import { useEffect, useState } from "react";

interface QuizOption {
  id: number;
  label: string;
}

interface QuizQuestion {
  id: number;
  description: string;
  options: QuizOption[];
}

interface QuizResponse {
  interview_id: number;
  question_id: number;
  option_id: number;
}

interface McqResponsesTabProps {
  interviewId: number;
}

export default function McqResponsesTab({ interviewId }: McqResponsesTabProps) {
  const [questionsMap, setQuestionsMap] = useState<Record<number, string>>({});
  const [optionsMap, setOptionsMap] = useState<Record<number, string>>({});
  const [mcqResponses, setMcqResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all questions and options using the token (i_token)
        const i_token = localStorage.getItem('i_token');
        const questionRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/quiz-question`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${i_token}`,
          },
        });

        const questionData: QuizQuestion[] = await questionRes.json();
        console.log('Question Data:', questionData);  // Log the question data to verify

        const questionMap: Record<number, string> = {};
        const optionMap: Record<number, string> = {};

        // Map questions and options
        questionData.forEach((question) => {
          questionMap[question.id] = question.description;  // Use 'description' as the question text
          question.options.forEach((option) => {
            optionMap[option.id] = option.label;  // Use 'label' for options
          });
        });

        console.log('Questions Map:', questionMap);  // Log the questions map
        console.log('Options Map:', optionMap);      // Log the options map

        setQuestionsMap(questionMap);
        setOptionsMap(optionMap);

        // Fetch user's responses using the quiz_response_token
        const quizResponseToken = localStorage.getItem('token');
        const responseRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/quiz-response/recruiter-view?interview_id=${interviewId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${quizResponseToken}`,
          },
        });

        const responseData: QuizResponse[] = await responseRes.json();
        console.log('MCQ Responses:', responseData);  // Log the responses to verify

        setMcqResponses(responseData);

      } catch (error) {
        console.error("Error fetching MCQ data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [interviewId]);

  if (loading) {
    return <div>Loading MCQ Responses...</div>;
  }

  if (mcqResponses.length === 0) {
    return <div>No MCQ responses found for this interview.</div>;
  }

  return (
    <div className="space-y-4">
      {mcqResponses.map((response, idx) => {
        // Get the question and option text from the maps
        const questionText = questionsMap[response.question_id];
        const optionText = optionsMap[response.option_id];

        return (
          <div key={idx} className="p-4 border rounded-lg shadow-sm">
            <h4 className="font-semibold">
              Question: {questionText ? questionText : `Unknown Question (ID: ${response.question_id})`}
            </h4>
            <p className="text-gray-700">
              Selected Answer: {optionText ? optionText : `Unknown Option (ID: ${response.option_id})`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
