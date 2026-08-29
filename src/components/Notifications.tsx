import React from 'react';
import { Bell, CheckCircle2, Trash2, ShieldAlert, Sparkles, UserCheck2, Eye } from 'lucide-react';
import { Notification } from '../types';
import { useLanguage } from '../lib/i18n';

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
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  
  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className={`space-y-6 font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Page header */}
      <div className={`flex items-center justify-between pb-4 border-b border-[#222226] ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-bold transition-all font-sans flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> {t.notif_clear_all}
            </button>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-[#d2ff1f]" />
            <span>{t.notif_title}</span>
            {unreadCount > 0 && (
              <span className="bg-[#d2ff1f] text-black text-xs font-extrabold px-2.5 py-1 rounded-full font-mono animate-pulse">
                {unreadCount} {t.notif_new}
              </span>
            )}
          </h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            {t.notif_subtitle}
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
              <p className="font-bold text-white text-base">{t.notif_empty}</p>
              <p className="text-xs max-w-sm mx-auto">{t.notif_empty_desc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const isRead = notif.read_status;
                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isRead
                        ? 'border-[#222226] bg-[#121214]/50 opacity-60'
                        : 'border-[#d2ff1f]/30 bg-[#121214] shadow-md shadow-[#d2ff1f]/[0.02]'
                    } ${isRtl ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
                  >
                    {/* Notification content */}
                    <div className="flex gap-3 items-start flex-1">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isRead ? 'bg-zinc-900 text-zinc-500' : 'bg-amber-500/10 text-amber-400'}`}>
                        <ShieldAlert className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <p className={`text-sm leading-relaxed ${isRead ? 'text-zinc-500' : 'text-white font-semibold'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-[#8a8a93] font-mono">
                          ID: {notif.member_id}
                        </p>
                      </div>
                    </div>

                    {/* Actions and times */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectMember(notif.member_id)}
                          className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] text-zinc-400 p-2 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title={t.view_badge}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        
                        {!isRead && (
                          <button
                            onClick={() => onMarkRead(notif.id)}
                            className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-green-400 hover:text-green-400 text-zinc-400 p-2 text-xs transition-colors cursor-pointer"
                            title={t.notif_mark_read}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Rule explainer */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 border-b border-[#222226] pb-3">
              <Sparkles className="h-4 w-4 text-[#d2ff1f]" />
              <span>{t.notif_rules_title}</span>
            </h3>

            <div className="space-y-3 font-sans text-xs text-[#8a8a93] leading-relaxed">
              <p>
                {t.notif_rules_desc}
              </p>
              <p className="font-bold text-[#c4c4c7] pt-2">{t.notif_rules_heading}</p>
              <ul className={`space-y-2 list-disc ${isRtl ? 'pr-4' : 'pl-4'}`}>
                <li>{t.notif_rule_1}</li>
                <li>{t.notif_rule_2}</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

