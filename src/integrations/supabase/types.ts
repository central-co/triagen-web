export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          created_at: string | null
          custom_answers: Json | null
          email: string
          id: string
          interview_completed_at: string | null
          interview_id: string
          interview_started_at: string | null
          is_favorite: boolean | null
          job_id: string
          name: string
          notes: string | null
          phone: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_answers?: Json | null
          email: string
          id?: string
          interview_completed_at?: string | null
          interview_id?: string
          interview_started_at?: string | null
          is_favorite?: boolean | null
          job_id: string
          name: string
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_answers?: Json | null
          email?: string
          id?: string
          interview_completed_at?: string | null
          interview_id?: string
          interview_started_at?: string | null
          is_favorite?: boolean | null
          job_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
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
          contextual_criteria: Json | null
          created_at: string | null
          generated_at: string | null
          id: string
          interview_id: string
          llm_model: string | null
          processing_time_ms: number | null
        }
        Insert: {
          contextual_criteria?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          interview_id: string
          llm_model?: string | null
          processing_time_ms?: number | null
        }
        Update: {
          contextual_criteria?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          interview_id?: string
          llm_model?: string | null
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_contexts_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["interview_id"]
          },
        ]
      }
      interview_reports: {
        Row: {
          alignment_analysis: string | null
          category_scores: Json | null
          compatibility_score: number | null
          created_at: string
          criteria_scores: Json | null
          id: string
          insights: string | null
          interview_id: string
          llm_model: string | null
          overall_score: number | null
          recommendation:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          recording_url: string | null
          status: Database["public"]["Enums"]["interview_report_status"]
          strengths: string[] | null
          summary: string | null
          transcript_url: string | null
          updated_at: string
          weaknesses: string[] | null
        }
        Insert: {
          alignment_analysis?: string | null
          category_scores?: Json | null
          compatibility_score?: number | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          insights?: string | null
          interview_id: string
          llm_model?: string | null
          overall_score?: number | null
          recommendation?:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          recording_url?: string | null
          status?: Database["public"]["Enums"]["interview_report_status"]
          strengths?: string[] | null
          summary?: string | null
          transcript_url?: string | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Update: {
          alignment_analysis?: string | null
          category_scores?: Json | null
          compatibility_score?: number | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          insights?: string | null
          interview_id?: string
          llm_model?: string | null
          overall_score?: number | null
          recommendation?:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          recording_url?: string | null
          status?: Database["public"]["Enums"]["interview_report_status"]
          strengths?: string[] | null
          summary?: string | null
          transcript_url?: string | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_interview_reports_candidates"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["interview_id"]
          },
          {
            foreignKeyName: "interview_reports_interview_id_fkey_session"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["interview_id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          contextual_criteria_covered: Json | null
          conversation_log: Json | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          interview_id: string
          llm_model: string | null
          mandatory_criteria_covered: Json | null
          room_name: string
          started_at: string | null
          status: Database["public"]["Enums"]["interview_session_status"]
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          contextual_criteria_covered?: Json | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          interview_id: string
          llm_model?: string | null
          mandatory_criteria_covered?: Json | null
          room_name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["interview_session_status"]
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          contextual_criteria_covered?: Json | null
          conversation_log?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          interview_id?: string
          llm_model?: string | null
          mandatory_criteria_covered?: Json | null
          room_name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["interview_session_status"]
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_interview_id_fkey_ctx"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interview_contexts"
            referencedColumns: ["interview_id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company_id: string
          contract_type: string
          created_at: string
          criteria: Json | null
          deadline: string | null
          description: string
          desirable_requirements: Json | null
          id: string
          interview_duration_minutes: number
          location: string | null
          mandatory_requirements: Json
          pre_interview_questions: Json | null
          salary_info: string | null
          salary_range: string | null
          status: Database["public"]["Enums"]["job_status"]
          team_context: string | null
          title: string
          updated_at: string
          work_model: string
        }
        Insert: {
          benefits?: string | null
          company_id: string
          contract_type: string
          created_at?: string
          criteria?: Json | null
          deadline?: string | null
          description: string
          desirable_requirements?: Json | null
          id?: string
          interview_duration_minutes: number
          location?: string | null
          mandatory_requirements?: Json
          pre_interview_questions?: Json | null
          salary_info?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          team_context?: string | null
          title: string
          updated_at?: string
          work_model: string
        }
        Update: {
          benefits?: string | null
          company_id?: string
          contract_type?: string
          created_at?: string
          criteria?: Json | null
          deadline?: string | null
          description?: string
          desirable_requirements?: Json | null
          id?: string
          interview_duration_minutes?: number
          location?: string | null
          mandatory_requirements?: Json
          pre_interview_questions?: Json | null
          salary_info?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          team_context?: string | null
          title?: string
          updated_at?: string
          work_model?: string
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
          status: Database["public"]["Enums"]["subscription_status"]
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
          status?: Database["public"]["Enums"]["subscription_status"]
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
          status?: Database["public"]["Enums"]["subscription_status"]
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
      candidate_status:
        | "pending"
        | "interviewed"
        | "completed"
        | "rejected"
        | "hired"
      interview_report_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
      interview_session_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
      job_status: "open" | "closed" | "paused"
      recommendation_type:
        | "not_decided"
        | "approve"
        | "reject"
        | "technical_test"
      subscription_status: "active" | "cancelled" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidate_status: [
        "pending",
        "interviewed",
        "completed",
        "rejected",
        "hired",
      ],
      interview_report_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
      ],
      interview_session_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
      ],
      job_status: ["open", "closed", "paused"],
      recommendation_type: [
        "not_decided",
        "approve",
        "reject",
        "technical_test",
      ],
      subscription_status: ["active", "cancelled", "expired"],
    },
  },
} as const
