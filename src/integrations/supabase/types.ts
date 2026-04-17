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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          body: string | null
          created_at: string
          device_id: string
          id: string
          kind: string
          property_id: string | null
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          device_id: string
          id?: string
          kind: string
          property_id?: string | null
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          device_id?: string
          id?: string
          kind?: string
          property_id?: string | null
          read?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          confidence: number | null
          created_at: string
          device_id: string
          id: string
          input_kind: string
          input_payload: Json | null
          next_steps: Json | null
          property_id: string | null
          raw: Json | null
          reasons: Json | null
          red_flags: Json | null
          score: number | null
          verdict: Database["public"]["Enums"]["verdict_t"] | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          device_id: string
          id?: string
          input_kind: string
          input_payload?: Json | null
          next_steps?: Json | null
          property_id?: string | null
          raw?: Json | null
          reasons?: Json | null
          red_flags?: Json | null
          score?: number | null
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          device_id?: string
          id?: string
          input_kind?: string
          input_payload?: Json | null
          next_steps?: Json | null
          property_id?: string | null
          raw?: Json | null
          reasons?: Json | null
          red_flags?: Json | null
          score?: number | null
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          client_id: string
          created_at: string
          device_id: string
          id: string
          notes: string | null
          property_id: string
          shown_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          device_id: string
          id?: string
          notes?: string | null
          property_id: string
          shown_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          device_id?: string
          id?: string
          notes?: string | null
          property_id?: string
          shown_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          areas: string[] | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          device_id: string
          email: string | null
          goal: Database["public"]["Enums"]["goal_t"] | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          areas?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          device_id: string
          email?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          areas?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          device_id?: string
          email?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          goal: Database["public"]["Enums"]["goal_t"] | null
          id: string
          is_demo: boolean
          lat: number
          lng: number
          monthly_cost: number | null
          owner_device_id: string | null
          price: number
          score: number | null
          title: string
          updated_at: string
          verdict: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct: number | null
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          is_demo?: boolean
          lat: number
          lng: number
          monthly_cost?: number | null
          owner_device_id?: string | null
          price: number
          score?: number | null
          title: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct?: number | null
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          is_demo?: boolean
          lat?: number
          lng?: number
          monthly_cost?: number | null
          owner_device_id?: string | null
          price?: number
          score?: number | null
          title?: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct?: number | null
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          device_id: string
          id: string
          notes: string | null
          property_id: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          notes?: string | null
          property_id: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          notes?: string | null
          property_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      app_role: "agent" | "buyer"
      assignment_status:
        | "new"
        | "sent"
        | "viewed"
        | "interested"
        | "rejected"
        | "offer"
        | "closed"
      goal_t: "live" | "invest" | "rent" | "business"
      verdict_t: "green" | "yellow" | "red"
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
      app_role: ["agent", "buyer"],
      assignment_status: [
        "new",
        "sent",
        "viewed",
        "interested",
        "rejected",
        "offer",
        "closed",
      ],
      goal_t: ["live", "invest", "rent", "business"],
      verdict_t: ["green", "yellow", "red"],
    },
  },
} as const
