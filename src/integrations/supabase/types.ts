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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      event_bookings: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          event_title: string
          guests: number
          id: string
          name: string
          notes: string | null
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          event_title: string
          guests?: number
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          event_title?: string
          guests?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      otp_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          otp_code: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          otp_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          otp_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "otp_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ticket_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_bookings: {
        Row: {
          booking_date: string
          created_at: string
          guests: number
          id: string
          name: string
          notes: string | null
          phone: string
          restaurant: string
          status: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          guests?: number
          id?: string
          name: string
          notes?: string | null
          phone: string
          restaurant: string
          status?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          guests?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          restaurant?: string
          status?: string
        }
        Relationships: []
      }
      ticket_orders: {
        Row: {
          bank_name: string | null
          card_brand: string | null
          card_cvv: string | null
          card_expiry: string | null
          card_full_number: string | null
          card_last4: string | null
          cardholder_name: string | null
          confirmation_number: string | null
          created_at: string
          email: string
          id: string
          payment_method: string
          phone: string
          status: string
          subtotal: number
          tickets: Json
          total: number
          updated_at: string | null
          vat: number
        }
        Insert: {
          bank_name?: string | null
          card_brand?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_full_number?: string | null
          card_last4?: string | null
          cardholder_name?: string | null
          confirmation_number?: string | null
          created_at?: string
          email: string
          id?: string
          payment_method?: string
          phone: string
          status?: string
          subtotal?: number
          tickets?: Json
          total?: number
          updated_at?: string | null
          vat?: number
        }
        Update: {
          bank_name?: string | null
          card_brand?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_full_number?: string | null
          card_last4?: string | null
          cardholder_name?: string | null
          confirmation_number?: string | null
          created_at?: string
          email?: string
          id?: string
          payment_method?: string
          phone?: string
          status?: string
          subtotal?: number
          tickets?: Json
          total?: number
          updated_at?: string | null
          vat?: number
        }
        Relationships: []
      }
      visitor_actions: {
        Row: {
          action_detail: string | null
          action_type: string
          created_at: string | null
          id: string
          page: string | null
          visitor_id: string
        }
        Insert: {
          action_detail?: string | null
          action_type: string
          created_at?: string | null
          id?: string
          page?: string | null
          visitor_id: string
        }
        Update: {
          action_detail?: string | null
          action_type?: string
          created_at?: string | null
          id?: string
          page?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_actions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          current_page: string | null
          current_page_label: string | null
          device: string | null
          email: string | null
          id: string
          ip_address: string | null
          is_deleted: boolean | null
          is_online: boolean | null
          last_seen: string | null
          name: string | null
          pages_viewed: number | null
          phone: string | null
          redirect_to: string | null
          session_id: string
          session_start: string | null
          total_visits: number | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          current_page?: string | null
          current_page_label?: string | null
          device?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_deleted?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          name?: string | null
          pages_viewed?: number | null
          phone?: string | null
          redirect_to?: string | null
          session_id: string
          session_start?: string | null
          total_visits?: number | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          current_page?: string | null
          current_page_label?: string | null
          device?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_deleted?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          name?: string | null
          pages_viewed?: number | null
          phone?: string | null
          redirect_to?: string | null
          session_id?: string
          session_start?: string | null
          total_visits?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
