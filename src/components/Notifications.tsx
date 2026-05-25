import React from 'react';
import { Bell, CheckCircle2, Trash2, ShieldAlert, Sparkles, UserCheck2, Eye } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onSelectMember: (memberId: string) => void;
}

export default function Notifications({
  notifications,
  onMarkRead,
  onClearAll,
  onSelectMember
}: NotificationsProps) {
  
  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* Page header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222226]">
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-bold transition-all font-sans flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> مسح كل الإشعارات
            </button>
          )}
        </div>
        
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 justify-end">
            {unreadCount > 0 && (
              <span className="bg-[#d2ff1f] text-black text-xs font-extrabold px-2.5 py-1 rounded-full font-mono animate-pulse">
                {unreadCount} جديد
              </span>
            )}
            <span>مركز التنبيهات وإشعارات التجديد</span>
          </h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            تنبيهات تلقائية تظهر عند اقتراب وقت انتهاء اشتراك المشترك بـ 3 أيام أو انتهاء صلاحيته تماماً
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Alerts notifications feed */}
        <div className="lg:col-span-2 space-y-4">
          {notifications.length === 0 ? (
            <div className="border border-dashed border-[#222226] bg-[#121214]/50 rounded-2xl p-16 text-center text-[#8a8a93] space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d2ff1f]/5 text-[#d2ff1f] mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <p className="font-bold text-white text-base">لا توجد إشعارات حالية</p>
              <p className="text-xs max-w-sm mx-auto">عندما يقترب تاريخ انتهاء اشتراك أي عضو (خلال 3 أيام أو أقل)، سيقوم النظام آلياً بتوليد تنبيه وعرضه هنا لمتابعته.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const isRead = notif.read_status;
                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border text-right p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isRead
                        ? 'border-[#222226] bg-[#121214]/50 opacity-60'
                        : 'border-[#d2ff1f]/30 bg-[#121214] shadow-md shadow-[#d2ff1f]/[0.02]'
                    }`}
                  >
                    {/* Actions and times on the left */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectMember(notif.member_id)}
                          className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] text-zinc-400 p-2 text-xs transition-colors flex items-center gap-1"
                          title="عرض ملف المشترك"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        
                        {!isRead && (
                          <button
                            onClick={() => onMarkRead(notif.id)}
                            className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-green-400 hover:text-green-400 text-zinc-400 p-2 text-xs transition-colors"
                            title="تعليم كمقروء"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification content on the right */}
                    <div className="flex gap-3 items-start flex-1 text-right">
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm leading-relaxed ${isRead ? 'text-zinc-500' : 'text-white font-semibold'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-[#8a8a93] font-mono">
                          رقم المشترك المعرف: {notif.member_id}
                        </p>
                      </div>

                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isRead ? 'bg-zinc-900 text-zinc-500' : 'bg-amber-500/10 text-amber-400'}`}>
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Rule explainer or action checklist */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 text-right space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center justify-end gap-1.5 border-b border-[#222226] pb-3">
              <span>آلية نظام التنبيهات للرواد</span>
              <Sparkles className="h-4 w-4 text-[#d2ff1f]" />
            </h3>

            <div className="space-y-3 font-sans text-xs text-[#8a8a93] leading-relaxed">
              <p>
                يقوم التطبيق بمسح وفحص تواريخ انتهاء جميع المشتركين بصورة دورية وتلقائية عند الإقلاع أو مع كل تسجيل أو تعديل.
              </p>
              <p className="font-bold text-[#c4c4c7] pt-2">القواعد الأساسية:</p>
              <ul className="list-disc pr-4 space-y-2">
                <li>إذا بقي على انتهاء الاشتراك <span className="text-amber-400 font-bold">٣ أيام أو أقل</span>، يتم توليد إنذار ووضعه في هذه الصفحة فوراً.</li>
                <li>تظهر إشعارات حمراء وبيانات منتهية الصلاحية بمجرد تخطي التاريخ الفعلي بيوم واحد، مما يمنع الدخول تماماً عند جهاز المسح.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
