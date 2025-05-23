export interface InterviewData {
  id?: number;
  status?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  workExperience?: number;
  education?: string;
  skills?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  resumeText?: string;
  resumeMatchScore?: number;
  resumeMatchFeedback?: string;
  overallScore?: number;
  technicalSkillsScore?: number;
  communicationSkillsScore?: number;
  problemSolvingSkillsScore?: number;
  culturalFitScore?: number;
  feedback?: string;
  createdAt?: string;
  jobId?: number;
  videoUrl?: string;
  screenshot_urls?: string[];
}

export interface GetInterviewsParams {
  job_id?: string;
}
