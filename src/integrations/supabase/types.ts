export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      copy_assets: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          launch_id: string
          media_url: string | null
          status: Database["public"]["Enums"]["copy_status"] | null
          title: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          launch_id: string
          media_url?: string | null
          status?: Database["public"]["Enums"]["copy_status"] | null
          title: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          launch_id?: string
          media_url?: string | null
          status?: Database["public"]["Enums"]["copy_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "copy_assets_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_notifications: {
        Row: {
          copy_asset_id: string
          created_at: string
          id: string
          manager_id: string
          read_at: string | null
          status: string
          type: string
        }
        Insert: {
          copy_asset_id: string
          created_at?: string
          id?: string
          manager_id: string
          read_at?: string | null
          status?: string
          type: string
        }
        Update: {
          copy_asset_id?: string
          created_at?: string
          id?: string
          manager_id?: string
          read_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_notifications_copy_asset_id_fkey"
            columns: ["copy_asset_id"]
            isOneToOne: false
            referencedRelation: "copy_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      launches: {
        Row: {
          created_at: string | null
          id: string
          launch_code: string
          name: string
          status: Database["public"]["Enums"]["launch_status"] | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          launch_code: string
          name: string
          status?: Database["public"]["Enums"]["launch_status"] | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          launch_code?: string
          name?: string
          status?: Database["public"]["Enums"]["launch_status"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launches_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          launch_id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          tags: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          launch_id: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          tags?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          launch_id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          id: string
          launch_id: string
          lead_id: string | null
          payment_method: string | null
          platform: string | null
          product_name: string | null
          status: Database["public"]["Enums"]["sale_status"]
          transaction_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          id?: string
          launch_id: string
          lead_id?: string | null
          payment_method?: string | null
          platform?: string | null
          product_name?: string | null
          status: Database["public"]["Enums"]["sale_status"]
          transaction_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          id?: string
          launch_id?: string
          lead_id?: string | null
          payment_method?: string | null
          platform?: string | null
          product_name?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          copy_asset_id: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          target_group_id: string
        }
        Insert: {
          copy_asset_id: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          target_group_id: string
        }
        Update: {
          copy_asset_id?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          target_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_copy_asset_id_fkey"
            columns: ["copy_asset_id"]
            isOneToOne: false
            referencedRelation: "copy_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_target_group_id_fkey"
            columns: ["target_group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_integrations: {
        Row: {
          created_at: string | null
          field_mappings: Json
          id: string
          is_active: boolean | null
          launch_id: string
          name: string
          permanent_webhook_id: string
          platform: string | null
        }
        Insert: {
          created_at?: string | null
          field_mappings: Json
          id?: string
          is_active?: boolean | null
          launch_id: string
          name: string
          permanent_webhook_id: string
          platform?: string | null
        }
        Update: {
          created_at?: string | null
          field_mappings?: Json
          id?: string
          is_active?: boolean | null
          launch_id?: string
          name?: string
          permanent_webhook_id?: string
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_integrations_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_groups: {
        Row: {
          group_id: string
          group_name: string | null
          id: string
          instance_id: string
          is_active: boolean | null
        }
        Insert: {
          group_id: string
          group_name?: string | null
          id?: string
          instance_id: string
          is_active?: boolean | null
        }
        Update: {
          group_id?: string
          group_name?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_groups_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          api_key: string | null
          created_at: string | null
          id: string
          instance_name: string
          launch_id: string
          qr_code_url: string | null
          status: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          instance_name: string
          launch_id: string
          qr_code_url?: string | null
          status?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          instance_name?: string
          launch_id?: string
          qr_code_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      copy_status: "draft" | "review" | "approved"
      launch_status: "planning" | "active" | "closed"
      message_type:
        | "text"
        | "image"
        | "video"
        | "document"
        | "email"
        | "whatsapp"
      sale_status:
        | "waiting_payment"
        | "paid"
        | "refunded"
        | "abandoned_checkout"
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
      copy_status: ["draft", "review", "approved"],
      launch_status: ["planning", "active", "closed"],
      message_type: ["text", "image", "video", "document", "email", "whatsapp"],
      sale_status: [
        "waiting_payment",
        "paid",
        "refunded",
        "abandoned_checkout",
      ],
    },
  },
} as const
