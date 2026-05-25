/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SportType = 'Gym' | 'Boxing' | 'Swimming' | 'Fitness' | 'Yoga' | 'Other';

export interface Member {
  id: string;
  full_name: string;
  phone: string;
  sport_type: SportType;
  start_date: string; // ISO date string (YYYY-MM-DD or full timestamp)
  end_date: string; // ISO date string
  barcode_id: string;
  status: 'active' | 'expired';
  created_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  member_name: string;
  checkin_time: string; // e.g. "14:32"
  checkin_date: string; // e.g. "2026-05-25"
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
}
