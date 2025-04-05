export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  status: 'new' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  createdAt: string;
  company_id: number;
  feedback?: string;
  interviewScore?: number;
  aiSummary?: string;
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
  feedback?: string;
  interviewScore?: number;
  aiSummary?: string;
}

export interface TranscriptItem {
  speaker: 'ai' | 'candidate';
  text: string;
  timestamp: string;
  originalText?: string; // For storing the original text before edits
  isEdited?: boolean;
}

export interface InterviewTranscript {
  candidateId: number;
  interviewId: number;
  items: TranscriptItem[];
  createdAt: string;
}