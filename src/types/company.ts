
export interface Company {
  id: string;
  user_id: string;
  name: string;
  cnpj?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location?: string | null;
  contract_type: string | null;
  custom_fields: Record<string, any> | null;
  status: 'open' | 'closed' | 'paused';
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from database
  benefits?: string | null;
  requirements?: string[] | null;
  differentials?: string[] | null;
  salary_range?: string | null;
  work_model?: string | null;
  custom_questions?: any[] | null;
  salary_info?: string | null;
  evaluation_criteria?: any[] | null;
}

export interface JobWithStats extends Job {
  candidatesCount: number;
  candidates?: any[];
}

export interface JobWithCompany {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  work_model?: string | null;
  requirements?: string[] | null;
  differentials?: string[] | null;
  salary_range?: string | null;
  benefits?: string | null;
  custom_questions?: any[] | null;
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
  phone?: string;
  resume_url?: string;
  status: 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired';
  is_favorite: boolean;
  notes?: string;
  interview_token?: string;
  interview_started_at?: string;
  interview_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewReport {
  id: string;
  candidate_id: string;
  summary?: string;
  alignment_analysis?: string;
  overall_score?: number;
  category_scores: Record<string, number>;
  recommendations?: string;
  transcript_url?: string;
  recording_url?: string;
  created_at: string;
}

export interface Report {
  id: string;
  candidate_name: string;
  job_title: string;
  overall_score: number;
  created_at: string;
  alignment_analysis: string;
  summary: string;
  category_scores: Record<string, number>;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  interview_credits: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end?: string;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  company_id: string;
  action_type: string;
  resource_id?: string;
  credits_used: number;
  metadata: Record<string, any>;
  created_at: string;
}
