import { createClient } from 'npm:@supabase/supabase-js@2';

interface InterviewPlanRequest {
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

interface InterviewPlanResponse {
  interview_plan_id: string;
  success: boolean;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Função para gerar um ID único para o plano de entrevista
function generateInterviewPlanId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `plan_${timestamp}_${randomStr}`;
}

// Função para preparar o prompt para a LLM
function prepareInterviewPrompt(data: InterviewPlanRequest): string {
  const { candidate, job, company } = data;
  
  // Extrair critérios de avaliação
  const evaluationCriteria = Object.entries(job.evaluation_criteria || {})
    .map(([id, criterion]: [string, any]) => 
      `- ${criterion.name} (Peso: ${criterion.weight}/10): ${criterion.description || 'Sem descrição'}`
    )
    .join('\n');

  // Preparar informações do candidato
  const candidateInfo = `
Nome: ${candidate.name}
Email: ${candidate.email}
${candidate.phone ? `Telefone: ${candidate.phone}` : ''}
${candidate.resume_url ? `Currículo: ${candidate.resume_url}` : ''}
${candidate.custom_answers && Object.keys(candidate.custom_answers).length > 0 
  ? `Respostas personalizadas: ${JSON.stringify(candidate.custom_answers, null, 2)}` 
  : ''}
  `.trim();

  // Preparar informações da vaga
  const jobInfo = `
Título: ${job.title}
Descrição: ${job.description}
${job.location ? `Localização: ${job.location}` : ''}
Tipo de contrato: ${job.contract_type}
${job.salary_info ? `Salário: ${job.salary_info}` : ''}
${job.benefits ? `Benefícios: ${job.benefits}` : ''}
  `.trim();

  // Preparar informações da empresa
  const companyInfo = `
Nome: ${company.name}
${company.contact_email ? `Email: ${company.contact_email}` : ''}
${company.address ? `Endereço: ${company.address}` : ''}
  `.trim();

  return `
Você é um especialista em recrutamento e deve criar um plano de entrevista personalizado.

INFORMAÇÕES DA EMPRESA:
${companyInfo}

INFORMAÇÕES DA VAGA:
${jobInfo}

CRITÉRIOS DE AVALIAÇÃO (com pesos de importância):
${evaluationCriteria || 'Nenhum critério específico definido'}

INFORMAÇÕES DO CANDIDATO:
${candidateInfo}

INSTRUÇÕES:
1. Crie um roteiro de entrevista estruturado que avalie todos os critérios listados
2. Priorize perguntas baseadas nos pesos dos critérios (maior peso = mais perguntas/tempo)
3. Inclua perguntas comportamentais e técnicas relevantes para a vaga
4. Considere o perfil do candidato para personalizar as perguntas
5. Mantenha um tom profissional mas acolhedor
6. A entrevista deve durar entre 15-25 minutos

FORMATO DE RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
  "interview_plan": {
    "introduction": "Texto de introdução para o candidato",
    "questions": [
      {
        "category": "categoria da pergunta",
        "question": "pergunta a ser feita",
        "evaluation_criterion": "critério que esta pergunta avalia",
        "expected_duration": "tempo estimado em minutos",
        "follow_up_questions": ["pergunta de follow-up opcional"]
      }
    ],
    "conclusion": "Texto de encerramento da entrevista",
    "evaluation_notes": "Notas sobre como avaliar as respostas"
  }
}
  `.trim();
}

// Função para chamar a LLM (placeholder - você deve implementar com sua LLM preferida)
async function callLLM(prompt: string): Promise<any> {
  // IMPORTANTE: Esta é uma implementação placeholder
  // Você deve substituir por sua integração real com a LLM
  
  // Exemplo de integração com OpenAI:
  /*
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em recrutamento e entrevistas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
  */

  // Por enquanto, retorna um plano de exemplo
  return {
    interview_plan: {
      introduction: "Olá! Bem-vindo à entrevista. Vou fazer algumas perguntas para conhecer melhor seu perfil e experiência.",
      questions: [
        {
          category: "Apresentação",
          question: "Pode se apresentar e falar um pouco sobre sua trajetória profissional?",
          evaluation_criterion: "Comunicação",
          expected_duration: "3 minutos",
          follow_up_questions: ["O que mais te motiva no trabalho?"]
        },
        {
          category: "Experiência Técnica",
          question: "Conte sobre um projeto desafiador que você trabalhou recentemente.",
          evaluation_criterion: "Experiência Técnica",
          expected_duration: "5 minutos",
          follow_up_questions: ["Como você lidou com as dificuldades?", "O que aprendeu com essa experiência?"]
        }
      ],
      conclusion: "Obrigado pela conversa! Em breve você receberá um retorno sobre sua candidatura.",
      evaluation_notes: "Avaliar clareza na comunicação, conhecimento técnico demonstrado e fit cultural."
    }
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const data: InterviewPlanRequest = await req.json();

    // Validar dados obrigatórios
    if (!data.candidate || !data.job || !data.company) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos: candidate, job e company são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Gerar ID único para o plano de entrevista
    const interviewPlanId = generateInterviewPlanId();

    // Preparar prompt para a LLM
    const prompt = prepareInterviewPrompt(data);

    // Chamar a LLM para gerar o plano de entrevista
    let interviewPlan;
    try {
      interviewPlan = await callLLM(prompt);
    } catch (llmError) {
      console.error('Erro ao chamar LLM:', llmError);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar plano de entrevista',
          success: false 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Salvar o plano de entrevista no Supabase (opcional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Você pode criar uma tabela 'interview_plans' para armazenar os planos
      // Por enquanto, apenas logamos o sucesso
      console.log(`Plano de entrevista gerado: ${interviewPlanId}`);
    }

    // Retornar resposta de sucesso
    const response: InterviewPlanResponse = {
      interview_plan_id: interviewPlanId,
      success: true
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro no planejamento de entrevista:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});