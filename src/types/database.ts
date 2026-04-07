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
      creatives: {
        Row: {
          ai_metadata: Json | null
          ai_prompt: string | null
          copy_text: string | null
          created_at: string
          cta_text: string | null
          format: string
          generated_copy: string | null
          headline: string | null
          id: string
          image_url: string | null
          original_image_url: string | null
          property_id: string | null
          status: string
          template_id: string | null
          title: string | null
          type: string
          user_id: string
          variation_group_id: string | null
          variation_number: number
        }
        Insert: {
          ai_metadata?: Json | null
          ai_prompt?: string | null
          copy_text?: string | null
          created_at?: string
          cta_text?: string | null
          format?: string
          generated_copy?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          original_image_url?: string | null
          property_id?: string | null
          status?: string
          template_id?: string | null
          title?: string | null
          type: string
          user_id: string
          variation_group_id?: string | null
          variation_number?: number
        }
        Update: {
          ai_metadata?: Json | null
          ai_prompt?: string | null
          copy_text?: string | null
          created_at?: string
          cta_text?: string | null
          format?: string
          generated_copy?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          original_image_url?: string | null
          property_id?: string | null
          status?: string
          template_id?: string | null
          title?: string | null
          type?: string
          user_id?: string
          variation_group_id?: string | null
          variation_number?: number
        }
        Relationships: []
      }
      credits: {
        Row: {
          balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          credits_per_month: number
          features: Json
          id: string
          is_active: boolean
          max_properties: number
          name: string
          price_cents: number
          slug: string | null
        }
        Insert: {
          created_at?: string
          credits_per_month?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_properties?: number
          name: string
          price_cents?: number
          slug?: string | null
        }
        Update: {
          created_at?: string
          credits_per_month?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_properties?: number
          name?: string
          price_cents?: number
          slug?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          asaas_customer_id: string | null
          avatar_url: string | null
          brand_colors: Json | null
          brand_personality: string | null
          company_description: string | null
          company_logo_url: string | null
          company_name: string | null
          cpf_cnpj: string | null
          created_at: string
          creci: string | null
          full_name: string | null
          id: string
          phone: string | null
          plan_id: string | null
          preferred_style: string | null
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          brand_colors?: Json | null
          brand_personality?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          plan_id?: string | null
          preferred_style?: string | null
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          brand_colors?: Json | null
          brand_personality?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan_id?: string | null
          preferred_style?: string | null
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          highlights: string[] | null
          id: string
          image_labels: string[] | null
          images: string[] | null
          is_active: boolean
          location: string | null
          parking_spots: number | null
          price_cents: number
          state: string | null
          target_audience: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          highlights?: string[] | null
          id?: string
          image_labels?: string[] | null
          images?: string[] | null
          is_active?: boolean
          location?: string | null
          parking_spots?: number | null
          price_cents?: number
          state?: string | null
          target_audience?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          highlights?: string[] | null
          id?: string
          image_labels?: string[] | null
          images?: string[] | null
          is_active?: boolean
          location?: string | null
          parking_spots?: number | null
          price_cents?: number
          state?: string | null
          target_audience?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          external_subscription_id: string | null
          external_reference: string | null
          id: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_subscription_id?: string | null
          external_reference?: string | null
          id?: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_subscription_id?: string | null
          external_reference?: string | null
          id?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_categories: {
        Row: {
          id: string
          slug: string
          label: string
          description: string | null
          prompt_template: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          description?: string | null
          prompt_template: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          description?: string | null
          prompt_template?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          preview_url: string | null
          type: string
        }
        Insert: {
          category: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          preview_url?: string | null
          type: string
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_url?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
