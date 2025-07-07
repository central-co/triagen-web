type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          created_at: string | null
          custom_answers: Json | null
          email: string
          id: string
          interview_completed_at: string | null
          interview_plan_id: string | null
          interview_started_at: string | null
          interview_token: string | null
          is_favorite: boolean | null
          job_id: string
          name: string
          notes: string | null
          phone: string | null
          resume_text: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_answers?: Json | null
          email: string
          id?: string
          interview_completed_at?: string | null
          interview_plan_id?: string | null
          interview_started_at?: string | null
          interview_token?: string | null
          is_favorite?: boolean | null
          job_id: string
          name: string
          notes?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_answers?: Json | null
          email?: string
          id?: string
          interview_completed_at?: string | null
          interview_plan_id?: string | null
          interview_started_at?: string | null
          interview_token?: string | null
          is_favorite?: boolean | null
          job_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      interview_contexts: {
        Row: {
          candidate_id: string
          contextual_criteria: Json | null
          created_at: string | null
          generated_at: string | null
          id: string
          llm_model: string | null
          processing_time_ms: number | null
        }
        Insert: {
          candidate_id: string
          contextual_criteria?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          llm_model?: string | null
          processing_time_ms?: number | null
        }
        Update: {
          candidate_id?: string
          contextual_criteria?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          llm_model?: string | null
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_contexts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_reports: {
        Row: {
          alignment_analysis: string | null
          candidate_id: string
          category_scores: Json | null
          compatibility_score: number | null
          created_at: string | null
          criteria_scores: Json | null
          id: string
          insights: string | null
          llm_model: string | null
          overall_score: number | null
          recommendations: string | null
          recording_url: string | null
          strengths: string[] | null
          summary: string | null
          transcript_url: string | null
          weaknesses: string[] | null
        }
        Insert: {
          alignment_analysis?: string | null
          candidate_id: string
          category_scores?: Json | null
          compatibility_score?: number | null
          created_at?: string | null
          criteria_scores?: Json | null
          id?: string
          insights?: string | null
          llm_model?: string | null
          overall_score?: number | null
          recommendations?: string | null
          recording_url?: string | null
          strengths?: string[] | null
          summary?: string | null
          transcript_url?: string | null
          weaknesses?: string[] | null
        }
        Update: {
          alignment_analysis?: string | null
          candidate_id?: string
          category_scores?: Json | null
          compatibility_score?: number | null
          created_at?: string | null
          criteria_scores?: Json | null
          id?: string
          insights?: string | null
          llm_model?: string | null
          overall_score?: number | null
          recommendations?: string | null
          recording_url?: string | null
          strengths?: string[] | null
          summary?: string | null
          transcript_url?: string | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_reports_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          candidate_id: string
          completed_at: string | null
          contextual_criteria_covered: Json | null
          conversation_log: Json | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          llm_model: string | null
          mandatory_criteria_covered: Json | null
          session_token: string
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          contextual_criteria_covered?: Json | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          llm_model?: string | null
          mandatory_criteria_covered?: Json | null
          session_token: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          contextual_criteria_covered?: Json | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          llm_model?: string | null
          mandatory_criteria_covered?: Json | null
          session_token?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company_id: string
          contract_type: string | null
          created_at: string | null
          custom_fields: Json | null
          custom_questions: Json | null
          deadline: string | null
          description: string
          differentials: Json | null
          evaluation_criteria: Json | null
          id: string
          location: string | null
          requirements: Json | null
          salary_info: string | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string | null
          work_model: string | null
        }
        Insert: {
          benefits?: string | null
          company_id: string
          contract_type?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          custom_questions?: Json | null
          deadline?: string | null
          description: string
          differentials?: Json | null
          evaluation_criteria?: Json | null
          id?: string
          location?: string | null
          requirements?: Json | null
          salary_info?: string | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_model?: string | null
        }
        Update: {
          benefits?: string | null
          company_id?: string
          contract_type?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          custom_questions?: Json | null
          deadline?: string | null
          description?: string
          differentials?: Json | null
          evaluation_criteria?: Json | null
          id?: string
          location?: string | null
          requirements?: Json | null
          salary_info?: string | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interview_credits: number | null
          is_active: boolean | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interview_credits?: number | null
          is_active?: boolean | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interview_credits?: number | null
          is_active?: boolean | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string | null
          credits_remaining: number | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          action_type: string
          company_id: string
          created_at: string | null
          credits_used: number | null
          id: string
          metadata: Json | null
          resource_id: string | null
        }
        Insert: {
          action_type: string
          company_id: string
          created_at?: string | null
          credits_used?: number | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
        }
        Update: {
          action_type?: string
          company_id?: string
          created_at?: string | null
          credits_used?: number | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          job_title: string | null
          name: string | null
          newsletter_consent: boolean
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          job_title?: string | null
          name?: string | null
          newsletter_consent?: boolean
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          job_title?: string | null
          name?: string | null
          newsletter_consent?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

const Constants = {
  public: {
    Enums: {},
  },
} as const
