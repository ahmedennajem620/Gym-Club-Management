import React from 'react';
import { Users, CalendarCheck, AlertTriangle, UserX, Armchair, ChevronLeft, Flame, Eye } from 'lucide-react';
import { GymStats, Attendance, Member } from '../types';

interface DashboardProps {
  stats: GymStats;
  recentAttendance: Attendance[];
  members: Member[];
  onNavigateToScreen: (screen: string) => void;
  onSelectMember: (memberId: string) => void;
}

export default function Dashboard({
  stats,
  recentAttendance,
  members,
  onNavigateToScreen,
  onSelectMember
}: DashboardProps) {
  
  // Group members count by sport type
  const sportCounts = members.reduce((acc, m) => {
    acc[m.sport_type] = (acc[m.sport_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sportTypesList = ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'];

  // Expiring soon members list
  const todayStr = new Date().toISOString().split('T')[0];
  const expiringSoonList = members.filter(m => {
    if (m.status !== 'active') return false;
    const msLeft = new Date(m.end_date).getTime() - new Date(todayStr).getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 3;
  }).slice(0, 3);

  // Active members count
  const activeCount = members.filter(m => m.status === 'active').length;
  // Calculate active percentage
  const activePercentage = members.length > 0 ? Math.round((activeCount / members.length) * 100) : 0;

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Title / Welcoming */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">لوحة القيادة والملخص</h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            إحصائيات فورية حول المشتركين والأنشطة وحالة الاشتراكات الحالية
          </p>
        </div>
        
        {/* Quick action shortcuts */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onNavigateToScreen('add-member')}
            className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] font-sans flex items-center gap-2"
          >
            إضافة مشترك جديد
          </button>
          <button
            onClick={() => onNavigateToScreen('scanner')}
            className="rounded-xl border border-[#222226] bg-[#121214] hover:bg-[#1c1c1e] text-white px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] font-sans"
          >
            فتح جهاز المسح اللاسلكي
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right relative overflow-hidden group hover:border-[#d2ff1f]/35 transition-all">
          <div className="absolute right-0 top-0 h-16 w-16 bg-[#d2ff1f]/[0.02] rounded-full blur-xl group-hover:bg-[#d2ff1f]/[0.05] transition-all" />
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold">إجمالي المشتركين</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats.totalMembers}</h3>
            <p className="text-xs text-[#8a8a93] mt-1 font-sans">
              نسبة النشطين: <span className="text-[#d2ff1f] font-mono">{activePercentage}%</span>
            </p>
          </div>
        </div>

        {/* Attendance Today */}
        <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right relative overflow-hidden group hover:border-[#d2ff1f]/35 transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold">حضور اليوم</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats.attendanceToday}</h3>
            <p className="text-xs text-[#8a8a93] mt-1 font-sans">عدد المشتركين الذين تم مسح أكوادهم</p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right relative overflow-hidden group hover:border-amber-500/35 transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold">تنتهي قريباً (3 أيام)</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats.expiringSoonCount}</h3>
            <p className="text-xs text-amber-400/80 mt-1 font-sans">تتطلب تنبيهات وتذكير بالتجديد</p>
          </div>
        </div>

        {/* Expired Members */}
        <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right relative overflow-hidden group hover:border-red-500/35 transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <UserX className="h-6 w-6" />
            </div>
            <span className="text-xs text-[#8a8a93] font-semibold">اشتراكات منتهية</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats.expiredCount}</h3>
            <p className="text-xs text-red-500 mt-1 font-sans">ممنوعين من تسجيل الحضور تلقائياً</p>
          </div>
        </div>
      </div>

      {/* Statistics and Interactive sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Sports analysis and Expiry Alerter list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right">
            <h3 className="text-lg font-extrabold text-white mb-4">توزيع المشتركين حسب نوع الرياضة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sportTypesList.map(sport => {
                const count = sportCounts[sport] || 0;
                const pct = stats.totalMembers > 0 ? Math.round((count / stats.totalMembers) * 100) : 0;
                return (
                  <div key={sport} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-sm font-semibold text-[#8a8a93]">{sport}</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-xs text-[#c4c4c7] font-mono">{pct}%</span>
                      <span className="text-xl font-bold text-white">{count}</span>
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

          {/* Expiring soon alarm details */}
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => onNavigateToScreen('notifications')}
                className="text-xs text-[#d2ff1f] hover:underline flex items-center gap-1 font-semibold"
              >
                عرض الكل <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-extrabold text-white">تنبيهات التجديد الوشيك (3 أيام أو أقل)</h3>
            </div>

            {expiringSoonList.length === 0 ? (
              <div className="bg-[#18181b] rounded-xl p-8 text-center text-[#8a8a93]">
                لا توجد اشتراكات قريبة من الانتهاء حالياً. جميع البيانات محدثة ونشيطة.
              </div>
            ) : (
              <div className="space-y-3">
                {expiringSoonList.map(member => {
                  const daysLeft = Math.ceil(
                    (new Date(member.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4 text-right hover:border-amber-500/30 transition-all cursor-pointer"
                      onClick={() => onSelectMember(member.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1.5 rounded-lg">
                          سينتهي خلال {daysLeft === 0 ? 'اليوم' : daysLeft === 1 ? 'يوم' : daysLeft === 2 ? 'يومين' : daysLeft + ' أيام'}
                        </span>
                        <span className="text-xs font-mono text-[#8a8a93]">{member.end_date}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-bold text-white">{member.full_name}</p>
                        <p className="text-xs text-[#8a8a93]">{member.sport_type} • {member.phone}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Checkin Daily Feed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right flex flex-col h-full justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white mb-4">سجل الحضور الأخير اليوم</h3>
              {recentAttendance.length === 0 ? (
                <div className="bg-[#18181b] rounded-xl p-8 text-center text-[#8a8a93]">
                  لا توجد عمليات حضور مسجلة لليوم بعد. افتح الماسح لتسجيل الدخول.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttendance.slice(0, 5).map((log, index) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-[#222226] pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-col items-start font-mono">
                        <span className="text-sm font-bold text-[#d2ff1f]">{log.checkin_time}</span>
                        <span className="text-[10px] text-[#8a8a93]">{log.checkin_date}</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{log.member_name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{log.member_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => onNavigateToScreen('attendance')}
              className="mt-6 w-full rounded-xl border border-[#27272a] hover:border-[#d2ff1f]/50 hover:text-[#d2ff1f] px-4 py-3 text-xs font-bold font-sans text-center transition-all bg-[#18181b]"
            >
              عرض سجل الحضور الكامل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
