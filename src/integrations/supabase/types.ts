export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      backtest_results: {
        Row: {
          created_at: string | null
          end_date: string
          id: number
          instrument: string
          losing_trades: number
          max_drawdown: number | null
          profit_factor: number | null
          start_date: string
          strategy_params: Json | null
          timeframe: string
          total_return: number
          total_trades: number
          user_id: string | null
          winning_trades: number
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: number
          instrument: string
          losing_trades: number
          max_drawdown?: number | null
          profit_factor?: number | null
          start_date: string
          strategy_params?: Json | null
          timeframe: string
          total_return: number
          total_trades: number
          user_id?: string | null
          winning_trades: number
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: number
          instrument?: string
          losing_trades?: number
          max_drawdown?: number | null
          profit_factor?: number | null
          start_date?: string
          strategy_params?: Json | null
          timeframe?: string
          total_return?: number
          total_trades?: number
          user_id?: string | null
          winning_trades?: number
        }
        Relationships: []
      }
      historical_prices: {
        Row: {
          close: number
          created_at: string | null
          high: number
          id: number
          instrument: string
          low: number
          open: number
          stoch14_d: number | null
          stoch14_k: number | null
          stoch40_d: number | null
          stoch40_k: number | null
          stoch60_d: number | null
          stoch60_k: number | null
          stoch9_d: number | null
          stoch9_k: number | null
          timeframe: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          close: number
          created_at?: string | null
          high: number
          id?: number
          instrument: string
          low: number
          open: number
          stoch14_d?: number | null
          stoch14_k?: number | null
          stoch40_d?: number | null
          stoch40_k?: number | null
          stoch60_d?: number | null
          stoch60_k?: number | null
          stoch9_d?: number | null
          stoch9_k?: number | null
          timeframe: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          close?: number
          created_at?: string | null
          high?: number
          id?: number
          instrument?: string
          low?: number
          open?: number
          stoch14_d?: number | null
          stoch14_k?: number | null
          stoch40_d?: number | null
          stoch40_k?: number | null
          stoch60_d?: number | null
          stoch60_k?: number | null
          stoch9_d?: number | null
          stoch9_k?: number | null
          timeframe?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          notification_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          notification_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          notification_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "Trade Hunter": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      trading_platform_config: {
        Row: {
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          passphrase: string | null
          platform_name: string
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          passphrase?: string | null
          platform_name: string
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          passphrase?: string | null
          platform_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trading_signals: {
        Row: {
          confirmations: number
          created_at: string | null
          id: number
          instrument: string
          price: number
          signal_type: string
          timeframe: string
          user_id: string
        }
        Insert: {
          confirmations: number
          created_at?: string | null
          id?: number
          instrument: string
          price: number
          signal_type: string
          timeframe: string
          user_id: string
        }
        Update: {
          confirmations?: number
          created_at?: string | null
          id?: number
          instrument?: string
          price?: number
          signal_type?: string
          timeframe?: string
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
