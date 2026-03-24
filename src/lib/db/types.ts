export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name_en: string;
          name_ko: string;
          acronym: string;
          website_url: string;
          jurisdiction: string;
          description_en: string | null;
          description_ko: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agencies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agencies"]["Insert"]>;
      };
      regulations: {
        Row: {
          id: string;
          agency_id: string;
          title_en: string;
          title_ko: string | null;
          short_name: string;
          statute_type: string;
          official_url: string;
          gazette_citation: string | null;
          effective_date: string | null;
          last_amended: string | null;
          is_active: boolean;
          applies_to: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["regulations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["regulations"]["Insert"]>;
      };
      regulation_sections: {
        Row: {
          id: string;
          regulation_id: string;
          parent_section_id: string | null;
          section_number: string;
          title_en: string;
          title_ko: string | null;
          content_en: string;
          content_ko: string | null;
          section_url: string | null;
          topics: string[];
          applies_to: string[];
          depth_level: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["regulation_sections"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["regulation_sections"]["Insert"]>;
      };
      regulation_chunks: {
        Row: {
          id: string;
          section_id: string;
          chunk_text: string;
          chunk_index: number;
          embedding: number[] | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["regulation_chunks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["regulation_chunks"]["Insert"]>;
      };
      market_products: {
        Row: {
          id: string;
          product_name: string;
          brand: string | null;
          category: string;
          subcategory: string | null;
          origin_country: string | null;
          retailer: string | null;
          product_url: string | null;
          din_npn: string | null;
          ingredients: string[] | null;
          compliance_notes: string | null;
          is_recalled: boolean;
          recall_details: string | null;
          last_verified: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["market_products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["market_products"]["Insert"]>;
      };
      qa_sessions: {
        Row: {
          id: string;
          question: string;
          answer: string;
          citations: unknown;
          verification: unknown;
          market_check: unknown;
          confidence: string;
          language: string;
          processing_time_ms: number | null;
          session_id: string | null;
          retrieval_score: number | null;
          contexts_found: number | null;
          topics_matched: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["qa_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["qa_sessions"]["Insert"]>;
      };
      analytics_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          event_action: string;
          language: string;
          processing_time_ms: number | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };
      content_gap_signals: {
        Row: {
          id: string;
          query: string;
          query_language: string;
          confidence: number | null;
          retrieval_score: number | null;
          contexts_found: number;
          gap_type: string;
          matched_topics: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content_gap_signals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["content_gap_signals"]["Insert"]>;
      };
    };
  };
}
