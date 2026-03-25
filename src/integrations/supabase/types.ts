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
      bookings: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          email: string
          id: string
          insurance: string | null
          is_first_time: boolean | null
          payment_screenshot_url: string | null
          phone: string
          pickup_date: string
          pickup_time_slot: string
          service_plan: Database["public"]["Enums"]["service_plan"]
          status: Database["public"]["Enums"]["booking_status"]
          storage_plan: Database["public"]["Enums"]["storage_plan"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_name: string
          email: string
          id?: string
          insurance?: string | null
          is_first_time?: boolean | null
          payment_screenshot_url?: string | null
          phone: string
          pickup_date: string
          pickup_time_slot: string
          service_plan?: Database["public"]["Enums"]["service_plan"]
          status?: Database["public"]["Enums"]["booking_status"]
          storage_plan: Database["public"]["Enums"]["storage_plan"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          insurance?: string | null
          is_first_time?: boolean | null
          payment_screenshot_url?: string | null
          phone?: string
          pickup_date?: string
          pickup_time_slot?: string
          service_plan?: Database["public"]["Enums"]["service_plan"]
          status?: Database["public"]["Enums"]["booking_status"]
          storage_plan?: Database["public"]["Enums"]["storage_plan"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      return_items: {
        Row: {
          created_at: string
          id: string
          return_request_id: string
          stored_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          return_request_id: string
          stored_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          return_request_id?: string
          stored_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_stored_item_id_fkey"
            columns: ["stored_item_id"]
            isOneToOne: false
            referencedRelation: "stored_items"
            referencedColumns: ["id"]
          },
        ]
      }
      return_requests: {
        Row: {
          booking_id: string
          completed_at: string | null
          id: string
          requested_at: string
          return_address: string
          status: string
        }
        Insert: {
          booking_id: string
          completed_at?: string | null
          id?: string
          requested_at?: string
          return_address: string
          status?: string
        }
        Update: {
          booking_id?: string
          completed_at?: string | null
          id?: string
          requested_at?: string
          return_address?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      stored_items: {
        Row: {
          booking_id: string
          created_at: string
          description: string | null
          id: string
          item_name: string
          quantity: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          quantity?: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stored_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
      booking_status:
        | "pending"
        | "confirmed"
        | "picked_up"
        | "stored"
        | "returned"
      service_plan: "basic" | "elite"
      storage_plan: "economy" | "walk_in_closet" | "store_room" | "premium"
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
      booking_status: [
        "pending",
        "confirmed",
        "picked_up",
        "stored",
        "returned",
      ],
      service_plan: ["basic", "elite"],
      storage_plan: ["economy", "walk_in_closet", "store_room", "premium"],
    },
  },
} as const
