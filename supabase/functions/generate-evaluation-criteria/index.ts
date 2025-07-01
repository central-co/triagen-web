import { createClient } from 'npm:@supabase/supabase-js@2';

interface JobData {
  title: string;
  description: string;
  work_model: string;
  requirements: string[];
  differentials: string[];
  salary_range?: string;
  benefits?: string;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  type: 'hard_skill' | 'soft_skill' | 'experience' | 'cultural_fit';
  weight: number; // 1-5
  description: string;
}

interface GenerateEvaluationCriteriaRequest {
  job: JobData;
}

interface GenerateEvaluationCriteriaResponse {
  evaluation_criteria: EvaluationCriterion[];
  success: boolean;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Função para gerar um ID único para cada critério
function generateCriterionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `criterion_${timestamp}_${randomStr}`;
}

// Função para preparar o prompt para a LLM 1 (Planejador Inicial)
function prepareEvaluationCriteriaPrompt(job: JobData): string {
  const requirementsList = job.requirements.map(req => `- ${req}`).join('\n');
  const differentialsList = job.differentials.map(diff => `- ${diff}`).join('\n');

  return `
Você é um especialista em recrutamento e deve gerar critérios de avaliação para uma vaga.

INFORMAÇÕES DA VAGA:
Título: ${job.title}
Descrição: ${job.description}
Modelo de trabalho: ${job.work_model}
${job.salary_range ? `Faixa salarial: ${job.salary_range}` : ''}
${job.benefits ? `Benefícios: ${job.benefits}` : ''}

REQUISITOS OBRIGATÓRIOS:
${requirementsList}

DIFERENCIAIS DESEJÁVEIS:
${differentialsList}

INSTRUÇÕES:
1. Analise a vaga e gere critérios de avaliação que a entrevista deve obrigatoriamente cobrir
2. Cada critério deve ter:
   - Nome claro e específico
   - Tipo (hard_skill, soft_skill, experience, cultural_fit)
   - Peso de importância (1-5, onde 5 é mais importante)
   - Descrição do que será avaliado

3. Foque nos aspectos mais importantes para o sucesso na vaga
4. Inclua tanto aspectos técnicos quanto comportamentais
5. Considere o contexto da empresa e modelo de trabalho
6. Gere entre 4-8 critérios (não mais que isso)

FORMATO DE RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
  "evaluation_criteria": [
    {
      "name": "Nome do critério",
      "type": "hard_skill|soft_skill|experience|cultural_fit",
      "weight": 1-5,
      "description": "Descrição detalhada do que será avaliado neste critério"
    }
  ]
}

IMPORTANTE: Retorne apenas o JSON, sem texto adicional.
  `.trim();
}

// Função para chamar a LLM (placeholder - você deve implementar com sua LLM preferida)
async function callLLM1(prompt: string): Promise<EvaluationCriterion[]> {
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
          content: 'Você é um especialista em recrutamento e avaliação de candidatos. Sempre retorne respostas em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return parsed.evaluation_criteria.map((criterion: any) => ({
    id: generateCriterionId(),
    ...criterion
  }));
  */

  // Por enquanto, retorna critérios de exemplo baseados na vaga
  const baseCriteria: Omit<EvaluationCriterion, 'id'>[] = [
    {
      name: "Conhecimento Técnico",
      type: "hard_skill",
      weight: 5,
      description: "Avaliação do domínio das tecnologias e ferramentas mencionadas nos requisitos"
    },
    {
      name: "Experiência Profissional",
      type: "experience",
      weight: 4,
      description: "Análise da experiência prévia relevante para a posição"
    },
    {
      name: "Comunicação",
      type: "soft_skill",
      weight: 4,
      description: "Capacidade de expressar ideias de forma clara e objetiva"
    },
    {
      name: "Resolução de Problemas",
      type: "soft_skill",
      weight: 4,
      description: "Habilidade para identificar, analisar e resolver problemas complexos"
    },
    {
      name: "Adaptabilidade",
      type: "cultural_fit",
      weight: 3,
      description: "Capacidade de se adaptar a mudanças e trabalhar em diferentes contextos"
    }
  ];

  return baseCriteria.map(criterion => ({
    id: generateCriterionId(),
    ...criterion
  }));
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
    const data: GenerateEvaluationCriteriaRequest = await req.json();

    // Validar dados obrigatórios
    if (!data.job || !data.job.title || !data.job.description) {
      return new Response(
        JSON.stringify({ error: 'Dados da vaga incompletos: título e descrição são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data.job.requirements || data.job.requirements.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pelo menos um requisito obrigatório deve ser fornecido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Preparar prompt para a LLM 1
    const prompt = prepareEvaluationCriteriaPrompt(data.job);
    console.log('Prompt para LLM 1 (Planejador Inicial):', prompt);

    // Chamar a LLM 1 para gerar critérios de avaliação
    let evaluationCriteria: EvaluationCriterion[];
    try {
      evaluationCriteria = await callLLM1(prompt);
    } catch (llmError) {
      console.error('Erro ao chamar LLM 1:', llmError);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar critérios de avaliação',
          success: false 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Critérios de avaliação gerados:', evaluationCriteria);

    // Retornar resposta de sucesso
    const response: GenerateEvaluationCriteriaResponse = {
      evaluation_criteria: evaluationCriteria,
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
    console.error('Erro na geração de critérios de avaliação:', error);
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