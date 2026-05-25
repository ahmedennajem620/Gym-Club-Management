/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Attendance, Notification, GymStats, SportType } from '../types';

const STORAGE_KEY_MEMBERS = 'gym_members_v1';
const STORAGE_KEY_ATTENDANCE = 'gym_attendance_v1';
const STORAGE_KEY_NOTIFICATIONS = 'gym_notifications_v1';
const STORAGE_KEY_AUTH = 'gym_auth_v1';

// Initial high-fidelity seed data to showcase the app instantly
const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'MBR_10025',
    full_name: 'أحمد النجم',
    phone: '0599123456',
    sport_type: 'Gym',
    start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days ago
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],   // 5 days left (active)
    barcode_id: 'MBR_10025',
    status: 'active',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'MBR_10026',
    full_name: 'سارة أحمد',
    phone: '0599876543',
    sport_type: 'Yoga',
    start_date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 29 days ago
    end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],   // 1 day left (expiring soon - triggers alert)
    barcode_id: 'MBR_10026',
    status: 'active',
    created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'MBR_10027',
    full_name: 'محمد علي',
    phone: '0599223344',
    sport_type: 'Boxing',
    start_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 40 days ago
    end_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],  // Expired 10 days ago
    barcode_id: 'MBR_10027',
    status: 'expired',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'MBR_10028',
    full_name: 'ياسمين مروان',
    phone: '0599556677',
    sport_type: 'Swimming',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode_id: 'MBR_10028',
    status: 'active',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'MBR_10029',
    full_name: 'خالد العتيبي',
    phone: '0566332211',
    sport_type: 'Fitness',
    start_date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expired
    barcode_id: 'MBR_10029',
    status: 'expired',
    created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_ATTENDANCE: Attendance[] = [
  {
    id: 'ATT_2001',
    member_id: 'MBR_10025',
    member_name: 'أحمد النجم',
    checkin_time: '14:30',
    checkin_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ATT_2002',
    member_id: 'MBR_10028',
    member_name: 'ياسمين مروان',
    checkin_time: '09:15',
    checkin_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ATT_2003',
    member_id: 'MBR_10026',
    member_name: 'سارة أحمد',
    checkin_time: '18:45',
    checkin_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT_3001',
    member_id: 'MBR_10027',
    message: 'انتهى اشتراك العضو محمد علي في رياضة الملاكمة (Boxing). يرجى التواصل معه لتجديد الاشتراك.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    read_status: false
  }
];

// Pure client storage and Firebase sync ready service class
export class GymStore {
  private static load<T>(key: string, defaultValue: T[]): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private static save<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Get all members with updated live computed status based on current date
  public static getMembers(): Member[] {
    const members = this.load<Member>(STORAGE_KEY_MEMBERS, DEFAULT_MEMBERS);
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Automatically re-compute live status based on date constraints
    let modified = false;
    const computed = members.map(m => {
      const calculatedStatus: 'active' | 'expired' = m.end_date >= todayStr ? 'active' : 'expired';
      if (m.status !== calculatedStatus) {
        modified = true;
        return { ...m, status: calculatedStatus };
      }
      return m;
    });

    if (modified) {
      this.save(STORAGE_KEY_MEMBERS, computed);
      this.runNotificationCheck(computed);
    }

    return computed;
  }

  public static addMember(member: Omit<Member, 'id' | 'barcode_id' | 'created_at' | 'status'>): Member {
    const members = this.getMembers();
    const sequence = members.length + 10030;
    const newId = `MBR_${sequence}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const status = member.end_date >= todayStr ? 'active' : 'expired';

    const newMember: Member = {
      ...member,
      id: newId,
      barcode_id: newId, // Default Barcode matches Member ID for clean design/reliability
      status,
      created_at: new Date().toISOString()
    };

    members.unshift(newMember); // Put at top of list
    this.save(STORAGE_KEY_MEMBERS, members);
    this.runNotificationCheck(members);
    return newMember;
  }

  public static updateMember(updated: Member): void {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      const todayStr = new Date().toISOString().split('T')[0];
      updated.status = updated.end_date >= todayStr ? 'active' : 'expired';
      members[idx] = updated;
      this.save(STORAGE_KEY_MEMBERS, members);
      this.runNotificationCheck(members);
    }
  }

  public static deleteMember(id: string): void {
    let members = this.getMembers();
    members = members.filter(m => m.id !== id);
    this.save(STORAGE_KEY_MEMBERS, members);
    
    // Also cleanup associated notifications
    let notifications = this.getNotifications();
    notifications = notifications.filter(n => n.member_id !== id);
    this.save(STORAGE_KEY_NOTIFICATIONS, notifications);
  }

  // Attendance Operations
  public static getAttendance(): Attendance[] {
    return this.load<Attendance>(STORAGE_KEY_ATTENDANCE, DEFAULT_ATTENDANCE);
  }

  public static recordAttendance(memberId: string): { success: boolean; message: string; attendance?: Attendance } {
    const members = this.getMembers();
    const member = members.find(m => m.barcode_id === memberId || m.id === memberId);

    if (!member) {
      return { success: false, message: 'عضوا غير مسجل، يرجى التثبت من الرمز.' };
    }

    // Check subscription status
    const todayStr = new Date().toISOString().split('T')[0];
    if (member.end_date < todayStr) {
      return { success: false, message: `الاشتراك منتهي للعضو: ${member.full_name}` };
    }

    const attendanceList = this.getAttendance();
    const now = new Date();
    
    // Avoid double check-in on the exact same day to stay robust
    const todayCheckin = attendanceList.find(
      a => a.member_id === member.id && a.checkin_date === todayStr
    );

    if (todayCheckin) {
      return { 
        success: true, 
        message: `العضو ${member.full_name} مسجل حضوره مسبقاً اليوم عند الساعة ${todayCheckin.checkin_time}`,
        attendance: todayCheckin
      };
    }

    const newCheckin: Attendance = {
      id: `ATT_${Date.now()}`,
      member_id: member.id,
      member_name: member.full_name,
      checkin_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      checkin_date: todayStr
    };

    attendanceList.unshift(newCheckin);
    this.save(STORAGE_KEY_ATTENDANCE, attendanceList);

    return { success: true, message: `تم تسجيل الحضور بنجاح: ${member.full_name}`, attendance: newCheckin };
  }

  // Notification Operations
  public static getNotifications(): Notification[] {
    return this.load<Notification>(STORAGE_KEY_NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }

  public static markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].read_status = true;
      this.save(STORAGE_KEY_NOTIFICATIONS, list);
    }
  }

  public static clearAllNotifications(): void {
    this.save(STORAGE_KEY_NOTIFICATIONS, []);
  }

  // Stats aggregator
  public static getStats(): GymStats {
    const members = this.getMembers();
    const attendance = this.getAttendance();
    const notifications = this.getNotifications();
    
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceToday = attendance.filter(a => a.checkin_date === todayStr).length;
    
    const expiredCount = members.filter(m => m.status === 'expired').length;
    
    // Active members check if expiring in <= 3 days
    const expiringSoonCount = members.filter(m => {
      if (m.status !== 'active') return false;
      const msLeft = new Date(m.end_date).getTime() - new Date(todayStr).getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 3;
    }).length;

    return {
      totalMembers: members.length,
      attendanceToday,
      expiredCount,
      expiringSoonCount
    };
  }

  // Automatic Subscription Expiry Scanner
  // Alerts if <= 3 days remaining and no notification exists yet
  private static runNotificationCheck(members: Member[]): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const notifications = this.load<Notification>(STORAGE_KEY_NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    let modified = false;

    members.forEach(m => {
      if (m.status === 'active') {
        const end = new Date(m.end_date);
        const msLeft = end.getTime() - today.getTime();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

        if (daysLeft >= 0 && daysLeft <= 3) {
          // Check if warning already exists
          const exists = notifications.some(
            n => n.member_id === m.id && n.message.includes('سينتهي بعد')
          );

          if (!exists) {
            const warningMsg = `اشتراك العضو ${m.full_name} سينتهي بعد ${daysLeft === 0 ? 'اليوم' : daysLeft === 1 ? 'يوم واحد' : daysLeft === 2 ? 'يومين' : daysLeft + ' أيام'}! (تاريخ الانتهاء: ${m.end_date})`;
            notifications.unshift({
              id: `NOT_ALERT_${Date.now()}_${m.id}`,
              member_id: m.id,
              message: warningMsg,
              created_at: new Date().toISOString(),
              read_status: false
            });
            modified = true;
          }
        }
      }
    });

    if (modified) {
      this.save(STORAGE_KEY_NOTIFICATIONS, notifications);
    }
  }

  // Mock Authentication Handling matching the specified Email & Password Auth workflow
  public static getLoggedUser(): { email: string } | null {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    return raw ? JSON.parse(raw) : null;
  }

  public static loginUser(email: string): void {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ email }));
  }

  public static logoutUser(): void {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }
}
