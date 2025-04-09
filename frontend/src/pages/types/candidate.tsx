export interface Candidate {
    id: number;
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    status: 'new' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';
    createdAt: string;
    company_id: number;
  }
  
  export interface CandidateCreate {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
  }
  
  export interface CandidateUpdate {
    name?: string;
    email?: string;
    phone?: string;
    resumeUrl?: string;
    status?: 'new' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  }
  