export interface InterviewData {
  id?: number;
  status?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  work_experience?: number;
  education?: string;
  skills?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  resume_text?: string;
  resume_match_score?: number;
  resume_match_feedback?: string;
  overall_score?: number;
  technical_skills_score?: number;
  communication_skills_score?: number;
  problem_solving_skills_score?: number;
  cultural_fit_score?: number;
  feedback?: string;
  created_at?: string;
  job_id?: number;
  video_url?: string;
  screenshot_urls?: string[];
  report_url?: string;
}

export interface GetInterviewsParams {
  job_id?: string;
  start?: number;
  limit?: number;
}
