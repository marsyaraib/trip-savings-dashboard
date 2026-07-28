// Hand-written types mirroring supabase/migrations/0001_init.sql
export interface Database {
  public: {
    Tables: {
      payments: {
        Row: {
          id: string;
          member_name: string;
          payment_month: number;
          payment_year: number;
          payment_date: string;
          amount: number;
          note: string | null;
          proof_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_name: string;
          payment_month: number;
          payment_year: number;
          payment_date: string;
          amount: number;
          note?: string | null;
          proof_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_name?: string;
          payment_month?: number;
          payment_year?: number;
          payment_date?: string;
          amount?: number;
          note?: string | null;
          proof_image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          activity: string;
          activity_type: string;
          member_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity: string;
          activity_type: string;
          member_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity?: string;
          activity_type?: string;
          member_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_settings: {
        Row: {
          id: string;
          admin_pin: string;
        };
        Insert: {
          id?: string;
          admin_pin: string;
        };
        Update: {
          id?: string;
          admin_pin?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          key: string;
          display_name: string;
          photo_url: string | null;
          initials: string;
          color_class: string;
          ring_class: string;
          hex: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          key: string;
          display_name: string;
          photo_url?: string | null;
          initials: string;
          color_class: string;
          ring_class: string;
          hex: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          key?: string;
          display_name?: string;
          photo_url?: string | null;
          initials?: string;
          color_class?: string;
          ring_class?: string;
          hex?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      verify_admin_pin: {
        Args: { pin_attempt: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
