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
      agents: {
        Row: {
          activity_score: number
          company: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string | null
          paid_at: string | null
          photo_url: string | null
          region: string | null
          subscription_status: Database["public"]["Enums"]["agent_subscription_status"]
          telegram_chat_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_score?: number
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string | null
          paid_at?: string | null
          photo_url?: string | null
          region?: string | null
          subscription_status?: Database["public"]["Enums"]["agent_subscription_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_score?: number
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string | null
          paid_at?: string | null
          photo_url?: string | null
          region?: string | null
          subscription_status?: Database["public"]["Enums"]["agent_subscription_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      client_packs: {
        Row: {
          agent_id: string
          client_explanation: Json | null
          client_name: string | null
          created_at: string
          id: string
          is_public: boolean
          next_step: string | null
          object_id: string
          price_argument: string | null
          risks: Json | null
          share_slug: string
          updated_at: string
          verdict_text: string | null
        }
        Insert: {
          agent_id: string
          client_explanation?: Json | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_public: boolean
          next_step?: string | null
          object_id: string
          price_argument?: string | null
          risks?: Json | null
          share_slug: string
          updated_at?: string
          verdict_text?: string | null
        }
        Update: {
          agent_id?: string
          client_explanation?: Json | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          next_step?: string | null
          object_id?: string
          price_argument?: string | null
          risks?: Json | null
          share_slug?: string
          updated_at?: string
          verdict_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_packs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packs_object_id_fkey"
            columns: ["object_id"]
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
      lead_notifications: {
        Row: {
          channel: Database["public"]["Enums"]["lead_notification_channel"]
          created_at: string
          error: string | null
          id: string
          lead_id: string
          status: Database["public"]["Enums"]["lead_notification_status"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["lead_notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          lead_id: string
          status: Database["public"]["Enums"]["lead_notification_status"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["lead_notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string
          status?: Database["public"]["Enums"]["lead_notification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string
          client_pack_id: string
          contact_name: string
          contact_phone_or_email: string
          created_at: string
          id: string
          is_internal: boolean
          message: string | null
          object_id: string
        }
        Insert: {
          agent_id: string
          client_pack_id: string
          contact_name: string
          contact_phone_or_email: string
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string | null
          object_id: string
        }
        Update: {
          agent_id?: string
          client_pack_id?: string
          contact_name?: string
          contact_phone_or_email?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string | null
          object_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_pack_id_fkey"
            columns: ["client_pack_id"]
            isOneToOne: false
            referencedRelation: "client_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      object_statuses_log: {
        Row: {
          confirmed_by: string
          created_at: string
          id: string
          object_id: string
          status: Database["public"]["Enums"]["object_status"]
        }
        Insert: {
          confirmed_by: string
          created_at?: string
          id?: string
          object_id: string
          status: Database["public"]["Enums"]["object_status"]
        }
        Update: {
          confirmed_by?: string
          created_at?: string
          id?: string
          object_id?: string
          status?: Database["public"]["Enums"]["object_status"]
        }
        Relationships: [
          {
            foreignKeyName: "object_statuses_log_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "object_statuses_log_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      paywall_events: {
        Row: {
          agent_id: string
          clicked_at: string
          id: string
          object_id: string | null
        }
        Insert: {
          agent_id: string
          clicked_at?: string
          id?: string
          object_id?: string | null
        }
        Update: {
          agent_id?: string
          clicked_at?: string
          id?: string
          object_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paywall_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paywall_events_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          agent_id: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          cover_url: string | null
          created_at: string
          currency: string
          deal_type: Database["public"]["Enums"]["object_deal_type"] | null
          description: string | null
          goal: Database["public"]["Enums"]["goal_t"] | null
          id: string
          is_demo: boolean
          last_confirmed_at: string | null
          lat: number
          lng: number
          monthly_cost: number | null
          object_status: Database["public"]["Enums"]["object_status"]
          owner_device_id: string | null
          price: number
          property_type:
            | Database["public"]["Enums"]["object_property_type"]
            | null
          score: number | null
          side: Database["public"]["Enums"]["object_side"] | null
          source_type: Database["public"]["Enums"]["object_source_type"] | null
          title: string
          updated_at: string
          verdict: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct: number | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          deal_type?: Database["public"]["Enums"]["object_deal_type"] | null
          description?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          is_demo?: boolean
          last_confirmed_at?: string | null
          lat: number
          lng: number
          monthly_cost?: number | null
          object_status?: Database["public"]["Enums"]["object_status"]
          owner_device_id?: string | null
          price: number
          property_type?:
            | Database["public"]["Enums"]["object_property_type"]
            | null
          score?: number | null
          side?: Database["public"]["Enums"]["object_side"] | null
          source_type?: Database["public"]["Enums"]["object_source_type"] | null
          title: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct?: number | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          deal_type?: Database["public"]["Enums"]["object_deal_type"] | null
          description?: string | null
          goal?: Database["public"]["Enums"]["goal_t"] | null
          id?: string
          is_demo?: boolean
          last_confirmed_at?: string | null
          lat?: number
          lng?: number
          monthly_cost?: number | null
          object_status?: Database["public"]["Enums"]["object_status"]
          owner_device_id?: string | null
          price?: number
          property_type?:
            | Database["public"]["Enums"]["object_property_type"]
            | null
          score?: number | null
          side?: Database["public"]["Enums"]["object_side"] | null
          source_type?: Database["public"]["Enums"]["object_source_type"] | null
          title?: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["verdict_t"] | null
          yield_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
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
      agent_has_active_subscription: {
        Args: { _agent_id: string }
        Returns: boolean
      }
      current_agent_id: { Args: never; Returns: string }
    }
    Enums: {
      agent_subscription_status: "none" | "trial" | "active"
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
      lead_notification_channel: "email" | "telegram"
      lead_notification_status: "sent" | "failed"
      object_deal_type: "sale" | "rent"
      object_property_type: "residential" | "land" | "micro_commercial"
      object_side: "own_listing" | "client_search"
      object_source_type: "link" | "photo" | "pdf" | "manual"
      object_status: "active" | "sold" | "withdrawn" | "rented"
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
      agent_subscription_status: ["none", "trial", "active"],
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
      lead_notification_channel: ["email", "telegram"],
      lead_notification_status: ["sent", "failed"],
      object_deal_type: ["sale", "rent"],
      object_property_type: ["residential", "land", "micro_commercial"],
      object_side: ["own_listing", "client_search"],
      object_source_type: ["link", "photo", "pdf", "manual"],
      object_status: ["active", "sold", "withdrawn", "rented"],
      verdict_t: ["green", "yellow", "red"],
    },
  },
} as const
