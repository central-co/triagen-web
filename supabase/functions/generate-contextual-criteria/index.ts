import { createClient } from 'npm:@supabase/supabase-js@2';

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume_text?: string;
  resume_url?: string;
  custom_answers?: Record<string, any>;
}

interface JobData {
  id: string;
  title: string;
  description: string;
  work_model: string;
  requirements: string[];
  differentials: string[];
  evaluation_criteria: any[];
  salary_range?: string;
  benefits?: string;
}

interface CompanyData {
  id: string;
  name: string;
  contact_email?: string;
  address?: string;
}

interface ContextualCriterion {
  id: string;
  name: string;
  type: 'background' | 'experience' | 'education' | 'transition' | 'achievement' | 'interest';
  description: string;
  relevance_score: number; // 1-5
}

interface GenerateContextualCriteriaRequest {
  candidate: CandidateData;
  job: JobData;
  company: CompanyData;
}

interface GenerateContextualCriteriaResponse {
  contextual_criteria: ContextualCriterion[];
  context_id: string;
  success: boolean;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Função para gerar um ID único para o contexto
function generateContextId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `context_${timestamp}_${randomStr}`;
}

// Função para gerar um ID único para cada critério contextual
function generateContextualCriterionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `contextual_${timestamp}_${randomStr}`;
}

// Função para preparar o prompt para a LLM 2 (Planejador de Contexto)
function prepareContextualCriteriaPrompt(candidate: CandidateData, job: JobData, company: CompanyData): string {
  const requirementsList = job.requirements.map(req => `- ${req}`).join('\n');
  const differentialsList = job.differentials.map(diff => `- ${diff}`).join('\n');
  const evaluationCriteriaList = job.evaluation_criteria.map((criterion: any) => 
    `- ${criterion.name} (${criterion.type}, peso ${criterion.weight}): ${criterion.description}`
  ).join('\n');

  const customAnswersText = candidate.custom_answers && Object.keys(candidate.custom_answers).length > 0
    ? Object.entries(candidate.custom_answers).map(([question, answer]) => `${question}: ${answer}`).join('\n')
    : 'Nenhuma resposta customizada fornecida';

  return `
Você é um especialista em recrutamento e deve gerar critérios contextuais para personalizar uma entrevista.

INFORMAÇÕES DA EMPRESA:
Nome: ${company.name}
${company.contact_email ? `Email: ${company.contact_email}` : ''}
${company.address ? `Endereço: ${company.address}` : ''}

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

CRITÉRIOS DE AVALIAÇÃO OBRIGATÓRIOS (já definidos):
${evaluationCriteriaList}

INFORMAÇÕES DO CANDIDATO:
Nome: ${candidate.name}
Email: ${candidate.email}
${candidate.phone ? `Telefone: ${candidate.phone}` : ''}
${candidate.resume_url ? `Currículo: ${candidate.resume_url}` : ''}
${candidate.resume_text ? `Texto do currículo: ${candidate.resume_text}` : ''}

Respostas customizadas:
${customAnswersText}

INSTRUÇÕES:
1. Analise o perfil do candidato e identifique pontos interessantes para abordar na entrevista
2. Gere critérios contextuais que NÃO são avaliados diretamente, mas enriquecem a conversa
3. Foque em aspectos únicos do candidato que podem gerar conversas interessantes
4. Cada critério contextual deve ter:
   - Nome claro e específico
   - Tipo (background, experience, education, transition, achievement, interest)
   - Descrição do que abordar
   - Score de relevância (1-5, onde 5 é mais relevante)

5. Exemplos de critérios contextuais:
   - "Trabalhou na Google" (experience)
   - "Fez transição de carreira" (transition)
   - "Estudou no exterior" (education)
   - "Tem experiência em startup" (background)
   - "Contribui para open source" (achievement)

6. Gere entre 2-5 critérios contextuais (não mais que isso)
7. Priorize aspectos que podem gerar conversas naturais e interessantes

FORMATO DE RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
  "contextual_criteria": [
    {
      "name": "Nome do critério contextual",
      "type": "background|experience|education|transition|achievement|interest",
      "description": "Descrição do que abordar sobre este aspecto",
      "relevance_score": 1-5
    }
  ]
}

IMPORTANTE: Retorne apenas o JSON, sem texto adicional.
  `.trim();
}

// Função para chamar a LLM 2 (placeholder - você deve implementar com sua LLM preferida)
async function callLLM2(prompt: string): Promise<ContextualCriterion[]> {
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
          content: 'Você é um especialista em recrutamento e personalização de entrevistas. Sempre retorne respostas em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return parsed.contextual_criteria.map((criterion: any) => ({
    id: generateContextualCriterionId(),
    ...criterion
  }));
  */

  // Por enquanto, retorna critérios contextuais de exemplo
  const baseCriteria: Omit<ContextualCriterion, 'id'>[] = [
    {
      name: "Experiência em Empresas de Tecnologia",
      type: "experience",
      description: "Explorar experiências anteriores em empresas de tecnologia e aprendizados obtidos",
      relevance_score: 4
    },
    {
      name: "Projetos Pessoais",
      type: "achievement",
      description: "Conversar sobre projetos pessoais ou contribuições para a comunidade",
      relevance_score: 3
    },
    {
      name: "Motivação para a Vaga",
      type: "interest",
      description: "Entender o que motivou o candidato a se candidatar especificamente para esta posição",
      relevance_score: 5
    }
  ];

  return baseCriteria.map(criterion => ({
    id: generateContextualCriterionId(),
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
    const data: GenerateContextualCriteriaRequest = await req.json();

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

    // Gerar ID único para o contexto
    const contextId = generateContextId();

    // Preparar prompt para a LLM 2
    const prompt = prepareContextualCriteriaPrompt(data.candidate, data.job, data.company);
    console.log('Prompt para LLM 2 (Planejador de Contexto):', prompt);

    // Chamar a LLM 2 para gerar critérios contextuais
    let contextualCriteria: ContextualCriterion[];
    try {
      contextualCriteria = await callLLM2(prompt);
    } catch (llmError) {
      console.error('Erro ao chamar LLM 2:', llmError);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar critérios contextuais',
          success: false 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Critérios contextuais gerados:', contextualCriteria);

    // Salvar no banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: insertError } = await supabase
        .from('interview_contexts')
        .insert({
          candidate_id: data.candidate.id,
          contextual_criteria: contextualCriteria,
          llm_model: 'gpt-4',
          processing_time_ms: Date.now() // Placeholder para tempo de processamento
        });

      if (insertError) {
        console.error('Erro ao salvar contexto no banco:', insertError);
        // Não falha a operação, apenas loga o erro
      }
    }

    // Retornar resposta de sucesso
    const response: GenerateContextualCriteriaResponse = {
      contextual_criteria: contextualCriteria,
      context_id: contextId,
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
    console.error('Erro na geração de critérios contextuais:', error);
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