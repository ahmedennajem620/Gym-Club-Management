import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';

class SupabaseService {
  static const String supabaseUrl = 'https://rrwnlwxmqcxpjcebxpzj.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_Q9jk7_xoDL_x5j1dG-2mSw_pJ0M5_';
  static const String projectId = 'rrwnlwxmqcxpjcebxpzj';

  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    try {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
    } catch (e) {
      // Ignored if already initialized or offline
    }
  }

  /// Test Supabase connection
  static Future<Map<String, dynamic>> testConnection() async {
    try {
      final res = await client.from('settings').select().limit(1);
      return {'success': true, 'message': 'متصل بقاعدة بيانات Supabase بنجاح'};
    } catch (e) {
      return {'success': false, 'message': 'خطأ في الاتصال: $e'};
    }
  }

  /// Fetch all members from Supabase
  static Future<List<Member>> fetchMembers() async {
    try {
      final List<dynamic> data = await client.from('members').select().order('created_at', ascending: false);
      return data.map((json) => Member.fromMap(json as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Upsert Member
  static Future<void> upsertMember(Member member) async {
    try {
      await client.from('members').upsert(member.toMap());
    } catch (e) {
      // Silently log or rethrow
    }
  }

  /// Delete Member
  static Future<void> deleteMember(String id) async {
    try {
      await client.from('members').delete().eq('id', id);
    } catch (e) {
      // Ignore
    }
  }

  /// Fetch all attendance records
  static Future<List<Attendance>> fetchAttendance() async {
    try {
      final List<dynamic> data = await client.from('attendance').select().order('created_at', ascending: false);
      return data.map((json) => Attendance.fromMap(json as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Upsert Attendance
  static Future<void> upsertAttendance(Attendance attendance) async {
    try {
      await client.from('attendance').upsert(attendance.toMap());
    } catch (e) {
      // Ignore
    }
  }

  /// Delete Attendance
  static Future<void> deleteAttendance(String id) async {
    try {
      await client.from('attendance').delete().eq('id', id);
    } catch (e) {
      // Ignore
    }
  }

  /// Fetch Notifications
  static Future<List<NotificationModel>> fetchNotifications() async {
    try {
      final List<dynamic> data = await client.from('notifications').select().order('created_at', ascending: false);
      return data.map((json) => NotificationModel.fromMap(json as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Upsert Notification
  static Future<void> upsertNotification(NotificationModel notification) async {
    try {
      await client.from('notifications').upsert(notification.toMap());
    } catch (e) {
      // Ignore
    }
  }

  /// Fetch Settings
  static Future<GymSettings?> fetchSettings() async {
    try {
      final data = await client.from('settings').select().limit(1).maybeSingle();
      if (data != null) {
        return GymSettings.fromMap(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Upsert Settings
  static Future<void> upsertSettings(GymSettings settings) async {
    try {
      await client.from('settings').upsert({
        'id': 1,
        'club_name': settings.clubName,
        'club_whatsapp': settings.clubWhatsapp,
        'owner_email': settings.ownerEmail,
        'sports': settings.sports,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      // Ignore
    }
  }

  /// SQL Schema for Supabase
  static const String sqlSchema = '''-- Supabase SQL Schema for Gym Management Application
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

CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    checkin_time TEXT NOT NULL,
    checkin_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1,
    club_name TEXT NOT NULL DEFAULT 'إدارة جم كلوب',
    club_whatsapp TEXT NOT NULL DEFAULT '212612345678',
    owner_email TEXT NOT NULL DEFAULT 'owner@gymclub.com',
    sports JSONB DEFAULT '["Gym", "Boxing", "Swimming", "Fitness", "Yoga", "Other"]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
''';
}
