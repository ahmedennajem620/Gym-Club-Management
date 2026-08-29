import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  FileDown, 
  DollarSign, 
  UserCheck, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { GymStats, Attendance, Member, Coach } from '../types';
import { useLanguage } from '../lib/i18n';
import { GymStore } from '../services/store';

interface DashboardProps {
  stats: GymStats;
  recentAttendance: Attendance[];
  members: Member[];
  coaches: Coach[];
  onNavigateToScreen: (screen: string) => void;
  onNavigateToMembers: (filter?: 'all' | 'active' | 'expired' | 'expiring') => void;
  onSelectMember: (memberId: string) => void;
  onCheckIn: (barcodeId: string) => void;
  onRenewMember: (id: string, months: number) => void;
  onOpenPdfModal: () => void;
}

export default function Dashboard({
  stats,
  recentAttendance,
  members,
  coaches,
  onNavigateToScreen,
  onNavigateToMembers,
  onSelectMember,
  onCheckIn,
  onRenewMember,
  onOpenPdfModal
}: DashboardProps) {
  const { t, dir, language, formatSport } = useLanguage();
  const settings = GymStore.getSettings();
  const sportsList = settings.sports && settings.sports.length > 0 
    ? settings.sports 
    : ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'];
  
  // Quick Check-in Search state
  const [quickSearch, setQuickSearch] = useState('');
  const [justCheckedInId, setJustCheckedInId] = useState<string | null>(null);

  // Group members count by sport type
  const sportCounts = members.reduce((acc, m) => {
    acc[m.sport_type] = (acc[m.sport_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Expiring soon members list
  const todayStr = new Date().toISOString().split('T')[0];
  const expiringSoonList = members.filter(m => {
    if (m.status !== 'active') return false;
    const msLeft = new Date(m.end_date).getTime() - new Date(todayStr).getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 3;
  });

  // Today's attendance records
  const todayAttendanceList = recentAttendance.filter(a => a.checkin_date === todayStr);

  // Calculate Today's Financial collections (new members registered today or subscriptions created today)
  const todayNewMembers = members.filter(m => m.start_date === todayStr || (m.created_at && m.created_at.startsWith(todayStr)));
  const todayRevenue = todayNewMembers.reduce((sum, m) => sum + (Number(m.subscription_fee) || 0), 0);

  // Active members count
  const activeCount = members.filter(m => m.status === 'active').length;
  const activePercentage = members.length > 0 ? Math.round((activeCount / members.length) * 100) : 0;

  const isRtl = dir === 'rtl';

  // Filter people (members and coaches) matching the quick check-in search
  const searchTrimmed = quickSearch.trim().toLowerCase();
  const matchingMembers = searchTrimmed.length > 0
    ? members.filter(m => 
        m.full_name.toLowerCase().includes(searchTrimmed) || 
        m.phone.includes(searchTrimmed) || 
        m.barcode_id.toLowerCase().includes(searchTrimmed) ||
        m.id.toLowerCase().includes(searchTrimmed)
      ).slice(0, 4)
    : [];

  const matchingCoaches = searchTrimmed.length > 0
    ? coaches.filter(c => 
        c.full_name.toLowerCase().includes(searchTrimmed) || 
        c.phone.includes(searchTrimmed) || 
        c.barcode_id.toLowerCase().includes(searchTrimmed) ||
        c.id.toLowerCase().includes(searchTrimmed)
      ).slice(0, 2)
    : [];

  const handleQuickCheckInAction = (id: string, barcodeId: string) => {
    onCheckIn(barcodeId || id);
    setJustCheckedInId(id);
    setTimeout(() => {
      setJustCheckedInId(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Title / Welcoming Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className={isRtl ? "text-right" : "text-left"}>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{t.dash_welcome_title}</h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            {t.dash_welcome_sub}
          </p>
        </div>
        
        {/* Prominent Quick Action Button - Removed scanner shortcut button as requested */}
        <div className={`flex items-center gap-3 ${isRtl ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={() => onNavigateToScreen('add-member')}
            className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-5 py-2.5 text-sm font-extrabold transition-all active:scale-[0.98] font-sans flex items-center gap-2 cursor-pointer shadow-lg shadow-[#d2ff1f]/15"
          >
            <span>+</span>
            <span>{t.add_member}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics Cards - Interactive & Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div 
          onClick={() => onNavigateToMembers('all')}
          className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 relative overflow-hidden group hover:border-[#d2ff1f]/50 hover:bg-[#161619] transition-all cursor-pointer transform hover:-translate-y-0.5 ${isRtl ? 'text-right' : 'text-left'}`}
          title={isRtl ? "انقر لعرض قائمة جميع المشتركين" : "Click to view all members"}
        >
          <div className="absolute right-0 top-0 h-16 w-16 bg-[#d2ff1f]/[0.02] rounded-full blur-xl group-hover:bg-[#d2ff1f]/[0.08] transition-all" />
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold group-hover:text-white transition-colors">{t.stat_total_members}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white group-hover:text-[#d2ff1f] transition-colors">{stats.totalMembers}</h3>
            <p className="text-xs text-[#8a8a93] mt-1 font-sans">
              {t.active}: <span className="text-[#d2ff1f] font-mono">{activePercentage}%</span>
            </p>
          </div>
        </div>

        {/* Attendance Today */}
        <div 
          onClick={() => onNavigateToScreen('attendance')}
          className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 relative overflow-hidden group hover:border-green-500/50 hover:bg-[#161619] transition-all cursor-pointer transform hover:-translate-y-0.5 ${isRtl ? 'text-right' : 'text-left'}`}
          title={isRtl ? "انقر لعرض سجل الحضور المفصل" : "Click to view attendance logs"}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-green-500/10 p-3 text-green-400 group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold group-hover:text-white transition-colors">{t.stat_attendance_today}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white group-hover:text-green-400 transition-colors">{stats.attendanceToday}</h3>
            <p className="text-xs text-green-400/80 mt-1 font-sans">{t.checked_in} ({t.today})</p>
          </div>
        </div>

        {/* Expiring Soon - Clickable with Direct Filter Navigation */}
        <div 
          onClick={() => onNavigateToMembers('expiring')}
          className={`rounded-2xl border border-amber-500/25 bg-[#14120e] p-6 relative overflow-hidden group hover:border-amber-500/70 hover:bg-[#1a1712] transition-all cursor-pointer transform hover:-translate-y-0.5 shadow-xs ${isRtl ? 'text-right' : 'text-left'}`}
          title={isRtl ? "انقر للفلترة والتواصل مع المشتركين المنتهية اشتراكاتهم قريباً" : "Click to view & contact expiring soon members"}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/15 p-3 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="text-xs text-amber-400/90 font-bold">{t.stat_expiring_soon}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-amber-400">{stats.expiringSoonCount}</h3>
            <p className="text-xs text-amber-400/80 mt-1 font-sans flex items-center gap-1">
              <span>{t.expiring_soon} (3 {t.days})</span>
              <span className="text-[10px] text-amber-300 underline font-bold">{isRtl ? '← عرض' : 'View →'}</span>
            </p>
          </div>
        </div>

        {/* Expired Members - Clickable */}
        <div 
          onClick={() => onNavigateToMembers('expired')}
          className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 relative overflow-hidden group hover:border-red-500/50 hover:bg-[#161619] transition-all cursor-pointer transform hover:-translate-y-0.5 ${isRtl ? 'text-right' : 'text-left'}`}
          title={isRtl ? "انقر لعرض المشتركين المنتهية اشتراكاتهم" : "Click to view expired members"}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-400 group-hover:scale-110 transition-transform">
              <UserX className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold group-hover:text-white transition-colors">{t.stat_expired}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white group-hover:text-red-400 transition-colors">{stats.expiredCount}</h3>
            <p className="text-xs text-red-500 mt-1 font-sans">{t.expired}</p>
          </div>
        </div>
      </div>

      {/* QUICK CHECK-IN SEARCH BAR (سجل الحضور السريع) */}
      <div className={`rounded-2xl border border-[#222226] bg-[#121214] p-5 shadow-lg ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#d2ff1f]/10 text-[#d2ff1f] flex items-center justify-center">
              <UserCheck className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">{t.quick_checkin_title}</h3>
              <p className="text-xs text-[#8a8a93]">{t.quick_checkin_subtitle}</p>
            </div>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder={t.quick_checkin_placeholder}
            className={`w-full bg-[#18181b] border border-[#27272a] focus:border-[#d2ff1f] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all ${
              isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
            }`}
          />
          <Search className={`absolute top-3.5 h-4 w-4 text-zinc-500 ${isRtl ? 'right-4' : 'left-4'}`} />
          {quickSearch && (
            <button
              onClick={() => setQuickSearch('')}
              className={`absolute top-3 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md bg-zinc-800 cursor-pointer ${
                isRtl ? 'left-3' : 'right-3'
              }`}
            >
              مسح
            </button>
          )}
        </div>

        {/* Search Results Dropdown List */}
        {quickSearch.trim().length > 0 && (
          <div className="mt-3 space-y-2 pt-2 border-t border-[#222226] animate-fadeIn">
            {matchingMembers.length === 0 && matchingCoaches.length === 0 ? (
              <div className="text-xs text-zinc-500 py-3 text-center">
                {t.quick_checkin_no_results} "{quickSearch}"
              </div>
            ) : (
              <>
                {/* Matching Members */}
                {matchingMembers.map((m) => {
                  const isActive = m.status === 'active';
                  const isCheckedToday = todayAttendanceList.some(a => a.member_id === m.id);
                  const isJustChecked = justCheckedInId === m.id;

                  return (
                    <div 
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs font-mono">
                          {m.barcode_id.substring(0, 5)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{m.full_name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {isActive ? t.active : t.expired}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            {formatSport(m.sport_type)} • {m.phone} • {t.member_end}: {m.end_date}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* If Expired -> Offer Quick Renew */}
                        {!isActive && (
                          <button
                            onClick={() => onRenewMember(m.id, 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>{t.quick_renew_btn}</span>
                          </button>
                        )}

                        {/* Check-in button */}
                        <button
                          onClick={() => handleQuickCheckInAction(m.id, m.barcode_id)}
                          disabled={isCheckedToday || !isActive}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            isJustChecked
                              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                              : isCheckedToday
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                              : !isActive
                              ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                              : 'bg-[#d2ff1f] hover:bg-[#c2ed14] text-black shadow-sm'
                          }`}
                        >
                          {isJustChecked ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                              <span>تم التسجيل!</span>
                            </>
                          ) : isCheckedToday ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>حاضر اليوم</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>{t.quick_checkin_btn}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Matching Coaches */}
                {matchingCoaches.map((c) => {
                  const isCheckedToday = todayAttendanceList.some(a => a.member_id === c.id);
                  const isJustChecked = justCheckedInId === c.id;

                  return (
                    <div 
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 hover:border-purple-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-purple-900/30 border border-purple-700/50 text-purple-300 flex items-center justify-center font-bold text-xs">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{c.full_name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                              {t.scanner_coach_badge}
                            </span>
                          </div>
                          <p className="text-xs text-purple-300/70 font-mono mt-0.5">
                            {formatSport(c.specialty)} • {c.phone}
                          </p>
                        </div>
                      </div>

                      {/* Coach Check-in button */}
                      <button
                        onClick={() => handleQuickCheckInAction(c.id, c.barcode_id)}
                        disabled={isCheckedToday}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          isJustChecked
                            ? 'bg-purple-400 text-black'
                            : isCheckedToday
                            ? 'bg-purple-900/30 text-purple-400/60 border border-purple-800/40 cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-400 text-white shadow-sm'
                        }`}
                      >
                        {isJustChecked ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                            <span>تم تسجيل حضور المدرب!</span>
                          </>
                        ) : isCheckedToday ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>حاضر اليوم</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>إثبات حضور الكابتن</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Stats, Expiring Alarms, and Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Sports Breakdown & Expiring Soon Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sports Breakdown */}
          <div className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <span>{t.sports_title}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sportsList.map(sport => {
                const count = sportCounts[sport] || 0;
                const pct = stats.totalMembers > 0 ? Math.round((count / stats.totalMembers) * 100) : 0;
                const localizedSportName = formatSport(sport);
                return (
                  <div key={sport} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                    <span className="text-sm font-bold text-white block truncate">{localizedSportName}</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-xs text-[#8a8a93] font-mono">{pct}%</span>
                      <span className="text-xl font-bold text-[#d2ff1f]">{count}</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-[#d2ff1f] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expiring Soon Alarm Details with 1-Click Quick Renew */}
          <div className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => onNavigateToMembers('expiring')}
                className="text-xs text-[#d2ff1f] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {t.dash_view_all_logs} {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>{t.stat_expiring_soon} ({expiringSoonList.length})</span>
              </h3>
            </div>

            {expiringSoonList.length === 0 ? (
              <div className="bg-[#18181b] rounded-xl p-8 text-center text-[#8a8a93]">
                {t.notif_empty}
              </div>
            ) : (
              <div className="space-y-3">
                {expiringSoonList.slice(0, 4).map(member => {
                  const daysLeft = Math.ceil(
                    (new Date(member.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={member.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4 hover:border-amber-500/30 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onSelectMember(member.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg">
                            {daysLeft} {t.days_left}
                          </span>
                          <span className="text-xs font-mono text-[#8a8a93]">{member.end_date}</span>
                        </div>
                        
                        <div className="mt-1">
                          <p className="font-bold text-white hover:text-[#d2ff1f] transition-colors">{member.full_name}</p>
                          <p className="text-xs text-[#8a8a93]">{formatSport(member.sport_type)} • {member.phone}</p>
                        </div>
                      </div>

                      {/* Quick 1-Click Renew Button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRenewMember(member.id, 1)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold border border-amber-500/30 transition-all cursor-pointer shadow-xs"
                          title={t.quick_renew_btn}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>{t.quick_renew_btn}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 col: Today's Checkin Live Feed */}
        <div className="space-y-6">
          <div className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#d2ff1f] bg-[#d2ff1f]/10 px-2.5 py-1 rounded-lg">
                  {todayAttendanceList.length} {t.attendance}
                </span>
                <h3 className="text-lg font-extrabold text-white">{t.dash_recent_attendance}</h3>
              </div>

              {recentAttendance.length === 0 ? (
                <div className="bg-[#18181b] rounded-xl p-8 text-center text-[#8a8a93]">
                  {t.dash_no_attendance_today}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentAttendance.slice(0, 6).map((log) => {
                    const isCoach = log.person_type === 'coach' || log.member_id.startsWith('COA_');
                    return (
                      <div key={log.id} className="flex items-center justify-between border-b border-[#222226] pb-3 last:border-0 last:pb-0">
                        <div className="flex flex-col items-start font-mono">
                          <span className="text-xs font-bold text-[#d2ff1f]">{log.checkin_time}</span>
                          <span className="text-[10px] text-[#8a8a93]">{log.checkin_date}</span>
                        </div>
                        
                        <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
                            {isCoach && <Award className="h-3.5 w-3.5 text-purple-400" />}
                            <span>{log.member_name}</span>
                          </p>
                          <p className="text-xs text-zinc-500 font-mono">
                            {log.member_id} • {log.sport_or_specialty ? formatSport(log.sport_or_specialty) : (isCoach ? t.scanner_coach_badge : t.scanner_member_badge)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button
              onClick={() => onNavigateToScreen('attendance')}
              className="mt-6 w-full rounded-xl border border-[#27272a] hover:border-[#d2ff1f]/50 hover:text-[#d2ff1f] px-4 py-3 text-xs font-bold font-sans text-center transition-all bg-[#18181b] cursor-pointer"
            >
              {t.dash_view_all_logs}
            </button>
          </div>
        </div>

      </div>

      {/* DAILY CASH & SHIFT SUMMARY DRAWER CARD (خزينة اليوم والمدخولات السريعة) */}
      <div className={`rounded-2xl border border-[#27272a] bg-linear-to-r from-[#141416] to-[#1a1a1d] p-6 shadow-xl ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#d2ff1f]/10 text-[#d2ff1f] flex items-center justify-center">
              <Receipt className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{t.daily_cash_title}</h3>
                <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                  {todayStr}
                </span>
              </div>
              <p className="text-xs text-[#8a8a93] mt-0.5">{t.daily_cash_subtitle}</p>
            </div>
          </div>

          {/* Quick Metrics and Shift Action */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 bg-[#121214] border border-[#27272a] rounded-xl text-center">
              <span className="text-[10px] text-zinc-400 font-bold block">{t.daily_revenue_label}</span>
              <span className="text-lg font-extrabold text-[#d2ff1f] font-mono mt-0.5 block">
                {todayRevenue.toLocaleString()} {t.currency}
              </span>
            </div>

            <div className="px-4 py-2 bg-[#121214] border border-[#27272a] rounded-xl text-center">
              <span className="text-[10px] text-zinc-400 font-bold block">{t.daily_new_subs_label}</span>
              <span className="text-lg font-extrabold text-white font-mono mt-0.5 block">
                {todayNewMembers.length + todayAttendanceList.length} {isRtl ? 'عملية' : 'ops'}
              </span>
            </div>

            <button
              onClick={onOpenPdfModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-[#27272a] hover:border-[#d2ff1f] text-white text-xs font-bold transition-all cursor-pointer group shadow-sm"
              title={t.daily_close_shift}
            >
              <FileDown className="h-4 w-4 text-[#d2ff1f] group-hover:scale-110 transition-transform" />
              <span>{t.daily_close_shift}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
