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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          present: boolean
          recorded_by: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          present?: boolean
          recorded_by?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          present?: boolean
          recorded_by?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      belt_colors: {
        Row: {
          color: string
          description: string | null
          id: string
          order_sequence: number
        }
        Insert: {
          color: string
          description?: string | null
          id?: string
          order_sequence: number
        }
        Update: {
          color?: string
          description?: string | null
          id?: string
          order_sequence?: number
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          active: boolean
          class_id: string | null
          enrolled_at: string | null
          id: string
          student_id: string | null
        }
        Insert: {
          active?: boolean
          class_id?: string | null
          enrolled_at?: string | null
          id?: string
          student_id?: string | null
        }
        Update: {
          active?: boolean
          class_id?: string | null
          enrolled_at?: string | null
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          active: boolean
          created_at: string | null
          day_of_week: number
          description: string | null
          end_time: string
          id: string
          instructor_id: string | null
          max_students: number | null
          name: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          day_of_week: number
          description?: string | null
          end_time: string
          id?: string
          instructor_id?: string | null
          max_students?: number | null
          name: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          end_time?: string
          id?: string
          instructor_id?: string | null
          max_students?: number | null
          name?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string | null
          id: string
          notes: string | null
          paid: boolean
          participant_id: string | null
          registration_date: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          notes?: string | null
          paid?: boolean
          participant_id?: string | null
          registration_date?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          notes?: string | null
          paid?: boolean
          participant_id?: string | null
          registration_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          active: boolean
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          max_participants: number | null
          organizer_id: string | null
          registration_fee: number | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer_id?: string | null
          registration_fee?: number | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer_id?: string | null
          registration_fee?: number | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      graduations: {
        Row: {
          belt_color: string
          belt_degree: number
          created_at: string | null
          graduation_date: string
          id: string
          instructor_id: string | null
          notes: string | null
          student_id: string | null
        }
        Insert: {
          belt_color: string
          belt_degree: number
          created_at?: string | null
          graduation_date: string
          id?: string
          instructor_id?: string | null
          notes?: string | null
          student_id?: string | null
        }
        Update: {
          belt_color?: string
          belt_degree?: number
          created_at?: string | null
          graduation_date?: string
          id?: string
          instructor_id?: string | null
          notes?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graduations_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          read: boolean
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read?: boolean
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read?: boolean
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          recorded_by: string | null
          reference_month: string | null
          status: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_month?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_month?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          emergency_contact: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          emergency_contact?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          emergency_contact?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      student_achievements: {
        Row: {
          achievement_date: string
          achievement_type: string
          created_at: string | null
          description: string | null
          id: string
          points: number | null
          student_id: string
          title: string
        }
        Insert: {
          achievement_date?: string
          achievement_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          student_id: string
          title: string
        }
        Update: {
          achievement_date?: string
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          student_id?: string
          title?: string
        }
        Relationships: []
      }
      student_competitions: {
        Row: {
          category: string | null
          competition_date: string
          competition_name: string
          created_at: string | null
          division: string | null
          id: string
          notes: string | null
          position: number | null
          student_id: string
          total_participants: number | null
        }
        Insert: {
          category?: string | null
          competition_date: string
          competition_name: string
          created_at?: string | null
          division?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          student_id: string
          total_participants?: number | null
        }
        Update: {
          category?: string | null
          competition_date?: string
          competition_name?: string
          created_at?: string | null
          division?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          student_id?: string
          total_participants?: number | null
        }
        Relationships: []
      }
      student_evaluations: {
        Row: {
          areas_for_improvement: string | null
          balance_score: number | null
          blocks_score: number | null
          created_at: string | null
          discipline_score: number | null
          evaluation_date: string
          flexibility_score: number | null
          focus_score: number | null
          id: string
          improvement_attitude: number | null
          instructor_id: string | null
          kicks_score: number | null
          long_term_goals: string | null
          observations: string | null
          poomsae_score: number | null
          precision_score: number | null
          punches_score: number | null
          respect_score: number | null
          self_confidence: number | null
          short_term_goals: string | null
          sparring_attitude: number | null
          sparring_control: number | null
          sparring_defense: number | null
          sparring_strategy: number | null
          sparring_technique: number | null
          speed_score: number | null
          stances_score: number | null
          strength_score: number | null
          strengths: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          areas_for_improvement?: string | null
          balance_score?: number | null
          blocks_score?: number | null
          created_at?: string | null
          discipline_score?: number | null
          evaluation_date?: string
          flexibility_score?: number | null
          focus_score?: number | null
          id?: string
          improvement_attitude?: number | null
          instructor_id?: string | null
          kicks_score?: number | null
          long_term_goals?: string | null
          observations?: string | null
          poomsae_score?: number | null
          precision_score?: number | null
          punches_score?: number | null
          respect_score?: number | null
          self_confidence?: number | null
          short_term_goals?: string | null
          sparring_attitude?: number | null
          sparring_control?: number | null
          sparring_defense?: number | null
          sparring_strategy?: number | null
          sparring_technique?: number | null
          speed_score?: number | null
          stances_score?: number | null
          strength_score?: number | null
          strengths?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          areas_for_improvement?: string | null
          balance_score?: number | null
          blocks_score?: number | null
          created_at?: string | null
          discipline_score?: number | null
          evaluation_date?: string
          flexibility_score?: number | null
          focus_score?: number | null
          id?: string
          improvement_attitude?: number | null
          instructor_id?: string | null
          kicks_score?: number | null
          long_term_goals?: string | null
          observations?: string | null
          poomsae_score?: number | null
          precision_score?: number | null
          punches_score?: number | null
          respect_score?: number | null
          self_confidence?: number | null
          short_term_goals?: string | null
          sparring_attitude?: number | null
          sparring_control?: number | null
          sparring_defense?: number | null
          sparring_strategy?: number | null
          sparring_technique?: number | null
          speed_score?: number | null
          stances_score?: number | null
          strength_score?: number | null
          strengths?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_goals: {
        Row: {
          category: string
          completed: boolean | null
          completed_date: string | null
          created_at: string | null
          current_progress: number | null
          description: string | null
          id: string
          instructor_id: string | null
          student_id: string
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          student_id: string
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          student_id?: string
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          active: boolean
          belt_color: string
          belt_degree: number
          created_at: string | null
          date_joined: string
          id: string
          medical_info: string | null
          monthly_fee: number | null
          payment_due_date: number | null
          profile_id: string | null
          responsible_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          belt_color?: string
          belt_degree?: number
          created_at?: string | null
          date_joined?: string
          id?: string
          medical_info?: string | null
          monthly_fee?: number | null
          payment_due_date?: number | null
          profile_id?: string | null
          responsible_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          belt_color?: string
          belt_degree?: number
          created_at?: string | null
          date_joined?: string
          id?: string
          medical_info?: string | null
          monthly_fee?: number | null
          payment_due_date?: number | null
          profile_id?: string | null
          responsible_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
