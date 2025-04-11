export interface JobData {
  id?: number;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  status?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  createdAt?: string;

  totalCandidatesCount?: number;
  pendingInterviewCount?: number;
  completedInterviewCount?: number;
  hiredCount?: number;
}

export interface CandidateJobData {
  id?: number;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  createdAt?: string;

  companyId: number;
  companyName: string;
  companyLogo: string | null;
}
