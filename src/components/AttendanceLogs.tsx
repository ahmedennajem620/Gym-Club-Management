import React, { useState } from 'react';
import { ClipboardList, Trash2, Calendar, Search, Users, Sparkles, Award, UserCheck } from 'lucide-react';
import { Attendance } from '../types';
import { useLanguage } from '../lib/i18n';

interface AttendanceLogsProps {
  logs: Attendance[];
  onDeleteLog: (id: string) => void;
  onClearAllLogs: () => void;
}

export default function AttendanceLogs({ logs, onDeleteLog, onClearAllLogs }: AttendanceLogsProps) {
  const { t, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'member' | 'coach'>('ALL');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = logs.filter(log => {
    const isCoach = log.person_type === 'coach' || log.member_id.startsWith('COA_');
    const matchesSearch = log.member_name.toLowerCase().includes(search.toLowerCase()) || 
                          log.member_id.toLowerCase().includes(search.toLowerCase()) ||
                          (log.sport_or_specialty && log.sport_or_specialty.toLowerCase().includes(search.toLowerCase()));
    const matchesDate = !selectedDate || log.checkin_date === selectedDate;
    const matchesType = filterType === 'ALL' || (filterType === 'coach' && isCoach) || (filterType === 'member' && !isCoach);
    return matchesSearch && matchesDate && matchesType;
  });

  // Calculate stats
  const memberLogsCount = logs.filter(l => l.person_type !== 'coach' && !l.member_id.startsWith('COA_')).length;
  const coachLogsCount = logs.filter(l => l.person_type === 'coach' || l.member_id.startsWith('COA_')).length;

  const logToDelete = logs.find(l => l.id === pendingDeleteId);

  return (
    <div className={`space-y-6 font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Title block */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]`}>
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-[#d2ff1f]" />
            <span>{t.att_title}</span>
          </h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            {t.att_subtitle}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex bg-[#121214] border border-[#222226] rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'ALL' ? 'bg-[#d2ff1f] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.members_filter_all} ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('member')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'member' ? 'bg-[#d2ff1f]/20 text-[#d2ff1f]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.members} ({memberLogsCount})
            </button>
            <button
              onClick={() => setFilterType('coach')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'coach' ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.coaches} ({coachLogsCount})
            </button>
          </div>

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
              placeholder={t.att_search_placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-[#121214] border border-[#222226] text-white rounded-xl py-2 px-4 focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 text-xs transition-colors ${
                isRtl ? 'pr-10 text-right' : 'pl-10 text-left'
              }`}
            />
            <Search className={`absolute top-2.5 h-4.5 w-4.5 text-zinc-500 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
        </div>
      </div>

      {/* Grid: Left logs table, Right Statistics summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Table Logs list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] overflow-hidden shadow-xl">
            
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-[#8a8a93]">
                {t.att_empty}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#222226] bg-zinc-950/20 text-zinc-400 text-xs font-bold">
                      <th className="py-4 px-6 text-left">{t.members_th_actions}</th>
                      <th className="py-4 px-4 text-left font-mono">{t.att_th_date}</th>
                      <th className="py-4 px-4 text-left font-mono">{t.att_th_time}</th>
                      <th className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.att_th_role_sport}</th>
                      <th className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.att_th_id}</th>
                      <th className={`py-4 px-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t.att_th_name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222226]">
                    {filteredLogs.map((log) => {
                      const isCoach = log.person_type === 'coach' || log.member_id.startsWith('COA_');
                      return (
                        <tr key={log.id} className="hover:bg-zinc-900/40 text-sm text-zinc-300 transition-colors">
                          <td className="py-4 px-6 text-left">
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(log.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer inline-flex items-center justify-center"
                              title={t.delete}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                          <td className="py-4 px-4 text-left font-mono text-xs">{log.checkin_date}</td>
                          <td className="py-4 px-4 text-left font-mono text-[#d2ff1f] font-bold text-xs">{log.checkin_time}</td>
                          <td className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${
                              isCoach 
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-[#d2ff1f]/10 text-[#d2ff1f] border border-[#d2ff1f]/20'
                            }`}>
                              {isCoach ? <Award className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                              <span>{isCoach ? `${t.scanner_coach_badge} (${formatSport(log.sport_or_specialty || 'Coach')})` : formatSport(log.sport_or_specialty || 'Gym')}</span>
                            </span>
                          </td>
                          <td className={`py-4 px-4 font-mono text-xs text-[#8a8a93] ${isRtl ? 'text-right' : 'text-left'}`}>{log.member_id}</td>
                          <td className={`py-4 px-6 font-bold text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                            <span>{log.member_name}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Quick metric card summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 border-b border-[#222226] pb-3">
              <ClipboardList className="h-4 w-4 text-[#d2ff1f]" />
              <span>{t.att_stats_title}</span>
            </h3>

            <div className="space-y-3">
              {/* Stat item */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#d2ff1f]/10 text-[#d2ff1f] flex items-center justify-center font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="text-xs text-[#8a8a93] block font-bold">{t.att_stats_total_visits}</span>
                  <span className="text-2xl font-extrabold text-white mt-0.5 block">{logs.length}</span>
                </div>
              </div>

              {/* Members check-ins */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="text-xs text-[#8a8a93] block font-bold">{t.att_stats_member_visits}</span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{memberLogsCount}</span>
                </div>
              </div>

              {/* Coaches check-ins */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="text-xs text-[#8a8a93] block font-bold">{t.att_stats_coach_visits}</span>
                  <span className="text-xl font-extrabold text-purple-400 mt-0.5 block">{coachLogsCount}</span>
                </div>
              </div>
            </div>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full mt-2 py-2.5 px-4 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.att_clear_all}</span>
              </button>
            )}

            <div className="rounded-xl bg-[#18181b] border border-[#27272a] p-4">
              <span className="text-xs text-[#d2ff1f] font-bold block mb-1">{t.att_scanner_tips}</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {t.att_scanner_tips_desc}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Single Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#121214] border border-[#222226] text-white p-6 shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-extrabold text-white">{t.confirm_delete}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                "{logToDelete?.member_name}" ({logToDelete?.checkin_date})
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteLog(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {t.delete}
              </button>
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:bg-zinc-800 text-zinc-400 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#121214] border border-[#222226] text-white p-6 shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-extrabold text-white">{t.att_clear_all}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {t.confirm_delete}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClearAllLogs();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {t.delete}
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:bg-zinc-800 text-zinc-400 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

