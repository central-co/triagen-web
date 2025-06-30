export interface InterviewPlanRequest {
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    custom_answers?: Record<string, any>;
  };
  job: {
    id: string;
    title: string;
    description: string;
    location?: string;
    contract_type: string;
    evaluation_criteria: Record<string, any>;
    salary_info?: string;
    benefits?: string;
    custom_fields?: Record<string, any>;
  };
  company: {
    id: string;
    name: string;
    contact_email?: string;
    address?: string;
  };
}

export interface InterviewPlanResponse {
  interview_plan_id: string;
  success: boolean;
  error?: string;
}

export async function planInterviewWithLLM(data: InterviewPlanRequest): Promise<InterviewPlanResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração do Supabase não encontrada');
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/plan-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao planejar entrevista');
    }

    const result: InterviewPlanResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao planejar entrevista:', error);
    throw error;
  }
}