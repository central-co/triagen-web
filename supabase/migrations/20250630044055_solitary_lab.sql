/*
  # Adicionar campos para planejamento de entrevistas com LLM

  1. Modificações na tabela `jobs`
    - `evaluation_criteria` (jsonb) - Critérios de avaliação com pesos
    - `salary_info` (text) - Informações de salário
    - `benefits` (text) - Benefícios da vaga

  2. Modificações na tabela `candidates`
    - `interview_plan_id` (text) - ID do plano de entrevista gerado pela LLM

  3. Índices
    - Adicionar índice para interview_plan_id para consultas rápidas
*/

-- Adicionar novos campos à tabela jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'evaluation_criteria'
  ) THEN
    ALTER TABLE jobs ADD COLUMN evaluation_criteria jsonb DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'salary_info'
  ) THEN
    ALTER TABLE jobs ADD COLUMN salary_info text;
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

-- Adicionar novo campo à tabela candidates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'interview_plan_id'
  ) THEN
    ALTER TABLE candidates ADD COLUMN interview_plan_id text;
  END IF;
END $$;

-- Adicionar índice para interview_plan_id
CREATE INDEX IF NOT EXISTS candidates_interview_plan_id_idx ON candidates (interview_plan_id);

-- Comentários para documentação
COMMENT ON COLUMN jobs.evaluation_criteria IS 'Critérios de avaliação da vaga com pesos (formato: {"criterio": {"weight": 1-10, "description": "texto"}})';
COMMENT ON COLUMN jobs.salary_info IS 'Informações sobre salário da vaga';
COMMENT ON COLUMN jobs.benefits IS 'Benefícios oferecidos pela vaga';
COMMENT ON COLUMN candidates.interview_plan_id IS 'ID do plano de entrevista gerado pela LLM';