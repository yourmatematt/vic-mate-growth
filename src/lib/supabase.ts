/**
 * Supabase Client Configuration
 * Initializes Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database type definitions for better TypeScript support
export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          business_name: string;
          business_type: string | null;
          business_location: string | null;
          current_marketing: string[] | null;
          biggest_challenge: string;
          monthly_revenue_range: string | null;
          preferred_date: string;
          preferred_time_slot: string;
          additional_notes: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
          google_calendar_event_id: string | null;
          google_meet_link: string | null;
          confirmation_sent_at: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          business_name: string;
          business_type?: string | null;
          business_location?: string | null;
          current_marketing?: string[] | null;
          biggest_challenge: string;
          monthly_revenue_range?: string | null;
          preferred_date: string;
          preferred_time_slot: string;
          additional_notes?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
          google_calendar_event_id?: string | null;
          google_meet_link?: string | null;
          confirmation_sent_at?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          business_name?: string;
          business_type?: string | null;
          business_location?: string | null;
          current_marketing?: string[] | null;
          biggest_challenge?: string;
          monthly_revenue_range?: string | null;
          preferred_date?: string;
          preferred_time_slot?: string;
          additional_notes?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
          google_calendar_event_id?: string | null;
          google_meet_link?: string | null;
          confirmation_sent_at?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      available_time_slots: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          max_bookings_per_slot: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          max_bookings_per_slot?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          max_bookings_per_slot?: number;
          created_at?: string;
        };
      };
      booking_blackout_dates: {
        Row: {
          id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_available_slots: {
        Args: {
          date_start: string;
          date_end: string;
        };
        Returns: {
          slot_date: string;
          day_name: string;
          start_time: string;
          end_time: string;
          available_count: number;
        }[];
      };
    };
  };
};

export default supabase;