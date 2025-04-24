export interface InterviewData {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workExperience: number;
  education: string;
  skills: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  resumeText: string;
  resumeMatchScore: number;
  resumeMatchFeedback: string;
  overallScore: number;
  feedback: string;
  createdAt: string;
  jobId: number;
  technical_skills_score: number;
  communication_skills_score: number;
  problem_solving_skills_score: number;
  cultural_fit_score: number;
}

export interface GetInterviewsParams {
  job_id?: string;
} 