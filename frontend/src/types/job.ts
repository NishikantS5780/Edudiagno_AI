export interface JobData {
  id: number;
  title: string;
  description: string;
  department: string;
  city: string;
  location: string;
  type: string;
  min_experience: number;
  max_experience: number;
  duration_months: number;
  key_qualification: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  show_salary: boolean;
  requirements: string;
  benefits: string;
  status: string;
  createdAt: string;
  requires_dsa: boolean;
  requires_mcq: boolean;
  dsa_questions?: Array<{
    title: string;
    description: string;
    difficulty: string;
    test_cases: Array<{
      input: string;
      expected_output: string;
    }>;
  }>;
  mcq_questions?: Array<{
    title: string;
    type: "single" | "multiple" | "true_false";
    category: "technical" | "aptitude";
    options: string[];
    correct_options: number[];
  }>;
  quiz_time_minutes: number | null;
  mcq_timing_mode: 'per_question' | 'whole_test';
  company_id: number;
  updated_at: string;
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
  currency?: string;
  createdAt?: string;
  requires_dsa?: boolean;
  city?: string;
  dsa_questions?: Array<{
    title: string;
    description: string;
    difficulty: string;
    test_cases: Array<{
      input: string;
      expected_output: string;
    }>;
  }>;

  companyId: number;
  companyName: string;
  companyLogo: string | null;
} 