/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SportType = string;

export interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  email_verified?: boolean;
  sport_type: SportType;
  start_date: string; // ISO date string (YYYY-MM-DD or full timestamp)
  end_date: string; // ISO date string
  barcode_id: string;
  status: 'active' | 'expired';
  created_at: string;
  subscription_fee?: number;
}

export interface Coach {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  specialty: string;
  salary?: number;
  hire_date: string;
  barcode_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  member_id: string; // Person ID (Member or Coach)
  member_name: string; // Person Name
  checkin_time: string; // e.g. "14:32"
  checkin_date: string; // e.g. "2026-05-25"
  person_type?: 'member' | 'coach';
  sport_or_specialty?: string;
}

export interface Notification {
  id: string;
  member_id: string;
  message: string;
  created_at: string;
  read_status: boolean;
}

export interface GymStats {
  totalMembers: number;
  attendanceToday: number;
  expiredCount: number;
  expiringSoonCount: number;
  totalCoaches?: number;
  coachesPresentToday?: number;
}

export interface GymSettings {
  club_name: string;
  club_whatsapp: string;
  owner_email: string;
  sports: string[];
}

export interface DeviceBindingInfo {
  device_id: string;
  device_name: string;
  device_type: 'windows' | 'mobile' | 'desktop';
  os_name?: string;
  browser_name?: string;
  bound_at: string;
  last_active_at: string;
}

export interface GymUser {
  email: string;
  password_hash: string;
  club_name: string;
  club_whatsapp: string;
  created_at: string;
  allowed_windows_device_id?: string | null;
  allowed_mobile_device_id?: string | null;
  active_session_token?: string | null;
  last_login_at?: string;
  device_bindings?: {
    windows?: DeviceBindingInfo;
    mobile?: DeviceBindingInfo;
  };
}

export interface AuthResult {
  success: boolean;
  user?: GymUser;
  error?: string;
  deviceMismatch?: boolean;
  boundDeviceId?: string;
  attemptedDeviceId?: string;
  deviceType?: 'windows' | 'mobile' | 'desktop';
  sessionToken?: string;
}

