/*
  # Novo fluxo de entrevistas com 4 LLMs especializadas

  1. Modificações na tabela `jobs`
    - `requirements` (jsonb) - Lista de requisitos obrigatórios
    - `differentials` (jsonb) - Lista de diferenciais desejáveis
    - `work_model` (text) - Modelo de trabalho (remoto, híbrido, presencial)
    - `salary_range` (text) - Faixa salarial
    - `benefits` (text) - Benefícios
    - `evaluation_criteria` (jsonb) - Critérios gerados pela LLM 1
    - `custom_questions` (jsonb) - Perguntas customizadas para candidatos

  2. Nova tabela `interview_contexts`
    - Armazena os critérios contextuais gerados pela LLM 2 para cada candidato

  3. Nova tabela `interview_sessions`
    - Gerencia as sessões de entrevista com a LLM 3

  4. Modificações na tabela `interview_reports`
    - Adicionar campos para as avaliações da LLM 4

  5. Índices e políticas de segurança
*/

-- Atualizar tabela jobs com novos campos
DO $$
BEGIN
  -- Remover evaluation_criteria antigo se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'evaluation_criteria'
  ) THEN
    ALTER TABLE jobs DROP COLUMN evaluation_criteria;
  END IF;
END $$;

-- Adicionar novos campos à tabela jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'requirements'
  ) THEN
    ALTER TABLE jobs ADD COLUMN requirements jsonb DEFAULT '[]';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'differentials'
  ) THEN
    ALTER TABLE jobs ADD COLUMN differentials jsonb DEFAULT '[]';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'work_model'
  ) THEN
    ALTER TABLE jobs ADD COLUMN work_model text DEFAULT 'remoto';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'salary_range'
  ) THEN
    ALTER TABLE jobs ADD COLUMN salary_range text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'benefits'
  ) THEN
    ALTER TABLE jobs ADD COLUMN benefits text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'evaluation_criteria'
  ) THEN
    ALTER TABLE jobs ADD COLUMN evaluation_criteria jsonb DEFAULT '[]';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'custom_questions'
  ) THEN
    ALTER TABLE jobs ADD COLUMN custom_questions jsonb DEFAULT '[]';
  END IF;
END $$;

-- Criar tabela interview_contexts para critérios contextuais (LLM 2)
CREATE TABLE IF NOT EXISTS interview_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  contextual_criteria jsonb DEFAULT '[]', -- Critérios contextuais gerados pela LLM 2
  generated_at timestamptz DEFAULT now(),
  llm_model text DEFAULT 'gpt-4',
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela interview_sessions para gerenciar entrevistas (LLM 3)
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  mandatory_criteria_covered jsonb DEFAULT '{}', -- Quais critérios obrigatórios foram cobertos
  contextual_criteria_covered jsonb DEFAULT '{}', -- Quais critérios contextuais foram abordados
  conversation_log jsonb DEFAULT '[]', -- Log da conversa
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  llm_model text DEFAULT 'gpt-4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabela candidates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'resume_text'
  ) THEN
    ALTER TABLE candidates ADD COLUMN resume_text text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'custom_answers'
  ) THEN
    ALTER TABLE candidates ADD COLUMN custom_answers jsonb DEFAULT '{}';
  END IF;
END $$;

-- Atualizar tabela interview_reports para LLM 4
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'criteria_scores'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN criteria_scores jsonb DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'compatibility_score'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN compatibility_score decimal(3,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 10);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'strengths'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN strengths text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'weaknesses'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN weaknesses text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'insights'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN insights text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_reports' AND column_name = 'llm_model'
  ) THEN
    ALTER TABLE interview_reports ADD COLUMN llm_model text DEFAULT 'gpt-4';
  END IF;
END $$;

-- Enable RLS nas novas tabelas
ALTER TABLE interview_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para interview_contexts
CREATE POLICY "Companies can view contexts for own candidates"
  ON interview_contexts
  FOR SELECT
  TO authenticated
  USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON c.job_id = j.id
      JOIN companies comp ON j.company_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

-- Políticas para interview_sessions
CREATE POLICY "Companies can view sessions for own candidates"
  ON interview_sessions
  FOR SELECT
  TO authenticated
  USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON c.job_id = j.id
      JOIN companies comp ON j.company_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS interview_contexts_candidate_id_idx ON interview_contexts (candidate_id);
CREATE INDEX IF NOT EXISTS interview_sessions_candidate_id_idx ON interview_sessions (candidate_id);
CREATE INDEX IF NOT EXISTS interview_sessions_token_idx ON interview_sessions (session_token);
CREATE INDEX IF NOT EXISTS interview_sessions_status_idx ON interview_sessions (status);

-- Comentários para documentação
COMMENT ON COLUMN jobs.requirements IS 'Lista de requisitos obrigatórios da vaga';
COMMENT ON COLUMN jobs.differentials IS 'Lista de diferenciais desejáveis da vaga';
COMMENT ON COLUMN jobs.work_model IS 'Modelo de trabalho: remoto, híbrido, presencial';
COMMENT ON COLUMN jobs.salary_range IS 'Faixa salarial da vaga';
COMMENT ON COLUMN jobs.benefits IS 'Benefícios oferecidos pela vaga';
COMMENT ON COLUMN jobs.evaluation_criteria IS 'Critérios de avaliação gerados pela LLM 1';
COMMENT ON COLUMN jobs.custom_questions IS 'Perguntas customizadas para candidatos';

COMMENT ON TABLE interview_contexts IS 'Critérios contextuais gerados pela LLM 2 para cada candidato';
COMMENT ON COLUMN interview_contexts.contextual_criteria IS 'Critérios contextuais personalizados para o candidato';

COMMENT ON TABLE interview_sessions IS 'Sessões de entrevista gerenciadas pela LLM 3';
COMMENT ON COLUMN interview_sessions.mandatory_criteria_covered IS 'Critérios obrigatórios que foram cobertos na entrevista';
COMMENT ON COLUMN interview_sessions.contextual_criteria_covered IS 'Critérios contextuais que foram abordados na entrevista';

COMMENT ON COLUMN interview_reports.criteria_scores IS 'Notas de 0-10 para cada critério obrigatório (LLM 4)';
COMMENT ON COLUMN interview_reports.compatibility_score IS 'Nota geral de compatibilidade com a vaga';
COMMENT ON COLUMN interview_reports.strengths IS 'Pontos fortes identificados';
COMMENT ON COLUMN interview_reports.weaknesses IS 'Pontos fracos identificados';
COMMENT ON COLUMN interview_reports.insights IS 'Insights relevantes da avaliação';