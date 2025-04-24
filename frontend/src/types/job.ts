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
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  show_salary: boolean;
  requirements: string;
  benefits: string;
  status: string;
  createdAt: string;
  requires_dsa: boolean;
  dsa_questions?: Array<{
    title: string;
    description: string;
    difficulty: string;
    test_cases: Array<{
      input: string;
      expected_output: string;
    }>;
  }>;
} 