/*
  # Create company platform database structure

  1. New Tables
    - `companies` - Company profiles and information
    - `jobs` - Job postings created by companies
    - `candidates` - Candidates who applied to jobs
    - `interview_reports` - AI-generated reports for each candidate
    - `plans` - Available subscription plans
    - `subscriptions` - Company subscriptions to plans
    - `usage_tracking` - Track API usage and credits

  2. Security
    - Enable RLS on all tables
    - Add policies for company data access
    - Ensure data isolation between companies

  3. Indexes
    - Add performance indexes for common queries
    - Foreign key constraints for data integrity
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  cnpj text,
  contact_email text,
  contact_phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text,
  contract_type text DEFAULT 'full-time',
  custom_fields jsonb DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'interviewed', 'completed', 'rejected', 'hired')),
  is_favorite boolean DEFAULT false,
  notes text,
  interview_token text UNIQUE,
  interview_started_at timestamptz,
  interview_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interview reports table
CREATE TABLE IF NOT EXISTS interview_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  summary text,
  alignment_analysis text,
  overall_score decimal(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
  category_scores jsonb DEFAULT '{}',
  recommendations text,
  transcript_url text,
  recording_url text,
  created_at timestamptz DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly decimal(10,2),
  price_yearly decimal(10,2),
  interview_credits integer DEFAULT 0,
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES plans(id) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  credits_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL, -- 'interview_started', 'interview_completed', 'report_generated'
  resource_id uuid, -- candidate_id, job_id, etc.
  credits_used integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own company"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Jobs policies
CREATE POLICY "Companies can manage own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Candidates policies
CREATE POLICY "Companies can view candidates for own jobs"
  ON candidates
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage candidates for own jobs"
  ON candidates
  FOR ALL
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Allow public insert for candidates (job applications)
CREATE POLICY "Allow public candidate applications"
  ON candidates
  FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL AND 
    email IS NOT NULL AND 
    job_id IS NOT NULL
  );

-- Interview reports policies
CREATE POLICY "Companies can view reports for own candidates"
  ON interview_reports
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

-- Plans policies (public read)
CREATE POLICY "Plans are publicly readable"
  ON plans
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Subscriptions policies
CREATE POLICY "Companies can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Usage tracking policies
CREATE POLICY "Companies can view own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON companies (user_id);
CREATE INDEX IF NOT EXISTS jobs_company_id_idx ON jobs (company_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS candidates_job_id_idx ON candidates (job_id);
CREATE INDEX IF NOT EXISTS candidates_status_idx ON candidates (status);
CREATE INDEX IF NOT EXISTS candidates_email_idx ON candidates (email);
CREATE INDEX IF NOT EXISTS interview_reports_candidate_id_idx ON interview_reports (candidate_id);
CREATE INDEX IF NOT EXISTS subscriptions_company_id_idx ON subscriptions (company_id);
CREATE INDEX IF NOT EXISTS usage_tracking_company_id_idx ON usage_tracking (company_id);

-- Insert default plans
INSERT INTO plans (name, description, price_monthly, price_yearly, interview_credits, features) VALUES
('Teste Grátis', 'Teste nossa plataforma com 5 entrevistas gratuitas', 0, 0, 5, '{"support": "email", "reports": true, "analytics": "basic"}'),
('Piloto Acadêmico', 'Ideal para universidades e pequenas empresas', 200, 2000, 50, '{"support": "priority", "reports": true, "analytics": "advanced", "custom_branding": false}'),
('Empresarial', 'Para empresas que contratam regularmente', 500, 5000, 200, '{"support": "priority", "reports": true, "analytics": "advanced", "custom_branding": true, "api_access": true}')
ON CONFLICT DO NOTHING;