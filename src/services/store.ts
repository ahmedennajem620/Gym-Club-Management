/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Coach, Attendance, Notification, GymStats, SportType, GymSettings, GymUser, AuthResult, DeviceBindingInfo } from '../types';
import { supabase } from '../lib/supabase';
import { getOrCreateDeviceUUID, DeviceInfo } from '../lib/deviceFingerprint';

const STORAGE_KEY_MEMBERS = 'gym_members_v1';
const STORAGE_KEY_COACHES = 'gym_coaches_v1';
const STORAGE_KEY_ATTENDANCE = 'gym_attendance_v1';
const STORAGE_KEY_NOTIFICATIONS = 'gym_notifications_v1';
const STORAGE_KEY_AUTH = 'gym_auth_v1';
const STORAGE_KEY_REMEMBERED = 'gym_remembered_v1';
const STORAGE_KEY_SETTINGS = 'gym_settings_v1';
const STORAGE_KEY_SESSION_TOKEN = 'gym_session_token_v1';

const DEFAULT_SETTINGS: GymSettings = {
  club_name: 'GymFlow',
  club_whatsapp: '212612345678',
  owner_email: 'owner@gymflow.com',
  sports: ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other']
};

const DEFAULT_COACHES: Coach[] = [
  {
    id: 'COA_101',
    full_name: 'الكابتن طارق الحسني',
    phone: '0661234567',
    email: 'tarek.coach@gymclub.com',
    specialty: 'Gym',
    salary: 4500,
    hire_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode_id: 'COA_101',
    status: 'active',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'مدرب معتمد لكمال الأجسام والتحضير للبطولات والتغذية الرياضية'
  },
  {
    id: 'COA_102',
    full_name: 'الكابتن ليلى الودغيري',
    phone: '0669876543',
    email: 'laila.coach@gymclub.com',
    specialty: 'Yoga',
    salary: 4000,
    hire_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode_id: 'COA_102',
    status: 'active',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'مدربة معتمدة في اليوجا، البيلاتس، واللياقة البدنية العامة للسيدات'
  },
  {
    id: 'COA_103',
    full_name: 'الكابتن يوسف البكري',
    phone: '0665544332',
    email: 'youssef.coach@gymclub.com',
    specialty: 'Boxing',
    salary: 4200,
    hire_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode_id: 'COA_103',
    status: 'active',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'بطل سابق ومدرب ملاكمة وكيك بوكسينغ مع تدريبات الدفاع عن النفس'
  }
];

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
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_fee: 250
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
    created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_fee: 300
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
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_fee: 200
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
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_fee: 400
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
    created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_fee: 250
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

  public static migratePhone(phone: string): string {
    const clean = phone.trim();
    if (clean.startsWith('+966')) {
      return '+212' + clean.slice(4);
    }
    if (clean.startsWith('00966')) {
      return '00212' + clean.slice(5);
    }
    if (clean.startsWith('966')) {
      return '212' + clean.slice(3);
    }
    return phone;
  }

  // Get all members with updated live computed status based on current date
  public static getMembers(): Member[] {
    const members = this.load<Member>(STORAGE_KEY_MEMBERS, DEFAULT_MEMBERS);
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Automatically re-compute live status based on date constraints
    let modified = false;
    const computed = members.map(m => {
      let updatedPhone = m.phone;
      if (m.phone) {
        const migrated = GymStore.migratePhone(m.phone);
        if (migrated !== m.phone) {
          updatedPhone = migrated;
          modified = true;
        }
      }

      const calculatedStatus: 'active' | 'expired' = m.end_date >= todayStr ? 'active' : 'expired';
      if (m.status !== calculatedStatus || updatedPhone !== m.phone) {
        modified = true;
        return { ...m, phone: updatedPhone, status: calculatedStatus };
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

    // Migrate phone if entered with 966 prefix
    const phone = GymStore.migratePhone(member.phone);

    const newMember: Member = {
      ...member,
      phone,
      id: newId,
      barcode_id: newId, // Default Barcode matches Member ID for clean design/reliability
      status,
      email_verified: member.email ? false : undefined,
      created_at: new Date().toISOString()
    };

    members.unshift(newMember); // Put at top of list
    this.save(STORAGE_KEY_MEMBERS, members);
    this.runNotificationCheck(members);
    GymStore.syncMemberToSupabase(newMember);
    return newMember;
  }

  public static updateMember(updated: Member): void {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      const todayStr = new Date().toISOString().split('T')[0];
      updated.status = updated.end_date >= todayStr ? 'active' : 'expired';

      // Migrate phone
      updated.phone = GymStore.migratePhone(updated.phone);

      const oldEmail = members[idx].email;
      const newEmail = updated.email;

      if (newEmail && newEmail !== oldEmail) {
        // Reset email verification state if email was changed or set
        updated.email_verified = false;
      }

      members[idx] = updated;
      this.save(STORAGE_KEY_MEMBERS, members);
      this.runNotificationCheck(members);
      GymStore.syncMemberToSupabase(updated);
    }
  }

  // Simulated Verification Email Server Sandbox Helper Methods
  public static getSimulatedEmails(): any[] {
    return this.load<any>('gym_emails_v1', []);
  }

  public static addSimulatedEmail(email: any): void {
    const emails = this.getSimulatedEmails();
    emails.unshift(email);
    this.save('gym_emails_v1', emails);
  }

  public static verifyMemberEmail(memberId: string): void {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx !== -1) {
      members[idx].email_verified = true;
      this.save(STORAGE_KEY_MEMBERS, members);
    }

    // Mark as verified in the simulated emails database too
    const emails = this.getSimulatedEmails();
    const updatedEmails = emails.map(e => {
      if (e.memberId === memberId) {
        return { ...e, verified: true };
      }
      return e;
    });
    this.save('gym_emails_v1', updatedEmails);
  }

  public static deleteMember(id: string): void {
    let members = this.getMembers();
    members = members.filter(m => m.id !== id);
    this.save(STORAGE_KEY_MEMBERS, members);
    
    // Also cleanup associated notifications
    let notifications = this.getNotifications();
    notifications = notifications.filter(n => n.member_id !== id);
    this.save(STORAGE_KEY_NOTIFICATIONS, notifications);
    GymStore.deleteMemberFromSupabase(id);
  }

  // ==========================================
  // Coach / Trainer Operations
  // ==========================================
  public static getCoaches(): Coach[] {
    const coaches = this.load<Coach>(STORAGE_KEY_COACHES, DEFAULT_COACHES);
    let modified = false;
    const computed = coaches.map(c => {
      let updatedPhone = c.phone;
      if (c.phone) {
        const migrated = GymStore.migratePhone(c.phone);
        if (migrated !== c.phone) {
          updatedPhone = migrated;
          modified = true;
        }
      }
      if (updatedPhone !== c.phone) {
        return { ...c, phone: updatedPhone };
      }
      return c;
    });

    if (modified) {
      this.save(STORAGE_KEY_COACHES, computed);
    }
    return computed;
  }

  public static getCoachById(id: string): Coach | undefined {
    return this.getCoaches().find(c => c.id === id || c.barcode_id === id);
  }

  public static addCoach(coachData: Partial<Coach>): Coach {
    const coaches = this.getCoaches();
    const id = `COA_${Math.floor(1000 + Math.random() * 9000)}`;
    const newCoach: Coach = {
      id: coachData.id || id,
      full_name: coachData.full_name || 'مدرب جديد',
      phone: GymStore.migratePhone(coachData.phone || ''),
      email: coachData.email || '',
      specialty: coachData.specialty || 'Gym',
      salary: coachData.salary !== undefined ? Number(coachData.salary) : 4000,
      hire_date: coachData.hire_date || new Date().toISOString().split('T')[0],
      barcode_id: coachData.barcode_id || id,
      status: coachData.status || 'active',
      created_at: new Date().toISOString(),
      notes: coachData.notes || ''
    };

    coaches.unshift(newCoach);
    this.save(STORAGE_KEY_COACHES, coaches);
    GymStore.syncCoachToSupabase(newCoach);
    return newCoach;
  }

  public static updateCoach(updated: Coach): void {
    const coaches = this.getCoaches();
    const idx = coaches.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      updated.phone = GymStore.migratePhone(updated.phone);
      coaches[idx] = updated;
      this.save(STORAGE_KEY_COACHES, coaches);
      GymStore.syncCoachToSupabase(updated);
    }
  }

  public static deleteCoach(id: string): void {
    let coaches = this.getCoaches();
    coaches = coaches.filter(c => c.id !== id);
    this.save(STORAGE_KEY_COACHES, coaches);
    GymStore.deleteCoachFromSupabase(id);
  }

  // Attendance Operations (Unified for Members & Coaches)
  public static getAttendance(): Attendance[] {
    return this.load<Attendance>(STORAGE_KEY_ATTENDANCE, DEFAULT_ATTENDANCE);
  }

  public static recordAttendance(barcodeId: string): { success: boolean; message: string; attendance?: Attendance; personType?: 'member' | 'coach' } {
    const code = barcodeId.trim();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const attendanceList = this.getAttendance();

    // 1. Check if it matches a Member
    const members = this.getMembers();
    const member = members.find(m => m.barcode_id === code || m.id === code);

    if (member) {
      // Check subscription status
      if (member.end_date < todayStr) {
        return { 
          success: false, 
          message: `عذراً! اشتراك العضو "${member.full_name}" منتهي منذ تاريخ (${member.end_date}). يرجى تجديد الاشتراك أولاً.`,
          personType: 'member'
        };
      }

      // Check if already checked in today
      const todayCheckin = attendanceList.find(
        a => a.member_id === member.id && a.checkin_date === todayStr
      );

      if (todayCheckin) {
        return { 
          success: true, 
          message: `المشترك "${member.full_name}" مسجل حضوره مسبقاً اليوم عند الساعة ${todayCheckin.checkin_time}.`,
          attendance: todayCheckin,
          personType: 'member'
        };
      }

      const newCheckin: Attendance = {
        id: `ATT_${Date.now()}`,
        member_id: member.id,
        member_name: member.full_name,
        checkin_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        checkin_date: todayStr,
        person_type: 'member',
        sport_or_specialty: member.sport_type
      };

      attendanceList.unshift(newCheckin);
      this.save(STORAGE_KEY_ATTENDANCE, attendanceList);
      GymStore.syncAttendanceToSupabase(newCheckin);

      return { 
        success: true, 
        message: `تم تسجيل حضور المشترك بنجاح: ${member.full_name} (${member.sport_type})`, 
        attendance: newCheckin,
        personType: 'member'
      };
    }

    // 2. Check if it matches a Coach / Trainer
    const coaches = this.getCoaches();
    const coach = coaches.find(c => c.barcode_id === code || c.id === code);

    if (coach) {
      if (coach.status !== 'active') {
        return {
          success: false,
          message: `تنبيه: ملف المدرب "${coach.full_name}" متوقف وغير نشط حالياً. يرجى تفعيله من قائمة المدربين.`,
          personType: 'coach'
        };
      }

      // Check if already checked in today
      const todayCheckin = attendanceList.find(
        a => a.member_id === coach.id && a.checkin_date === todayStr
      );

      if (todayCheckin) {
        return { 
          success: true, 
          message: `المدرب "${coach.full_name}" مسجل حضوره مسبقاً اليوم عند الساعة ${todayCheckin.checkin_time}.`,
          attendance: todayCheckin,
          personType: 'coach'
        };
      }

      const newCheckin: Attendance = {
        id: `ATT_COA_${Date.now()}`,
        member_id: coach.id,
        member_name: coach.full_name,
        checkin_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        checkin_date: todayStr,
        person_type: 'coach',
        sport_or_specialty: coach.specialty
      };

      attendanceList.unshift(newCheckin);
      this.save(STORAGE_KEY_ATTENDANCE, attendanceList);
      GymStore.syncAttendanceToSupabase(newCheckin);

      return { 
        success: true, 
        message: `تم إثبات حضور المدرب بنجاح: الكابتن ${coach.full_name} - ${coach.specialty} 🏋️‍♂️`, 
        attendance: newCheckin,
        personType: 'coach'
      };
    }

    // 3. Not found as member or coach
    return { 
      success: false, 
      message: `الرمز "${code}" غير مسجل في النظام كـ مشترك أو مدرب. يرجى التأكد من الرمز أو تسجيله أولاً.` 
    };
  }

  public static deleteAttendanceRecord(id: string): void {
    let list = this.getAttendance();
    list = list.filter(a => a.id !== id);
    this.save(STORAGE_KEY_ATTENDANCE, list);
    GymStore.deleteAttendanceFromSupabase(id);
  }

  public static clearAllAttendance(): void {
    this.save(STORAGE_KEY_ATTENDANCE, []);
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
    const coaches = this.getCoaches();
    const attendance = this.getAttendance();
    
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

    // Coaches present today
    const coachesPresentToday = attendance.filter(
      a => a.checkin_date === todayStr && a.person_type === 'coach'
    ).length;

    return {
      totalMembers: members.length,
      attendanceToday,
      expiredCount,
      expiringSoonCount,
      totalCoaches: coaches.length,
      coachesPresentToday
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

  // Manage club settings (name, whatsapp, owner email, sports)
  public static getSettings(): GymSettings {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.sports || !Array.isArray(parsed.sports)) {
        parsed.sports = [...DEFAULT_SETTINGS.sports];
      }
      if (!parsed.club_name || parsed.club_name === 'إدارة جم كلوب' || parsed.club_name === 'Gym Club Manager') {
        parsed.club_name = 'GymFlow';
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static updateSettings(settings: GymSettings): void {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    GymStore.syncSettingsToSupabase(settings);
  }

  public static renameSportInStore(oldName: string, newName: string): void {
    const settings = this.getSettings();
    const idx = settings.sports.indexOf(oldName);
    if (idx !== -1) {
      settings.sports[idx] = newName;
      this.updateSettings(settings);
      
      // Update all members associated with this sport
      const members = this.getMembers();
      let updatedAny = false;
      const updatedMembers = members.map(m => {
        if (m.sport_type === oldName) {
          updatedAny = true;
          return { ...m, sport_type: newName };
        }
        return m;
      });
      if (updatedAny) {
        this.save(STORAGE_KEY_MEMBERS, updatedMembers);
      }
    }
  }

  public static deleteSportInStore(sportName: string): void {
    const settings = this.getSettings();
    settings.sports = settings.sports.filter(s => s !== sportName);
    this.updateSettings(settings);

    // Update all members associated with this sport to default or first sport
    const members = this.getMembers();
    let updatedAny = false;
    const defaultSport = settings.sports[0] || 'Other';
    const updatedMembers = members.map(m => {
      if (m.sport_type === sportName) {
        updatedAny = true;
        return { ...m, sport_type: defaultSport };
      }
      return m;
    });
    if (updatedAny) {
      this.save(STORAGE_KEY_MEMBERS, updatedMembers);
    }
  }

  // Mock Authentication & Multi-Device Binding (Windows / Mobile / Single Active Session)
  public static getRegisteredUsers(): GymUser[] {
    return this.load<GymUser>('gym_users_v1', []);
  }

  public static getUserByEmail(email: string): GymUser | null {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === DEFAULT_SETTINGS.owner_email.trim().toLowerCase()) {
      const users = this.getRegisteredUsers();
      const customOwner = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (customOwner) return customOwner;
      
      return {
        email: cleanEmail,
        password_hash: '123456',
        club_name: DEFAULT_SETTINGS.club_name,
        club_whatsapp: DEFAULT_SETTINGS.club_whatsapp,
        created_at: new Date().toISOString(),
        allowed_windows_device_id: null,
        allowed_mobile_device_id: null
      };
    }

    const users = this.getRegisteredUsers();
    return users.find(u => u.email.trim().toLowerCase() === cleanEmail) || null;
  }

  public static registerUser(user: GymUser): { success: boolean; error?: string; user?: GymUser; sessionToken?: string } {
    const users = this.getRegisteredUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    
    // Check if email already exists in system
    const exists = users.some(u => u.email.trim().toLowerCase() === cleanEmail) || 
                   cleanEmail === DEFAULT_SETTINGS.owner_email.trim().toLowerCase();
    
    if (exists) {
      return { success: false, error: 'البريد الإلكتروني هذا مسجل بالفعل مسبقاً بنظامنا.' };
    }

    // Capture current device hardware fingerprint
    const currentDevice = getOrCreateDeviceUUID();
    const isMobile = currentDevice.device_type === 'mobile';
    const sessionToken = `SESS_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newUser: GymUser = {
      ...user,
      email: cleanEmail,
      allowed_windows_device_id: isMobile ? null : currentDevice.device_uuid,
      allowed_mobile_device_id: isMobile ? currentDevice.device_uuid : null,
      active_session_token: sessionToken,
      last_login_at: new Date().toISOString(),
      device_bindings: {
        ...(isMobile ? {
          mobile: {
            device_id: currentDevice.device_uuid,
            device_name: currentDevice.platform_name,
            device_type: 'mobile',
            os_name: currentDevice.os_name,
            browser_name: currentDevice.browser_name,
            bound_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          }
        } : {
          windows: {
            device_id: currentDevice.device_uuid,
            device_name: currentDevice.platform_name,
            device_type: currentDevice.device_type,
            os_name: currentDevice.os_name,
            browser_name: currentDevice.browser_name,
            bound_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          }
        })
      }
    };

    users.push(newUser);
    this.save('gym_users_v1', users);

    // Auto update settings to match this newly registered club info
    const currentSettings = this.getSettings();
    this.updateSettings({
      ...currentSettings,
      club_name: user.club_name,
      club_whatsapp: user.club_whatsapp,
      owner_email: cleanEmail
    });

    // Sync to Supabase
    this.syncUserToSupabase(newUser);

    return { success: true, user: newUser, sessionToken };
  }

  /**
   * Device-Binding Aware Authentication
   * Validates credentials, checks Allowed Device UUID (Windows vs Mobile),
   * and generates single active session token.
   */
  public static authenticateUser(email: string, password_hash: string): AuthResult {
    const cleanEmail = email.trim().toLowerCase();
    const currentDevice = getOrCreateDeviceUUID();
    const isMobile = currentDevice.device_type === 'mobile';
    const isWindowsOrDesktop = !isMobile;
    const sessionToken = `SESS_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Default system owner account fallback & check
    if (cleanEmail === DEFAULT_SETTINGS.owner_email.trim().toLowerCase()) {
      if (password_hash.length < 6) {
        return { success: false, error: 'يرجى إدخال كلمة مرور صحيحة لا تقل عن 6 خانات.' };
      }

      let users = this.getRegisteredUsers();
      let ownerUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!ownerUser) {
        ownerUser = {
          email: cleanEmail,
          password_hash: password_hash,
          club_name: DEFAULT_SETTINGS.club_name,
          club_whatsapp: DEFAULT_SETTINGS.club_whatsapp,
          created_at: new Date().toISOString(),
          allowed_windows_device_id: isWindowsOrDesktop ? currentDevice.device_uuid : null,
          allowed_mobile_device_id: isMobile ? currentDevice.device_uuid : null,
          active_session_token: sessionToken,
          last_login_at: new Date().toISOString(),
          device_bindings: {
            ...(isMobile ? {
              mobile: {
                device_id: currentDevice.device_uuid,
                device_name: currentDevice.platform_name,
                device_type: 'mobile',
                os_name: currentDevice.os_name,
                browser_name: currentDevice.browser_name,
                bound_at: new Date().toISOString(),
                last_active_at: new Date().toISOString()
              }
            } : {
              windows: {
                device_id: currentDevice.device_uuid,
                device_name: currentDevice.platform_name,
                device_type: currentDevice.device_type,
                os_name: currentDevice.os_name,
                browser_name: currentDevice.browser_name,
                bound_at: new Date().toISOString(),
                last_active_at: new Date().toISOString()
              }
            })
          }
        };
        users.push(ownerUser);
        this.save('gym_users_v1', users);
        this.syncUserToSupabase(ownerUser);
        return { success: true, user: ownerUser, sessionToken };
      }

      // Check device binding for existing owner account
      return this.verifyAndBindUserDevice(ownerUser, currentDevice, sessionToken);
    }

    // 2. Lookup custom registered users
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'عذراً! هذا الحساب غير مسجل حالياً. يمكنك تسجيل حساب جديد للبدء.' };
    }

    if (found.password_hash !== password_hash) {
      return { success: false, error: 'كلمة المرور المدخلة غير صحيحة.' };
    }

    return this.verifyAndBindUserDevice(found, currentDevice, sessionToken);
  }

  /**
   * Internal helper to verify Device Binding rules and single active session
   */
  private static verifyAndBindUserDevice(user: GymUser, currentDevice: DeviceInfo, sessionToken: string): AuthResult {
    const isMobile = currentDevice.device_type === 'mobile';
    const deviceType = isMobile ? 'mobile' : 'windows';
    const users = this.getRegisteredUsers();
    const userIndex = users.findIndex(u => u.email.trim().toLowerCase() === user.email.trim().toLowerCase());

    // 1. Check Windows / Desktop Binding
    if (!isMobile) {
      if (user.allowed_windows_device_id && user.allowed_windows_device_id !== currentDevice.device_uuid) {
        return {
          success: false,
          deviceMismatch: true,
          deviceType: 'windows',
          boundDeviceId: user.allowed_windows_device_id,
          attemptedDeviceId: currentDevice.device_uuid,
          error: 'هذا الحساب مربوط بجهاز آخر بالفعل، يرجى التواصل مع الدعم لنقل الترخيص'
        };
      }
      
      // Auto-bind on first Windows/Desktop login
      if (!user.allowed_windows_device_id) {
        user.allowed_windows_device_id = currentDevice.device_uuid;
      }
    }

    // 2. Check Mobile Binding
    if (isMobile) {
      if (user.allowed_mobile_device_id && user.allowed_mobile_device_id !== currentDevice.device_uuid) {
        return {
          success: false,
          deviceMismatch: true,
          deviceType: 'mobile',
          boundDeviceId: user.allowed_mobile_device_id,
          attemptedDeviceId: currentDevice.device_uuid,
          error: 'هذا الحساب مربوط بجهاز آخر بالفعل، يرجى التواصل مع الدعم لنقل الترخيص'
        };
      }

      // Auto-bind on first Mobile login
      if (!user.allowed_mobile_device_id) {
        user.allowed_mobile_device_id = currentDevice.device_uuid;
      }
    }

    // 3. Update single session token & device binding history
    user.active_session_token = sessionToken;
    user.last_login_at = new Date().toISOString();
    
    if (!user.device_bindings) {
      user.device_bindings = {};
    }

    if (isMobile) {
      user.device_bindings.mobile = {
        device_id: currentDevice.device_uuid,
        device_name: currentDevice.platform_name,
        device_type: 'mobile',
        os_name: currentDevice.os_name,
        browser_name: currentDevice.browser_name,
        bound_at: user.device_bindings.mobile?.bound_at || new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };
    } else {
      user.device_bindings.windows = {
        device_id: currentDevice.device_uuid,
        device_name: currentDevice.platform_name,
        device_type: currentDevice.device_type,
        os_name: currentDevice.os_name,
        browser_name: currentDevice.browser_name,
        bound_at: user.device_bindings.windows?.bound_at || new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };
    }

    // Persist updated user
    if (userIndex !== -1) {
      users[userIndex] = user;
    } else {
      users.push(user);
    }
    this.save('gym_users_v1', users);

    // Auto update settings to matching club details on successful login
    const currentSettings = this.getSettings();
    this.updateSettings({
      ...currentSettings,
      club_name: user.club_name,
      club_whatsapp: user.club_whatsapp,
      owner_email: user.email
    });

    // Real-time Supabase sync of user & session
    this.syncUserToSupabase(user);

    return { success: true, user, sessionToken };
  }

  /**
   * Session Management: Verify if the current local session token is still valid.
   * If a new login happened on another device, this session is invalidated.
   */
  public static checkActiveSession(email: string): { isValid: boolean; activeSessionToken?: string; reason?: string } {
    const user = this.getUserByEmail(email);
    const localToken = this.getCurrentSessionToken();

    if (!user) {
      return { isValid: false, reason: 'user_not_found' };
    }

    if (!localToken) {
      return { isValid: false, reason: 'no_local_token' };
    }

    if (user.active_session_token && user.active_session_token !== localToken) {
      return { 
        isValid: false, 
        reason: 'session_superseded', 
        activeSessionToken: user.active_session_token 
      };
    }

    return { isValid: true, activeSessionToken: localToken };
  }

  public static getLoggedUser(): { email: string; sessionToken?: string } | null {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    return raw ? JSON.parse(raw) : null;
  }

  public static getCurrentSessionToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
  }

  public static loginUser(email: string, sessionToken?: string): void {
    const cleanEmail = email.trim().toLowerCase();
    const token = sessionToken || `SESS_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ email: cleanEmail, sessionToken: token }));
    localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, token);
  }

  public static logoutUser(): void {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
  }

  /**
   * Unbind a registered device (for license transfers and admin resets)
   */
  public static unbindDevice(email: string, target: 'windows' | 'mobile' | 'both'): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    const userIndex = users.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);

    if (userIndex === -1 && cleanEmail !== DEFAULT_SETTINGS.owner_email.trim().toLowerCase()) {
      return { success: false, message: 'المستخدم غير موجود' };
    }

    const user: GymUser = userIndex !== -1 ? users[userIndex] : {
      email: cleanEmail,
      password_hash: '123456',
      club_name: DEFAULT_SETTINGS.club_name,
      club_whatsapp: DEFAULT_SETTINGS.club_whatsapp,
      created_at: new Date().toISOString(),
    };

    if (target === 'windows' || target === 'both') {
      user.allowed_windows_device_id = null;
      if (user.device_bindings) delete user.device_bindings.windows;
    }

    if (target === 'mobile' || target === 'both') {
      user.allowed_mobile_device_id = null;
      if (user.device_bindings) delete user.device_bindings.mobile;
    }

    if (userIndex !== -1) {
      users[userIndex] = user;
      this.save('gym_users_v1', users);
    } else {
      users.push(user);
      this.save('gym_users_v1', users);
    }

    this.syncUserToSupabase(user);
    return { success: true, message: 'تم فك ربط الجهاز ونقل الترخيص بنجاح! يمكنك الآن تسجيل الدخول من جهازك الجديد.' };
  }

  public static getRememberedCredentials(): { email: string; remember: boolean } | null {
    const raw = localStorage.getItem(STORAGE_KEY_REMEMBERED);
    return raw ? JSON.parse(raw) : null;
  }

  public static setRememberedCredentials(email: string, remember: boolean): void {
    if (remember) {
      localStorage.setItem(STORAGE_KEY_REMEMBERED, JSON.stringify({ email, remember: true }));
    } else {
      localStorage.removeItem(STORAGE_KEY_REMEMBERED);
    }
  }

  public static resetPassword(email: string, newPassword?: string): { success: boolean; message: string; tempPassword?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    const isOwner = cleanEmail === DEFAULT_SETTINGS.owner_email.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);

    if (!isOwner && userIndex === -1) {
      return { success: false, message: 'البريد الإلكتروني المدخل غير مسجل في النظام.' };
    }

    const assignedPassword = newPassword && newPassword.length >= 6 ? newPassword : Math.random().toString(36).slice(-8) + 'Aa1!';

    if (userIndex !== -1) {
      users[userIndex].password_hash = assignedPassword;
      this.save('gym_users_v1', users);
      this.syncUserToSupabase(users[userIndex]);
    }

    return {
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح!',
      tempPassword: assignedPassword
    };
  }


  // ==========================================
  // SUPABASE BACKEND INTEGRATION & SYNC METHODS
  // ==========================================

  /**
   * Fetch all data tables from Supabase cloud backend and update local storage.
   */
  public static async syncFromSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Fetch Members
      const { data: remoteMembers, error: membersError } = await supabase.from('members').select('*');
      if (membersError) {
        if (membersError.code === '42P01') {
          return { success: false, message: 'جداول Supabase غير موجودة بعد. يرجى تشغيل استعلام SQL المرفق بصفحة الإعدادات لإنشائها.' };
        }
        return { success: false, message: `تعذر جلب المشتركين: ${membersError.message}` };
      }

      if (remoteMembers && remoteMembers.length > 0) {
        const formattedMembers: Member[] = remoteMembers.map((m: any) => ({
          id: m.id,
          full_name: m.full_name,
          phone: m.phone,
          email: m.email || undefined,
          email_verified: m.email_verified,
          sport_type: m.sport_type,
          start_date: m.start_date,
          end_date: m.end_date,
          barcode_id: m.barcode_id,
          status: m.status as 'active' | 'expired',
          subscription_fee: m.subscription_fee ? Number(m.subscription_fee) : 250,
          created_at: m.created_at
        }));
        this.save(STORAGE_KEY_MEMBERS, formattedMembers);
      }

      // 2. Fetch Attendance
      const { data: remoteAttendance } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
      if (remoteAttendance && remoteAttendance.length > 0) {
        const formattedAttendance: Attendance[] = remoteAttendance.map((a: any) => ({
          id: a.id,
          member_id: a.member_id,
          member_name: a.member_name,
          checkin_time: a.checkin_time,
          checkin_date: a.checkin_date
        }));
        this.save(STORAGE_KEY_ATTENDANCE, formattedAttendance);
      }

      // 3. Fetch Notifications
      const { data: remoteNotifications } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (remoteNotifications && remoteNotifications.length > 0) {
        const formattedNotifications: Notification[] = remoteNotifications.map((n: any) => ({
          id: n.id,
          member_id: n.member_id,
          message: n.message,
          created_at: n.created_at,
          read_status: n.read_status
        }));
        this.save(STORAGE_KEY_NOTIFICATIONS, formattedNotifications);
      }

      // 4. Fetch Settings
      const { data: remoteSettings } = await supabase.from('settings').select('*').limit(1).single();
      if (remoteSettings) {
        const formattedSettings: GymSettings = {
          club_name: remoteSettings.club_name,
          club_whatsapp: remoteSettings.club_whatsapp,
          owner_email: remoteSettings.owner_email,
          sports: Array.isArray(remoteSettings.sports) ? remoteSettings.sports : DEFAULT_SETTINGS.sports
        };
        this.updateSettings(formattedSettings);
      }

      // 5. Fetch Gym Users & Device Bindings
      const { data: remoteUsers } = await supabase.from('gym_users').select('*');
      if (remoteUsers && remoteUsers.length > 0) {
        const localUsers = this.getRegisteredUsers();
        remoteUsers.forEach((ru: any) => {
          const idx = localUsers.findIndex(lu => lu.email.toLowerCase() === ru.email.toLowerCase());
          const mappedUser: GymUser = {
            email: ru.email,
            password_hash: ru.password_hash,
            club_name: ru.club_name,
            club_whatsapp: ru.club_whatsapp,
            created_at: ru.created_at || new Date().toISOString(),
            allowed_windows_device_id: ru.allowed_windows_device_id || null,
            allowed_mobile_device_id: ru.allowed_mobile_device_id || null,
            active_session_token: ru.active_session_token || null,
            last_login_at: ru.updated_at || ru.created_at,
            device_bindings: ru.last_device_info || undefined
          };

          if (idx !== -1) {
            localUsers[idx] = { ...localUsers[idx], ...mappedUser };
          } else {
            localUsers.push(mappedUser);
          }
        });
        this.save('gym_users_v1', localUsers);
      }

      return { success: true, message: 'تمت مزامنة البيانات وتحديثها بنجاح من قاعدة بيانات Supabase!' };
    } catch (err: any) {
      return { success: false, message: `خطأ أثناء المزامنة: ${err?.message || 'غير معروف'}` };
    }
  }

  /**
   * Push all local storage data to Supabase database tables (bulk upsert)
   */
  public static async pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      const members = this.getMembers();
      const attendance = this.getAttendance();
      const notifications = this.getNotifications();
      const settings = this.getSettings();
      const users = this.getRegisteredUsers();

      // Upsert Members
      if (members.length > 0) {
        const { error: memberErr } = await supabase.from('members').upsert(
          members.map(m => ({
            id: m.id,
            full_name: m.full_name,
            phone: m.phone,
            email: m.email || null,
            email_verified: m.email_verified || false,
            sport_type: m.sport_type,
            start_date: m.start_date,
            end_date: m.end_date,
            barcode_id: m.barcode_id,
            status: m.status,
            subscription_fee: m.subscription_fee !== undefined ? m.subscription_fee : 250,
            created_at: m.created_at
          }))
        );
        if (memberErr) return { success: false, message: `خطأ في حفظ المشتركين في Supabase: ${memberErr.message}` };
      }

      // Upsert Attendance
      if (attendance.length > 0) {
        const { error: attErr } = await supabase.from('attendance').upsert(
          attendance.map(a => ({
            id: a.id,
            member_id: a.member_id,
            member_name: a.member_name,
            checkin_time: a.checkin_time,
            checkin_date: a.checkin_date
          }))
        );
        if (attErr) return { success: false, message: `خطأ في حفظ سجل الحضور: ${attErr.message}` };
      }

      // Upsert Notifications
      if (notifications.length > 0) {
        const { error: notifErr } = await supabase.from('notifications').upsert(
          notifications.map(n => ({
            id: n.id,
            member_id: n.member_id || null,
            message: n.message,
            created_at: n.created_at,
            read_status: n.read_status
          }))
        );
        if (notifErr) return { success: false, message: `خطأ في حفظ التنبيهات: ${notifErr.message}` };
      }

      // Upsert Settings
      const { error: settingsErr } = await supabase.from('settings').upsert({
        id: 1,
        club_name: settings.club_name,
        club_whatsapp: settings.club_whatsapp,
        owner_email: settings.owner_email,
        sports: settings.sports,
        updated_at: new Date().toISOString()
      });
      if (settingsErr) return { success: false, message: `خطأ في حفظ الإعدادات: ${settingsErr.message}` };

      // Upsert Gym Users & Device Bindings
      if (users.length > 0) {
        await supabase.from('gym_users').upsert(
          users.map(u => ({
            email: u.email,
            password_hash: u.password_hash,
            club_name: u.club_name,
            club_whatsapp: u.club_whatsapp,
            allowed_windows_device_id: u.allowed_windows_device_id || null,
            allowed_mobile_device_id: u.allowed_mobile_device_id || null,
            active_session_token: u.active_session_token || null,
            last_device_info: u.device_bindings || null,
            updated_at: new Date().toISOString()
          }))
        );
      }

      return { success: true, message: 'تم رفع ومزامنة كافة البيانات وبيانات الأجهزة بنجاح إلى مشروع Supabase الخاص بكم!' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال أثناء المزامنة: ${err?.message || 'غير معروف'}` };
    }
  }

  // Background helper for single item syncs
  public static syncUserToSupabase(u: GymUser) {
    supabase.from('gym_users').upsert({
      email: u.email,
      password_hash: u.password_hash,
      club_name: u.club_name,
      club_whatsapp: u.club_whatsapp,
      allowed_windows_device_id: u.allowed_windows_device_id || null,
      allowed_mobile_device_id: u.allowed_mobile_device_id || null,
      active_session_token: u.active_session_token || null,
      last_device_info: u.device_bindings || null,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Supabase gym_users sync notice (table may need creation via SQL editor):', error.message);
    });
  }


  // Background helper for single item syncs
  public static syncMemberToSupabase(m: Member) {
    supabase.from('members').upsert({
      id: m.id,
      full_name: m.full_name,
      phone: m.phone,
      email: m.email || null,
      email_verified: m.email_verified || false,
      sport_type: m.sport_type,
      start_date: m.start_date,
      end_date: m.end_date,
      barcode_id: m.barcode_id,
      status: m.status,
      subscription_fee: m.subscription_fee !== undefined ? m.subscription_fee : 250,
      created_at: m.created_at
    }).then(({ error }) => {
      if (error) console.warn('Supabase member sync warning:', error.message);
    });
  }

  public static deleteMemberFromSupabase(id: string) {
    supabase.from('members').delete().eq('id', id).then();
  }

  public static syncCoachToSupabase(c: Coach) {
    supabase.from('coaches').upsert({
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email || null,
      specialty: c.specialty,
      salary: c.salary || 0,
      hire_date: c.hire_date,
      barcode_id: c.barcode_id,
      status: c.status,
      notes: c.notes || null,
      created_at: c.created_at
    }).then(({ error }) => {
      if (error) console.warn('Supabase coach sync warning (table may not exist yet):', error.message);
    });
  }

  public static deleteCoachFromSupabase(id: string) {
    supabase.from('coaches').delete().eq('id', id).then();
  }

  public static syncAttendanceToSupabase(a: Attendance) {
    supabase.from('attendance').upsert({
      id: a.id,
      member_id: a.member_id,
      member_name: a.member_name,
      checkin_time: a.checkin_time,
      checkin_date: a.checkin_date
    }).then(({ error }) => {
      if (error) console.warn('Supabase attendance sync warning:', error.message);
    });
  }

  public static deleteAttendanceFromSupabase(id: string) {
    supabase.from('attendance').delete().eq('id', id).then();
  }

  public static syncSettingsToSupabase(s: GymSettings) {
    supabase.from('settings').upsert({
      id: 1,
      club_name: s.club_name,
      club_whatsapp: s.club_whatsapp,
      owner_email: s.owner_email,
      sports: s.sports,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Supabase settings sync warning:', error.message);
    });
  }
}

