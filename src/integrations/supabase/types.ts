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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      materials: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          id: string
          name: string
          notes: string | null
          purchase_cost: number
          purchase_quantity: number
          purchase_unit: string
          units_per_case: number | null
          updated_at: string
          user_id: string | null
          weight_per_case: number | null
          weight_per_case_unit: string | null
        }
        Insert: {
          category: string
          cost_per_unit: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          purchase_cost: number
          purchase_quantity: number
          purchase_unit: string
          units_per_case?: number | null
          updated_at?: string
          user_id?: string | null
          weight_per_case?: number | null
          weight_per_case_unit?: string | null
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_cost?: number
          purchase_quantity?: number
          purchase_unit?: string
          units_per_case?: number | null
          updated_at?: string
          user_id?: string | null
          weight_per_case?: number | null
          weight_per_case_unit?: string | null
        }
        Relationships: []
      }
      product_component_items: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
          quantity_per_unit: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
          quantity_per_unit?: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
          quantity_per_unit?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_component_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_component_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_formula_items: {
        Row: {
          created_at: string
          id: string
          material_id: string
          percentage: number
          product_id: string
          slot_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          percentage: number
          product_id: string
          slot_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          percentage?: number
          product_id?: string
          slot_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_formula_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_formula_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          fill_unit: string
          fill_weight_per_unit: number
          id: string
          labor_cost_per_unit: number | null
          labor_hours_per_batch: number | null
          labor_rate_per_hour: number | null
          materials_cost_per_unit: number | null
          name: string
          packaging_cost_per_unit: number | null
          product_type: string
          retail_markup: number | null
          retail_price: number | null
          shipping_cost_per_unit: number | null
          shipping_overhead_per_batch: number | null
          total_cogs_per_unit: number | null
          units_per_batch: number
          updated_at: string
          user_id: string | null
          wholesale_markup: number | null
          wholesale_price: number | null
        }
        Insert: {
          created_at?: string
          fill_unit?: string
          fill_weight_per_unit: number
          id?: string
          labor_cost_per_unit?: number | null
          labor_hours_per_batch?: number | null
          labor_rate_per_hour?: number | null
          materials_cost_per_unit?: number | null
          name: string
          packaging_cost_per_unit?: number | null
          product_type: string
          retail_markup?: number | null
          retail_price?: number | null
          shipping_cost_per_unit?: number | null
          shipping_overhead_per_batch?: number | null
          total_cogs_per_unit?: number | null
          units_per_batch?: number
          updated_at?: string
          user_id?: string | null
          wholesale_markup?: number | null
          wholesale_price?: number | null
        }
        Update: {
          created_at?: string
          fill_unit?: string
          fill_weight_per_unit?: number
          id?: string
          labor_cost_per_unit?: number | null
          labor_hours_per_batch?: number | null
          labor_rate_per_hour?: number | null
          materials_cost_per_unit?: number | null
          name?: string
          packaging_cost_per_unit?: number | null
          product_type?: string
          retail_markup?: number | null
          retail_price?: number | null
          shipping_cost_per_unit?: number | null
          shipping_overhead_per_batch?: number | null
          total_cogs_per_unit?: number | null
          units_per_batch?: number
          updated_at?: string
          user_id?: string | null
          wholesale_markup?: number | null
          wholesale_price?: number | null
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
