// Generated types placeholder - run `supabase gen types typescript` to generate actual types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      users: {
        Row: {
          id: string;
          created_at: string;
          last_location: unknown | null;
          preferences: Json;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          is_anonymous: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          last_location?: unknown | null;
          preferences?: Json;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          is_anonymous?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          last_location?: unknown | null;
          preferences?: Json;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          is_anonymous?: boolean;
        };
      };
      picks_history: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          restaurant_name: string;
          restaurant_data: Json | null;
          picked_at: string;
          was_accepted: boolean;
          retry_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          restaurant_name: string;
          restaurant_data?: Json | null;
          picked_at?: string;
          was_accepted?: boolean;
          retry_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          restaurant_name?: string;
          restaurant_data?: Json | null;
          picked_at?: string;
          was_accepted?: boolean;
          retry_count?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          restaurant_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          restaurant_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          restaurant_data?: Json;
          created_at?: string;
        };
      };
      blacklist: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          restaurant_name: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          restaurant_name: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          restaurant_name?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
