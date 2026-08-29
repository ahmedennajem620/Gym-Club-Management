/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ScanLine, 
  ClipboardCheck, 
  Bell, 
  LogOut, 
  Monitor, 
  Smartphone,
  Calendar,
  Lock,
  Globe,
  CircleCheck,
  CircleAlert,
  Settings as SettingsIcon,
  Menu,
  X,
  Edit2,
  Check,
  Mail,
  Database,
  Award,
  FileDown,
  Clock
} from 'lucide-react';
import { GymStore } from './services/store';
import { Member, Coach, Attendance, Notification, GymStats } from './types';
import { useLanguage } from './lib/i18n';
import { playHoverSound } from './lib/sound';

// Importing Custom Component Screens
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import MemberForm from './components/MemberForm';
import MembersList from './components/MembersList';
import CoachForm from './components/CoachForm';
import CoachesList from './components/CoachesList';
import Scanner from './components/Scanner';
import AttendanceLogs from './components/AttendanceLogs';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import DataExportPdfModal from './components/DataExportPdfModal';
import LanguageSelector from './components/LanguageSelector';

export default function App() {
  const { t, language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard'); // dashboard, members, add-member, coaches, add-coach, scanner, attendance, notifications, settings
  const [members, setMembers] = useState<Member[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<GymStats | null>(null);
  const [clubSettings, setClubSettings] = useState(GymStore.getSettings());
  const [isEditingClubName, setIsEditingClubName] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState(clubSettings.club_name);
  
  // Member being edited
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Coach being edited
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Layout View mode: 'simulator' (renders attractive iPhone frame) or 'fullscreen' (default responsive layout)
  const [viewMode, setViewMode] = useState<'fullscreen' | 'simulator'>('fullscreen');

  // Filter state for members list navigation
  const [membersFilter, setMembersFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');

  // Interactive Live Clock states
  const [currentTime, setCurrentTime] = useState<string>('');

  // Floating Toast Alert notification states for real-time actions feedback
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'dark' | 'error' } | null>(null);

  // Initialize and load core data models from local state managers & Supabase
  useEffect(() => {
    const user = GymStore.getLoggedUser();
    if (user) {
      setCurrentUser(user);
    }
    refreshData();

    // Background sync with Supabase cloud backend
    GymStore.syncFromSupabase().then((res) => {
      if (res.success) {
        refreshData();
      }
    });

    // Setup live clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Setup active single session verification check (Single Active Session)
    const sessionCheckInterval = setInterval(() => {
      const user = GymStore.getLoggedUser();
      if (user && user.email) {
        const sessionStatus = GymStore.checkActiveSession(user.email);
        if (!sessionStatus.isValid && sessionStatus.reason === 'session_superseded') {
          GymStore.logoutUser();
          setCurrentUser(null);
          showToastMsg(
            language === 'ar'
              ? '⚠️ تم تسجيل الدخول إلى هذا الحساب من جهاز آخر، تم إنهاء هذه الجلسة تلقائياً.'
              : '⚠️ This account was logged in from another device. Session ended.',
            'error'
          );
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const refreshData = () => {
    const currentMembers = GymStore.getMembers();
    const currentCoaches = GymStore.getCoaches();
    const currentAttendance = GymStore.getAttendance();
    const currentNotifications = GymStore.getNotifications();
    const calculatedStats = GymStore.getStats();

    setMembers(currentMembers);
    setCoaches(currentCoaches);
    setAttendance(currentAttendance);
    setNotifications(currentNotifications);
    setStats(calculatedStats);
    setClubSettings(GymStore.getSettings());
  };

  const showToastMsg = (message: string, type: 'success' | 'dark' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Action Auth Handlers
  const handleLoginSuccess = (email: string) => {
    setCurrentUser({ email });
    refreshData();
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    GymStore.logoutUser();
    setCurrentUser(null);
    showToastMsg('تم تسجيل خروج الإدارة بأمان.', 'dark');
  };

  const generateSimulatedVerificationEmail = (member: any) => {
    if (!member.email) return;

    const simulatedEmail = {
      id: `EMAIL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to: member.email,
      toName: member.full_name,
      subject: `📧 رمز التحقق وتفعيل حساب في ${clubSettings.club_name}`,
      body: `مرحباً ${member.full_name}،
نشكرك على الانضمام والاشتراك في ${clubSettings.club_name}. 

يرجى الضغط على زر التفعيل أدناه للتحقق من بريدك الإلكتروني والبدء في استخدام الباركود الذكي لحضور الحصص والتمارين الرياضية:
• نوع الباركود الشخصي: ${member.barcode_id || 'MBR_NEW'}
• نوع الرياضة المسجل بها: ${member.sport_type}
• تاريخ بداية الاشتراك: ${member.start_date}
• تاريخ انتهاء الاشتراك: ${member.end_date}

يرجى تأكيد بريدك الإلكتروني والتحقق من حسابك لتمكين الدخول الفوري ومطابقة بياناتك بالمسح الضوئي:`,
      memberId: member.id,
      sentAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('ar-EG'),
      verified: false
    };

    GymStore.addSimulatedEmail(simulatedEmail);
  };

  // Action Member CRUD Handlers
  const handleSaveMember = (memberData: any) => {
    try {
      if (memberData.id) {
        // Edit Mode
        const oldMember = members.find(m => m.id === memberData.id);
        const emailChanged = memberData.email && (!oldMember || oldMember.email !== memberData.email);

        GymStore.updateMember(memberData);

        if (emailChanged) {
          generateSimulatedVerificationEmail(memberData);
          showToastMsg(`تم تعديل بيانات ${memberData.full_name} وإرسال رسالة التحقق للبريد الإلكتروني الجديد!`, 'success');
        } else {
          showToastMsg(`تم تعديل وتحديث بيانات المشترك ${memberData.full_name} بنجاح!`, 'success');
        }
      } else {
        // Create Mode
        const created = GymStore.addMember(memberData);
        setSelectedMemberId(created.id);

        if (created.email) {
          generateSimulatedVerificationEmail(created);
          showToastMsg(`تم تسجيل المشترك ${created.full_name} بنجاح وإرسال رسالة التحقق إلى البريد الإفتراضي!`, 'success');
        } else {
          showToastMsg(`تم تسجيل المشترك ${created.full_name} وبدء الدورة الرياضية!`, 'success');
        }
      }
      setEditingMember(null);
      refreshData();
      setCurrentScreen('members');
    } catch (e: any) {
      showToastMsg('عذراً! واجهنا خطأ أثناء معالجة بيانات المشترك.', 'error');
    }
  };

  const handleDeleteMember = (id: string) => {
    try {
      GymStore.deleteMember(id);
      if (selectedMemberId === id) setSelectedMemberId(null);
      refreshData();
      showToastMsg('تم إزالة ملف العضو وجميع تنبيهاته من النظام نهائياً.', 'dark');
    } catch (e: any) {
      showToastMsg('فشل الإجراء بسبب أخطاء أمنية.', 'error');
    }
  };

  const handleRenewMember = (id: string, months: number) => {
    try {
      const allMembers = GymStore.getMembers();
      const member = allMembers.find(m => m.id === id);
      if (member) {
        const today = new Date();
        const startYMD = today.toISOString().split('T')[0];
        
        const futureDate = new Date(today);
        futureDate.setMonth(futureDate.getMonth() + months);
        const endYMD = futureDate.toISOString().split('T')[0];

        const updated = {
          ...member,
          start_date: startYMD,
          end_date: endYMD,
          status: 'active' as const
        };
        GymStore.updateMember(updated);
        refreshData();
        showToastMsg(`تم تجديد اشتراك المشترك ${member.full_name} بنجاح لمدة ${months} شهر (أشهر)!`, 'success');
      }
    } catch (e: any) {
      showToastMsg('عذراً! واجهنا خطأ أثناء تجديد الاشتراك.', 'error');
    }
  };

  // Action Coach CRUD Handlers
  const handleSaveCoach = (coachData: any) => {
    try {
      if (coachData.id) {
        // Edit Mode
        GymStore.updateCoach(coachData);
        showToastMsg(`تم تحديث بيانات الكابتن / المدرب ${coachData.full_name} بنجاح!`, 'success');
      } else {
        // Create Mode
        const created = GymStore.addCoach(coachData);
        setSelectedCoachId(created.id);
        showToastMsg(`تم تسجيل المدرب ${created.full_name} بنجاح وإنشاء الباركود الخاص به!`, 'success');
      }
      setEditingCoach(null);
      refreshData();
      setCurrentScreen('coaches');
    } catch (e: any) {
      showToastMsg('عذراً! واجهنا خطأ أثناء حفظ بيانات المدرب.', 'error');
    }
  };

  const handleDeleteCoach = (id: string) => {
    try {
      GymStore.deleteCoach(id);
      if (selectedCoachId === id) setSelectedCoachId(null);
      refreshData();
      showToastMsg('تم إزالة ملف المدرب من النظام نهائياً.', 'dark');
    } catch (e: any) {
      showToastMsg('فشل الإجراء أثناء حذف المدرب.', 'error');
    }
  };

  const handleEditCoachClick = (coach: Coach) => {
    setEditingCoach(coach);
    setCurrentScreen('add-coach');
  };

  const handleSaveClubName = (name: string) => {
    if (!name.trim()) {
      showToastMsg('يرجى إدخال اسم النادي بشكل صحيح.', 'error');
      return;
    }
    try {
      const currentSettings = GymStore.getSettings();
      const updated = {
        ...currentSettings,
        club_name: name.trim()
      };
      GymStore.updateSettings(updated);
      refreshData();
      setIsEditingClubName(false);
      showToastMsg('تم تحديث اسم النادي بنجاح!', 'success');
    } catch (e: any) {
      showToastMsg('فشل حفظ اسم النادي الجديد.', 'error');
    }
  };

  // Check-In Scan barcode handler
  const handleCheckInBarcode = (barcodeId: string) => {
    const result = GymStore.recordAttendance(barcodeId);
    refreshData();
    if (result.success) {
      showToastMsg(result.message, 'success');
    } else {
      showToastMsg(result.message, 'error');
    }
    return result;
  };

  // Notifications alerts
  const handleMarkNotificationRead = (id: string) => {
    GymStore.markNotificationRead(id);
    refreshData();
    showToastMsg('تم تعليم التنبيه كـ مقروء ومتابع.', 'dark');
  };

  const handleClearAllNotifications = () => {
    GymStore.clearAllNotifications();
    refreshData();
    showToastMsg('تم تصفية وإلغاء كل التنبيهات مع أرشفتها.', 'dark');
  };

  const handleSelectMemberDirectly = (memberId: string) => {
    setSelectedMemberId(memberId);
    setCurrentScreen('members');
  };

  const handleEditMemberClick = (member: Member) => {
    setEditingMember(member);
    setCurrentScreen('add-member');
  };

  const handleDeleteAttendanceLog = (id: string) => {
    try {
      GymStore.deleteAttendanceRecord(id);
      refreshData();
      showToastMsg('تم حذف سجل الحضور بنجاح.', 'dark');
    } catch (e: any) {
      showToastMsg('عذراً! واجهنا خطأ أثناء حذف سجل الحضور.', 'error');
    }
  };

  const handleClearAllAttendanceLogs = () => {
    try {
      GymStore.clearAllAttendance();
      refreshData();
      showToastMsg('تم تصفية وحذف جميع سجلات الحضور بنجاح.', 'dark');
    } catch (e: any) {
      showToastMsg('عذراً! واجهنا خطأ أثناء مسح سجلات الحضور.', 'error');
    }
  };

  // Guard authentication view
  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Count of unread notifications to place custom red dot indicators
  const unreadAlerts = notifications.filter(n => !n.read_status).length;

  const sidebarLinks = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'members', label: t.members, icon: Users },
    { id: 'coaches', label: t.coaches, icon: Award },
    { id: 'scanner', label: t.scanner_barcode, icon: ScanLine },
    { id: 'attendance', label: t.attendance, icon: ClipboardCheck },
    { id: 'notifications', label: t.notifications, icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'settings', label: t.settings, icon: SettingsIcon }
  ];

  // Render the current active screen
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats || { totalMembers: 0, attendanceToday: 0, expiredCount: 0, expiringSoonCount: 0 }}
            recentAttendance={attendance}
            members={members}
            coaches={coaches}
            onNavigateToScreen={setCurrentScreen}
            onNavigateToMembers={(filter = 'all') => {
              setMembersFilter(filter);
              setCurrentScreen('members');
            }}
            onSelectMember={handleSelectMemberDirectly}
            onCheckIn={handleCheckInBarcode}
            onRenewMember={handleRenewMember}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        );
      case 'members':
        return (
          <MembersList
            members={members}
            onEditMember={handleEditMemberClick}
            onDeleteMember={handleDeleteMember}
            onSelectMember={setSelectedMemberId}
            selectedMemberId={selectedMemberId}
            onRenewMember={handleRenewMember}
            initialFilter={membersFilter}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        );
      case 'add-member':
        return (
          <MemberForm
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={() => {
              setEditingMember(null);
              setCurrentScreen('members');
            }}
          />
        );
      case 'coaches':
        return (
          <CoachesList
            coaches={coaches}
            onEditCoach={handleEditCoachClick}
            onDeleteCoach={handleDeleteCoach}
            onCheckInCoach={handleCheckInBarcode}
            onAddNewCoach={() => {
              setEditingCoach(null);
              setCurrentScreen('add-coach');
            }}
          />
        );
      case 'add-coach':
        return (
          <CoachForm
            coach={editingCoach}
            onSave={handleSaveCoach}
            onCancel={() => {
              setEditingCoach(null);
              setCurrentScreen('coaches');
            }}
          />
        );
      case 'scanner':
        return (
          <Scanner
            members={members}
            coaches={coaches}
            onCheckIn={handleCheckInBarcode}
            recentAttendance={attendance}
          />
        );
      case 'attendance':
        return (
          <AttendanceLogs 
            logs={attendance} 
            onDeleteLog={handleDeleteAttendanceLog} 
            onClearAllLogs={handleClearAllAttendanceLogs} 
          />
        );
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onClearAll={handleClearAllNotifications}
            onSelectMember={handleSelectMemberDirectly}
          />
        );
      case 'settings':
        return (
          <Settings 
            members={members}
            onSettingsUpdated={refreshData}
            showToastMsg={showToastMsg}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        );
      default:
        return (
          <Dashboard 
            stats={stats || { totalMembers: 0, attendanceToday: 0, expiredCount: 0, expiringSoonCount: 0 }} 
            recentAttendance={attendance} 
            members={members} 
            coaches={coaches}
            onNavigateToScreen={setCurrentScreen} 
            onNavigateToMembers={(filter = 'all') => {
              setMembersFilter(filter);
              setCurrentScreen('members');
            }}
            onSelectMember={handleSelectMemberDirectly} 
            onCheckIn={handleCheckInBarcode}
            onRenewMember={handleRenewMember}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        );
    }
  };

  // Base Responsive application container layout code
  const appContentBody = (
    <div className="flex flex-col h-full bg-[#0a0a0c] text-zinc-100">
      
      {/* Dynamic Toast Feedback Overlay */}
      {toast && toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce cursor-pointer" onClick={() => setToast(null)}>
          <div className={`shadow-2xl rounded-2xl border px-6 py-4 flex items-center gap-3 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-zinc-950/90 border-zinc-800 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CircleCheck className="h-5 w-5 shrink-0" />
            ) : (
              <CircleAlert className="h-5 w-5 shrink-0" />
            )}
            <span className="text-xs font-bold tracking-normal font-sans text-right">{toast.message}</span>
          </div>
        </div>
      )}

      {/* App Header Bar (Top HUD) */}
      <header className="border-b border-[#222226] bg-[#121214] px-5 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30" dir={dir}>
        {/* Brand & Club side (On Right in Arabic, on Left in LTR) */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger/menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center gap-1.5 rounded-xl bg-[#18181b] border border-[#27272a] px-3 py-1.5 text-[11px] font-extrabold text-[#d2ff1f] hover:bg-[#1f1f23] transition-colors cursor-pointer"
            title={isMenuOpen ? t.close_menu : t.menu}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="font-sans">{t.menu}</span>
          </button>

          <div className="h-10 w-10 bg-[#d2ff1f] rounded-2xl flex items-center justify-center text-black shadow-md shadow-[#d2ff1f]/15 shrink-0">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>

          {isEditingClubName ? (
            <div className="flex items-center gap-2 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveClubName(newClubName);
                  if (e.key === 'Escape') setIsEditingClubName(false);
                }}
                className={`bg-[#18181b] border border-[#d2ff1f] rounded-xl px-3 py-1.5 text-xs text-white font-sans focus:outline-none w-[140px] sm:w-[190px] ${isRtl ? 'text-right' : 'text-left'}`}
                autoFocus
                placeholder={isRtl ? "اسم النادي الرياضي" : "Club name"}
              />
              <button
                onClick={() => handleSaveClubName(newClubName)}
                className="p-1.5 rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black transition-all cursor-pointer shadow shadow-[#d2ff1f]/15"
                title={t.save}
              >
                <Check className="h-4 w-4 stroke-[3]" />
              </button>
              <button
                onClick={() => setIsEditingClubName(false)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-[#27272a] hover:border-red-500 hover:text-red-500 text-zinc-400 transition-colors cursor-pointer"
                title={t.cancel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 group">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <span className="font-extrabold text-white text-base tracking-tight block font-sans">{clubSettings.club_name}</span>
                <span className="text-[10px] text-[#8a8a93] font-sans block">{t.app_name_default}</span>
              </div>
              <button
                onClick={() => {
                  setNewClubName(clubSettings.club_name);
                  setIsEditingClubName(true);
                }}
                className="p-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#d2ff1f] text-zinc-400 hover:text-[#d2ff1f] opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                title={t.edit}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tools side (On Left in Arabic, on Right in LTR) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <LanguageSelector 
            variant="compact" 
            onLanguageChange={(newLang) => {
              showToastMsg(
                newLang === 'ar' 
                  ? 'تم تغيير لغة الواجهة إلى العربية بنجاح' 
                  : newLang === 'fr' 
                    ? 'Langue changée en Français avec succès' 
                    : 'Interface language changed to English',
                'success'
              );
            }} 
          />

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#8a8a93] bg-[#18181b] px-3.5 py-1.5 rounded-xl border border-[#27272a]">
            <Clock className="h-3.5 w-3.5 text-[#d2ff1f]" />
            <span className="font-extrabold text-white">{currentTime}</span>
          </div>

          <button
            onClick={handleLogout}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 rounded-xl border border-[#27272a] hover:border-[#d2ff1f]/50 hover:bg-[#d2ff1f]/10 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-[#d2ff1f] transition-all font-sans cursor-pointer group"
            title={t.logout}
          >
            <LogOut className="h-4 w-4 transition-colors group-hover:text-[#d2ff1f]" />
            <span className="transition-colors group-hover:text-[#d2ff1f]">{t.logout}</span>
          </button>
        </div>
      </header>

      {/* Main Multi-screen workspace wrapper */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative" dir={dir}>
        
        {/* Mobile menu backdrop overlay */}
        {isMenuOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Sidebar / Navigation Rail - positioned on the right in Arabic RTL */}
        <nav className={`
          ${isMenuOpen 
            ? `flex absolute top-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} bottom-0 w-[260px] z-40 border-[#222226] shadow-2xl animate-fadeIn` 
            : 'hidden md:flex'
          } 
          md:static md:w-64 bg-[#121214] flex-col justify-between p-4 md:p-3 z-30 overflow-y-auto ${
            isRtl ? 'md:border-l md:border-[#222226]' : 'md:border-r md:border-[#222226]'
          }
        `}>
          <div className="space-y-1.5">
            <div className={`hidden md:block px-3 py-2 ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="text-[10px] font-bold tracking-widest text-[#8a8a93] uppercase font-sans">
                {isRtl ? 'قائمة الإدارة' : (language === 'fr' ? 'Menu de Gestion' : 'Management Menu')}
              </span>
            </div>

            {/* Mobile menu title and close button */}
            <div className="md:hidden flex items-center justify-between pb-3 border-b border-[#222226]/50 mb-2 px-1">
              <span className="text-xs font-bold text-[#d2ff1f] font-sans">
                {isRtl ? 'قائمة الإدارة' : (language === 'fr' ? 'Menu de Gestion' : 'Management Menu')}
              </span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {sidebarLinks.map((link) => {
              const IconComp = link.icon;
              const isSelected = currentScreen === link.id;
              return (
                <button
                  key={link.id}
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    if (link.id === 'add-member') {
                      setEditingMember(null); // Ensure fresh creation
                    }
                    setCurrentScreen(link.id);
                    setIsMenuOpen(false); // Close mobile drawer on selection
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 relative cursor-pointer group ${
                    isSelected
                      ? `bg-[#d2ff1f]/10 text-[#d2ff1f] font-bold ${isRtl ? 'border-r-4 border-[#d2ff1f]' : 'border-l-4 border-[#d2ff1f]'}`
                      : 'text-[#8a8a93] hover:text-[#d2ff1f] hover:bg-[#d2ff1f]/5'
                  }`}
                >
                  <IconComp className={`h-4.5 w-4.5 shrink-0 transition-colors ${isSelected ? 'text-[#d2ff1f]' : 'text-[#8a8a93] group-hover:text-[#d2ff1f]'}`} />
                  <span className={`text-xs font-semibold font-sans flex-1 transition-colors ${isRtl ? 'text-right' : 'text-left'} ${isSelected ? 'text-[#d2ff1f]' : 'text-[#8a8a93] group-hover:text-[#d2ff1f]'}`}>
                    {link.label}
                  </span>
                  
                  {/* Optional Alert Red Spot Notification badges */}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="bg-[#d2ff1f] text-black text-[9px] font-extrabold h-4 min-w-4 px-1.5 rounded-full flex items-center justify-center font-mono shrink-0">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom Logout Option */}
          <div className="pt-3 border-t border-[#222226] mt-3">
            <button
              onClick={handleLogout}
              onMouseEnter={playHoverSound}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 relative cursor-pointer group text-[#8a8a93] hover:text-[#d2ff1f] hover:bg-[#d2ff1f]/5 hover:border hover:border-[#d2ff1f]/20`}
            >
              <LogOut className="h-4.5 w-4.5 shrink-0 text-[#8a8a93] group-hover:text-[#d2ff1f] transition-colors" />
              <span className={`text-xs font-semibold font-sans flex-1 text-[#8a8a93] group-hover:text-[#d2ff1f] transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
                {t.logout}
              </span>
            </button>
          </div>
        </nav>

        {/* Core Content screen Frame */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          {renderScreenContent()}
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col justify-between selection:bg-[#d2ff1f] selection:text-black font-sans relative">
      {/* Background Neon radial grid glow matching reference image */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(210,255,31,0.035)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Desktop view-mode controllers - hidden on mobile/small viewports */}
      <div className="hidden md:flex items-center justify-between px-8 py-3 bg-[#111115] border-b border-[#222226] text-white z-40 relative" dir={dir}>
        <div>
          <span className="text-xs font-extrabold text-[#d2ff1f] tracking-widest font-sans flex items-center gap-1">
            <Dumbbell className="h-4 w-4" /> GYM MANAGEMENT PORTAL
          </span>
        </div>
        
        {/* Toggle between full layout or clean mobile frame layout */}
        <div className="flex bg-[#18181b] border border-[#27272a] rounded-lg p-0.5 font-mono text-xs">
          <button
            onClick={() => setViewMode('fullscreen')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'fullscreen' ? 'bg-[#d2ff1f] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> {t.fullscreen}
          </button>
          
          <button
            onClick={() => setViewMode('simulator')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'simulator' ? 'bg-[#d2ff1f] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> {t.simulator}
          </button>
        </div>
      </div>

      {/* Core render tree handling layout simulations */}
      {viewMode === 'simulator' ? (
        <div className="flex-1 flex items-center justify-center p-4 md:py-8">
          {/* Authentic Smartphone simulator border frame */}
          <div className="relative mx-auto w-full max-w-[390px] h-[820px] rounded-[52px] border-[10px] border-[#222226] bg-[#0c0c0e] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Dynamic iPhone notch sensor */}
            <div className="absolute top-0 inset-x-0 h-8 flex justify-between px-7 items-center text-[11px] text-white z-40 bg-zinc-950/20 font-mono pointer-events-none">
              <span>9:41</span>
              <div className="w-[110px] h-5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 flex justify-center items-center" />
              <div className="flex items-center gap-1.5">
                <span>📶</span>
                <span>🪫</span>
              </div>
            </div>

            {/* Simulated iPhone home swipe bar container */}
            <div className="absolute bottom-1 inset-x-0 h-4 flex justify-center items-center z-40 pointer-events-none">
              <div className="w-28 h-1 bg-zinc-600 rounded-full" />
            </div>

            {/* Inner frame contents */}
            <div className="flex-1 pt-8 pb-3 overflow-hidden">
              {appContentBody}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {appContentBody}
        </div>
      )}

      {/* Data Export PDF Modal */}
      <DataExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        members={members}
        coaches={coaches}
        attendance={attendance}
      />

      {/* Simple humbler professional developer signature under frame */}
      <footer className="py-4 text-center border-t border-[#1a1a20] text-[10px] text-zinc-600 font-sans tracking-wide">
        تطبيق إدارة النادي ورمز الاستجابة السريعة (QR Code) • مبني بنقاء وخصوصية تامة عبر محرك الحفظ الهجين • 2026
      </footer>
    </div>
  );
}
