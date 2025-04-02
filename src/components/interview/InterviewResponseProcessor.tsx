
import { useCallback } from 'react';

// Enhanced processor for better interview response handling
const useInterviewResponseProcessor = () => {
  // Process a candidate's response with improved feedback
  const processResponse = useCallback((questionId: string, responseText: string) => {
    return new Promise<{score: number; feedback: string; analysisPoints: string[]}>((resolve) => {
      // Simulate processing delay (2-4 seconds)
      const delay = 2000 + Math.random() * 2000;
      
      setTimeout(() => {
        // Generate a random score between 60 and 95
        const score = Math.floor(Math.random() * 36) + 60;
        
        // Provide more detailed feedback based on score
        let feedback = "";
        let analysisPoints: string[] = [];
        
        if (score > 85) {
          feedback = "Your response demonstrates strong understanding and relevant experience.";
          analysisPoints = [
            "Excellent use of specific examples",
            "Clear communication of complex concepts",
            "Demonstrated problem-solving abilities",
            "Showed deep technical knowledge"
          ];
        } else if (score > 70) {
          feedback = "Good response overall with some areas that could be expanded upon.";
          analysisPoints = [
            "Good level of technical understanding",
            "Could provide more specific examples",
            "Clear communication style",
            "Consider quantifying your achievements more"
          ];
        } else {
          feedback = "Adequate response but lacking specific examples or details.";
          analysisPoints = [
            "Basic understanding demonstrated",
            "Need more specific examples from your experience",
            "Consider structuring your response more clearly",
            "Include more technical details when relevant"
          ];
        }
        
        resolve({ score, feedback, analysisPoints });
      }, delay);
    });
  }, []);

  // Generate AI follow-up questions with improved transitions
  const generateFollowup = useCallback((questionId: string, responseText: string, questionIndex: number, totalQuestions: number) => {
    return new Promise<string>((resolve) => {
      const delay = 1500 + Math.random() * 1500;
      
      setTimeout(() => {
        // For the last question, provide a conclusion
        if (questionIndex === totalQuestions - 1) {
          const conclusions = [
            "Thank you for all your responses. That concludes our interview. I appreciate your time and thoughtful answers.",
            "That completes all our questions. Thank you for sharing your experiences and insights. We'll be in touch with next steps soon.",
            "Thank you for completing this interview. Your responses have been recorded and will be reviewed by the hiring team.",
            "This concludes our interview session. Thank you for your detailed responses and for taking the time to share your expertise with us."
          ];
          
          const randomConclusion = conclusions[Math.floor(Math.random() * conclusions.length)];
          resolve(randomConclusion);
          return;
        }
        
        // Otherwise, provide a transition to the next question
        const transitions = [
          "Thank you for that detailed response. Let's move on to the next topic.",
          "I appreciate your insights on this. Let's continue with our next question.",
          "That gives me a good understanding of your experience in this area. Now I'd like to ask about something different.",
          "Thank you for sharing your thoughts on this topic. Let's explore another area now.",
          "That's helpful context. I'd like to shift our discussion to another important aspect now."
        ];
        
        const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
        resolve(randomTransition);
      }, delay);
    });
  }, []);

  return { processResponse, generateFollowup };
};

export default useInterviewResponseProcessor;
