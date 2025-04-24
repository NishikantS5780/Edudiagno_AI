export interface InterviewData {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workExperience: number | null;
  education: string;
  skills: string;
  location: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
  resumeMatchScore: number | null;
  resumeMatchFeedback: string | null;
  overallScore: number | null;
  feedback: string | null;
}

export interface GetInterviewsParams {
  job_id?: string;
} 