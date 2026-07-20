

interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location?: string | null;
  contract_type: string | null;
  status: 'open' | 'closed' | 'paused';
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from database
  benefits?: string | null;
  mandatory_requirements?: string[] | null;
  desirable_requirements?: string[] | null;
  salary_range?: string | null;
  work_model?: string | null;
  pre_interview_questions?: Array<{ id: number; question: string }> | null;
  salary_info?: string | null;
  interview_duration_minutes?: number | null;
  team_context?: string | null;
}

export interface JobWithStats extends Job {
  candidatesCount: number;
  candidates?: Array<{ count: number }>;
}

export interface JobWithCompany {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  work_model?: string | null;
  mandatory_requirements?: string[] | null;
  desirable_requirements?: string[] | null;
  salary_range?: string | null;
  benefits?: string | null;
  pre_interview_questions?: Array<{ id: number; question: string }> | null;
  company: {
    id: string;
    name: string;
    contact_email?: string | null;
    address?: string | null;
  };
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone?: string | null;
  /** Free-text resume summary submitted with the application. */
  resume_url?: string;
  /** Screening answers keyed by the job's pre_interview_questions ids. */
  pre_interview_answers?: Record<string, unknown> | null;
  status: 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired';
  is_favorite: boolean;
  notes?: string;
  interview_started_at?: string;
  interview_completed_at?: string;
  created_at: string;
  updated_at: string;
}


export interface Report {
  id: string;
  candidate_name: string;
  job_title: string;
  overall_score: number;
  created_at: string;
  highlights: string;
  summary: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}



