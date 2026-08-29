import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hcfjdzvzeufeyuoiobjt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZmpkenZ6ZXVmZXl1b2lvYmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNjM2MTYsImV4cCI6MjEwMDgzOTYxNn0.byfYXJLtiNxvK9NbbHwVHK80dYz3wY4SUwWp4t_wZa0';

export const SUPABASE_PROJECT_ID = 'hcfjdzvzeufeyuoiobjt';
export const SUPABASE_URL = supabaseUrl;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to test connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('settings').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 or missing table is acceptable for connection test
      // If table doesn't exist yet, try basic health request
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: supabaseAnonKey }
      });
      if (response.ok) {
        return { success: true, message: 'متصل بـ Supabase بنجاح (المشروع جاهز)' };
      }
      return { success: false, message: `تعذر الاتصال بـ Supabase: ${error.message}` };
    }
    return { success: true, message: 'متصل وقاعدة البيانات تعمل بنجاح' };
  } catch (err: any) {
    return { success: false, message: `خطأ في الاتصال: ${err?.message || 'غير معروف'}` };
  }
}

// SQL Script to create the tables in Supabase SQL Editor if not created yet
export const SUPABASE_SQL_SCHEMA = `-- Supabase SQL Setup for Gym Management Application
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/hcfjdzvzeufeyuoiobjt/sql

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    sport_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    barcode_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    subscription_fee NUMERIC DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    checkin_time TEXT NOT NULL,
    checkin_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_status BOOLEAN DEFAULT FALSE
);

-- 4. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1,
    club_name TEXT NOT NULL DEFAULT 'GymFlow',
    club_whatsapp TEXT NOT NULL DEFAULT '212612345678',
    owner_email TEXT NOT NULL DEFAULT 'owner@gymflow.com',
    sports JSONB DEFAULT '["Gym", "Boxing", "Swimming", "Fitness", "Yoga", "Other"]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Gym Users & Device Binding Table (Single Active Session & Device UUID Binding)
CREATE TABLE IF NOT EXISTS public.gym_users (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    club_name TEXT NOT NULL,
    club_whatsapp TEXT NOT NULL,
    allowed_windows_device_id TEXT,
    allowed_mobile_device_id TEXT,
    active_session_token TEXT,
    last_device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with public access policy for development
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on gym_users" ON public.gym_users FOR ALL USING (true) WITH CHECK (true);
`;
