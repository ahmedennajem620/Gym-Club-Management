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
  CircleAlert
} from 'lucide-react';
import { GymStore } from './services/store';
import { Member, Attendance, Notification, GymStats } from './types';

// Importing Custom Component Screens
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import MemberForm from './components/MemberForm';
import MembersList from './components/MembersList';
import Scanner from './components/Scanner';
import AttendanceLogs from './components/AttendanceLogs';
import Notifications from './components/Notifications';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard'); // dashboard, members, add-member, scanner, attendance, notifications
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<GymStats | null>(null);
  
  // Member being edited
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Layout View mode: 'simulator' (renders attractive iPhone frame) or 'fullscreen' (default responsive layout)
  const [viewMode, setViewMode] = useState<'fullscreen' | 'simulator'>('simulator');

  // Interactive Live Clock states
  const [currentTime, setCurrentTime] = useState<string>('');

  // Floating Toast Alert notification states for real-time actions feedback
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'dark' | 'error' } | null>(null);

  // Initialize and load core data models from local state managers
  useEffect(() => {
    const user = GymStore.getLoggedUser();
    if (user) {
      setCurrentUser(user);
    }
    refreshData();

    // Setup live clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const currentMembers = GymStore.getMembers();
    const currentAttendance = GymStore.getAttendance();
    const currentNotifications = GymStore.getNotifications();
    const calculatedStats = GymStore.getStats();

    setMembers(currentMembers);
    setAttendance(currentAttendance);
    setNotifications(currentNotifications);
    setStats(calculatedStats);
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
    showToastMsg('أهلاً بك بك في لوحة الإدارة لـ صالة الجيم الترفيهي!', 'success');
  };

  const handleLogout = () => {
    GymStore.logoutUser();
    setCurrentUser(null);
    showToastMsg('تم تسجيل خروج الإدارة بأمان.', 'dark');
  };

  // Action Member CRUD Handlers
  const handleSaveMember = (memberData: any) => {
    try {
      if (memberData.id) {
        // Edit Mode
        GymStore.updateMember(memberData);
        showToastMsg(`تم تعديل وتحديث بيانات المشترك ${memberData.full_name} بنجاح!`, 'success');
      } else {
        // Create Mode
        const created = GymStore.addMember(memberData);
        setSelectedMemberId(created.id);
        showToastMsg(`تم تسجيل المشترك ${memberData.full_name} وبدء الدورة الرياضية!`, 'success');
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

  // Guard authentication view
  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Count of unread notifications to place custom red dot indicators
  const unreadAlerts = notifications.filter(n => !n.read_status).length;

  const sidebarLinks = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'members', label: 'المشتركين', icon: Users },
    { id: 'add-member', label: 'إضافة مشترك', icon: UserPlus },
    { id: 'scanner', label: 'جهاز الماسح', icon: ScanLine },
    { id: 'attendance', label: 'سجل الحضور', icon: ClipboardCheck },
    { id: 'notifications', label: 'التنبيهات', icon: Bell, badge: unreadAlerts }
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
            onNavigateToScreen={setCurrentScreen}
            onSelectMember={handleSelectMemberDirectly}
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
      case 'scanner':
        return (
          <Scanner
            members={members}
            onCheckIn={handleCheckInBarcode}
            recentAttendance={attendance}
          />
        );
      case 'attendance':
        return <AttendanceLogs logs={attendance} />;
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onClearAll={handleClearAllNotifications}
            onSelectMember={handleSelectMemberDirectly}
          />
        );
      default:
        return <Dashboard stats={stats || { totalMembers: 0, attendanceToday: 0, expiredCount: 0, expiringSoonCount: 0 }} recentAttendance={attendance} members={members} onNavigateToScreen={setCurrentScreen} onSelectMember={handleSelectMemberDirectly} />;
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
      <header className="border-b border-[#222226] bg-[#121214] px-5 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        {/* Left Side: Logout and UTC Timer representation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-[#27272a] hover:border-red-500/30 hover:bg-red-500/5 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-red-400 transition-all font-sans"
            title="تسجيل الخروج من الإدارة"
          >
            <LogOut className="h-4 w-4" /> خروج
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-[#8a8a93] bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a]">
            <span className="font-extrabold text-[#d2ff1f]">{currentTime}</span>
            <span>⏱️</span>
          </div>
        </div>

        {/* Right Side: Club Logo and Branding */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-extrabold text-white text-md tracking-tight block font-sans">إدارة جم كلوب</span>
            <span className="text-[10px] text-[#c4c4c7] font-sans">تطبيق تسجيل الحضور الكود الذكي</span>
          </div>
          <div className="h-9 w-9 bg-[#d2ff1f] rounded-xl flex items-center justify-center text-black shadow shadow-[#d2ff1f]/15">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>
        </div>
      </header>

      {/* Main Multi-screen workspace wrapper */}
      <div className="flex-1 flex flex-col md:flex-row-reverse overflow-hidden">
        
        {/* Sidebar / Navigation Rail */}
        <nav className="w-full md:w-64 bg-[#121214] border-t md:border-t-0 md:border-l border-[#222226] flex md:flex-col justify-around md:justify-start p-3 gap-1 z-30">
          <div className="hidden md:block px-3 py-2 text-right">
            <span className="text-[10px] font-bold tracking-widest text-[#8a8a93] uppercase font-sans">قائمة الإدارة</span>
          </div>
          
          {sidebarLinks.map((link) => {
            const IconComp = link.icon;
            const isSelected = currentScreen === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'add-member') {
                    setEditingMember(null); // Ensure fresh creation
                  }
                  setCurrentScreen(link.id);
                }}
                className={`w-full flex items-center justify-end gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-[#d2ff1f]/10 text-[#d2ff1f] font-bold border-r-4 border-[#d2ff1f]'
                    : 'text-[#8a8a93] hover:text-[#c4c4c7] hover:bg-zinc-900/30'
                }`}
              >
                {/* Optional Alert Red Spot Notification badges */}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute left-3.5 bg-[#d2ff1f] text-black text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                    {link.badge}
                  </span>
                )}
                
                <span className="text-xs font-semibold font-sans">{link.label}</span>
                <IconComp className={`h-4.5 w-4.5 ${isSelected ? 'text-[#d2ff1f]' : 'text-[#8a8a93]'}`} />
              </button>
            );
          })}
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
      <div className="hidden md:flex items-center justify-between px-8 py-3 bg-[#111115] border-b border-[#222226] text-white z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8a8a93] font-mono">User: {currentUser.email}</span>
        </div>
        
        {/* Toggle between full layout or clean mobile frame layout */}
        <div className="flex bg-[#18181b] border border-[#27272a] rounded-lg p-0.5 font-mono text-xs">
          <button
            onClick={() => setViewMode('fullscreen')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'fullscreen' ? 'bg-[#d2ff1f] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> العرض الكامل
          </button>
          
          <button
            onClick={() => setViewMode('simulator')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'simulator' ? 'bg-[#d2ff1f] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> محاكي الجوال
          </button>
        </div>
        
        <div>
          <span className="text-xs font-extrabold text-[#d2ff1f] tracking-widest font-sans flex items-center gap-1">
            <Dumbbell className="h-4 w-4" /> GYM MANAGEMENT PORTAL
          </span>
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

      {/* Simple humbler professional developer signature under frame */}
      <footer className="py-4 text-center border-t border-[#1a1a20] text-[10px] text-zinc-600 font-sans tracking-wide">
        تطبيق إدارة النادي والباركود الرقمي • مبني بنقاء وخصوصية تامة عبر محرك الحفظ الهجين • 2026
      </footer>
    </div>
  );
}
