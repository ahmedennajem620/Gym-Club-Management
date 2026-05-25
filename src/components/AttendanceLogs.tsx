import React, { useState } from 'react';
import { ClipboardList, Trash2, Calendar, Search, Users, Sparkles } from 'lucide-react';
import { Attendance } from '../types';

interface AttendanceLogsProps {
  logs: Attendance[];
}

export default function AttendanceLogs({ logs }: AttendanceLogsProps) {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.member_name.toLowerCase().includes(search.toLowerCase()) || 
                          log.member_id.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !selectedDate || log.checkin_date === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Calculate unique attendees today vs history
  const uniqueAttendees = new Set(logs.map(l => l.member_id)).size;

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-white">سجل وسجلات الحضور اليومية</h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            قائمة بجميع المشتركين الذين تم مسح أكوادهم وتسجيل حضورهم بالمركز
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#121214] border border-[#222226] text-white rounded-xl py-2 px-4 focus:border-[#d2ff1f] focus:outline-none text-xs font-mono text-left"
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="البحث باسم المشترك أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-right bg-[#121214] border border-[#222226] text-white rounded-xl py-2 px-4 pr-10 focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 text-sm transition-colors"
            />
            <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Grid: Left logs table, Right Statistics summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Table Logs list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] overflow-hidden text-right">
            
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-[#8a8a93]">
                {search || selectedDate 
                  ? 'لم يتم العثور على أي عمليات حضور تطابق معايير البحث والفلترة.' 
                  : 'سجل الحضور فارغ تماماً حالياً. قم بمسح الرموز لتسجيل الدخول.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#222226] bg-zinc-950/20 text-zinc-400 text-xs font-bold">
                      <th className="py-4 px-6 text-left font-mono">تاريخ الحضور</th>
                      <th className="py-4 px-6 text-left font-mono">وقت الدخول</th>
                      <th className="py-4 px-4 text-right">معرف المشترك</th>
                      <th className="py-4 px-6 text-right">اسم المشترك بالكامل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222226]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/40 text-sm text-zinc-300 transition-colors">
                        <td className="py-4 px-6 text-left font-mono text-xs">{log.checkin_date}</td>
                        <td className="py-4 px-6 text-left font-mono text-[#d2ff1f] font-bold text-xs">{log.checkin_time}</td>
                        <td className="py-4 px-4 text-right font-mono text-xs text-[#8a8a93]">{log.member_id}</td>
                        <td className="py-4 px-6 text-right font-bold text-white">{log.member_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Quick metric card summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 text-right space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center justify-end gap-1.5 border-b border-[#222226] pb-3">
              <span>ملخص الأنشطة الرياضية</span>
              <ClipboardList className="h-4 w-4 text-[#d2ff1f]" />
            </h3>

            <div className="space-y-4">
              {/* Stat item */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
                <span className="text-xs text-[#8a8a93] block">عدد الزيارات الإجمالية</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{logs.length} زيارات</span>
              </div>

              {/* Stat item */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
                <span className="text-xs text-[#8a8a93] block">عدد المشتركين الحاضرين الفريدين</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{uniqueAttendees} أعضاء</span>
              </div>
            </div>

            <div className="rounded-xl bg-orange-500/[0.02] border border-orange-500/10 p-4">
              <span className="text-xs text-orange-400 font-bold block mb-1">تعليمات الأمن والصحة</span>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                يرجى التأكد من مسح باركود العضو مع كل عملية دخول للمركز للحفاظ على تحديث سجلات الحسابات والتعويضات وقائمة التأمينات بنجاح.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
