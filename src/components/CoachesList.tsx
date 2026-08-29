import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit, Printer, CheckCircle, XCircle, Phone, Calendar, Sparkles, Award, MessageCircle, FileDown, X, Shield, Dumbbell, UserCheck, Zap, Mail } from 'lucide-react';
import { Coach } from '../types';
import { GymStore } from '../services/store';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../lib/i18n';

interface CoachesListProps {
  coaches: Coach[];
  onEditCoach: (coach: Coach) => void;
  onDeleteCoach: (id: string) => void;
  onCheckInCoach: (barcodeId: string) => void;
  onAddNewCoach: () => void;
}

function DynamicQRCode({ value, size = 110 }: { value: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=000000&bgcolor=ffffff`;
  return (
    <div className="flex flex-col items-center bg-white text-black p-2.5 rounded-xl border border-zinc-200 shadow-sm">
      <img
        src={qrUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="object-contain"
      />
      <span className="text-[10px] font-mono font-extrabold tracking-[0.15em] mt-1.5 text-zinc-950">{value}</span>
    </div>
  );
}

function getCoachWhatsAppUrl(phone: string, name: string, coachId: string, specialty: string, language: string) {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  
  if (cleanPhone.startsWith('212')) {
    // Already has Morocco country code
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '212' + cleanPhone.substring(1);
  } else if (cleanPhone.length === 9 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('7') || cleanPhone.startsWith('5'))) {
    cleanPhone = '212' + cleanPhone;
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 9) {
    cleanPhone = '212' + cleanPhone.substring(1);
  } else if (cleanPhone.length === 9) {
    cleanPhone = '212' + cleanPhone;
  }

  const settings = GymStore.getSettings();
  const clubName = settings.club_name || 'GYM CLUB';

  let text = '';
  if (language === 'fr') {
    text = `Bonjour Coach *${name}* à *${clubName}* 🏋️‍♂️✨

L'administration du club a le plaisir de vous transmettre votre badge et code-barres digital :
🆔 *ID Coach :* ${coachId}
🎖️ *Discipline :* ${specialty}
📲 *Lien de votre QR Code de pointage :*
https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${coachId}

Veuillez présenter ce code au scanner lors de votre arrivée pour enregistrer votre présence quotidienne. 💪`;
  } else if (language === 'en') {
    text = `Hello Coach *${name}* at *${clubName}* 🏋️‍♂️✨

The club management is pleased to provide your digital ID pass and barcode:
🆔 *Coach ID:* ${coachId}
🎖️ *Specialty:* ${specialty}
📲 *Smart QR Code link for attendance:*
https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${coachId}

Please present this code at the scanner to record your daily check-in. 💪`;
  } else {
    text = `تحية طيبة كابتن *${name}* في *${clubName}* 🏋️‍♂️✨

يسر إدارة النادي تزويدكم ببطاقة التعريف والباركود الرقمي الخاص بكم:
🆔 *معرف المدرب:* ${coachId}
🎖️ *التخصص الرياضي:* ${specialty}
📲 *رابط الباركود الذكي لإثبات الحضور بالماسح:*
https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${coachId}

يرجى إبراز هذا الرمز عند الوصول لجهاز الماسح الضوئي لتسجيل حضوركم اليومي أوتوماتيكياً.
مع تمنياتنا بدوام التميز والنشاط! 🥇💪`;
  }

  return `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(text)}`;
}

export default function CoachesList({
  coaches,
  onEditCoach,
  onDeleteCoach,
  onCheckInCoach,
  onAddNewCoach
}: CoachesListProps) {
  const { t, language, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [selectedCoachForCard, setSelectedCoachForCard] = useState<Coach | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const settings = GymStore.getSettings();
  const clubName = settings.club_name || 'GYM CLUB';

  // Get distinct specialties
  const specialties = ['ALL', ...Array.from(new Set(coaches.map(c => c.specialty)))];

  // Filtering
  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.barcode_id.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialty = filterSpecialty === 'ALL' || c.specialty === filterSpecialty;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const activeCoachesCount = coaches.filter(c => c.status === 'active').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const attendance = GymStore.getAttendance();
  const coachesPresentTodayCount = attendance.filter(
    a => a.checkin_date === todayStr && a.person_type === 'coach'
  ).length;

  const coachToDelete = coaches.find(c => c.id === pendingDeleteId);

  // Export card to PDF/Image
  const handleExportCard = async (format: 'pdf' | 'png') => {
    const cardEl = document.getElementById('coach-id-card-preview');
    if (!cardEl) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(cardEl, {
        scale: 3,
        backgroundColor: '#0c0c0e',
        useCORS: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Coach_${selectedCoachForCard?.full_name || 'Badge'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [90, 140]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 90, 140);
        pdf.save(`Coach_${selectedCoachForCard?.full_name || 'Badge'}.pdf`);
      }
    } catch (e) {
      console.error('Failed to export card:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`space-y-6 font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Header with Title and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Award className="h-7 w-7 text-[#d2ff1f]" />
            <span>{t.coaches_title}</span>
          </h1>
          <p className="text-sm text-[#8a8a93] mt-1 font-sans">
            {t.coaches_subtitle}
          </p>
        </div>

        <button
          onClick={onAddNewCoach}
          className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-5 py-2.5 text-xs font-extrabold transition-all active:scale-[0.98] font-sans flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d2ff1f]/10"
        >
          <Award className="h-4 w-4" /> {t.add_coach}
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 flex items-center justify-between">
          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <span className="text-xs text-[#8a8a93] font-bold block">{t.stat_total_coaches}</span>
            <span className="text-2xl font-extrabold text-white mt-0.5 block">{coaches.length}</span>
          </div>
        </div>

        <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 flex items-center justify-between">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <span className="text-xs text-[#8a8a93] font-bold block">{t.coaches_filter_active}</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-0.5 block">{activeCoachesCount}</span>
          </div>
        </div>

        <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 flex items-center justify-between">
          <div className="rounded-xl bg-[#d2ff1f]/10 p-3 text-[#d2ff1f]">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <span className="text-xs text-[#8a8a93] font-bold block">{t.stat_coaches_present}</span>
            <span className="text-2xl font-extrabold text-[#d2ff1f] mt-0.5 block">{coachesPresentTodayCount}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.coaches_search_placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-[#18181b] border border-[#27272a] text-white rounded-xl py-2.5 px-4 focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 text-xs font-sans ${
                isRtl ? 'pr-10 text-right' : 'pl-10 text-left'
              }`}
            />
            <Search className={`absolute top-3 h-4 w-4 text-zinc-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          </div>

          {/* Status Filter buttons */}
          <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-[#d2ff1f] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.all} ({coaches.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                filterStatus === 'active' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.active} ({activeCoachesCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
                filterStatus === 'inactive' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.inactive} ({coaches.length - activeCoachesCount})
            </button>
          </div>
        </div>

        {/* Specialty Filter Chips */}
        {specialties.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-zinc-500 font-bold shrink-0">{t.coach_specialty}:</span>
            {specialties.map(sp => (
              <button
                key={sp}
                onClick={() => setFilterSpecialty(sp)}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  filterSpecialty === sp
                    ? 'border-[#d2ff1f] bg-[#d2ff1f]/10 text-[#d2ff1f]'
                    : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:text-white'
                }`}
              >
                {sp === 'ALL' ? t.all : formatSport(sp)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coaches Cards Grid */}
      {filteredCoaches.length === 0 ? (
        <div className="bg-[#121214] border border-[#222226] rounded-3xl p-12 text-center text-[#8a8a93] space-y-3">
          <Award className="h-10 w-10 mx-auto text-zinc-600" />
          <p className="text-sm font-bold text-white">{t.coaches_no_results}</p>
          <p className="text-xs text-zinc-500">{t.coaches_empty}</p>
          <button
            onClick={onAddNewCoach}
            className="mt-2 rounded-xl bg-[#d2ff1f] text-black px-4 py-2 text-xs font-bold hover:bg-[#c2ed14] transition-all cursor-pointer"
          >
            + {t.add_coach}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => {
            const isActive = coach.status === 'active';
            const isCheckedInToday = attendance.some(
              a => a.member_id === coach.id && a.checkin_date === todayStr
            );
            const localizedSpecialty = formatSport(coach.specialty);
            const waUrl = getCoachWhatsAppUrl(coach.phone, coach.full_name, coach.barcode_id, localizedSpecialty, language);

            return (
              <div
                key={coach.id}
                className="rounded-3xl border border-[#222226] bg-[#121214] hover:border-[#d2ff1f]/30 transition-all p-5 flex flex-col justify-between space-y-4 group shadow-lg"
              >
                {/* Top Row: Avatar, Name, Status */}
                <div>
                  <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                        <Dumbbell className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-white group-hover:text-[#d2ff1f] transition-colors">{coach.full_name}</h3>
                        <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md mt-0.5 inline-block font-sans">
                          {localizedSpecialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        isActive 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                      }`}>
                        {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{isActive ? t.active : t.inactive}</span>
                      </span>

                      {isCheckedInToday && (
                        <span className="bg-[#d2ff1f]/10 border border-[#d2ff1f]/20 text-[#d2ff1f] px-2 py-0.5 rounded-md text-[9px] font-extrabold font-mono flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> {t.checked_in}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info details list */}
                  <div className="mt-4 space-y-2 text-xs border-t border-[#1e1e22] pt-3 text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{t.member_phone}:</span>
                      </span>
                      <span className="font-mono text-zinc-200 dir-ltr">{coach.phone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">{t.member_barcode}:</span>
                      <span className="font-mono text-xs text-[#d2ff1f] font-bold bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
                        {coach.barcode_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{t.coach_hire_date}:</span>
                      </span>
                      <span className="font-mono text-zinc-300">{coach.hire_date}</span>
                    </div>

                    {coach.salary !== undefined && coach.salary > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">{t.coach_salary}:</span>
                        <span className="font-mono text-emerald-400 font-bold">{coach.salary} {t.currency}</span>
                      </div>
                    )}

                    {coach.notes && (
                      <p className="text-[11px] text-zinc-500 bg-[#18181b] p-2 rounded-xl mt-2 leading-relaxed border border-[#222226]">
                        {coach.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Check-in & Actions Bar */}
                <div className="space-y-2 pt-2 border-t border-[#1e1e22]">
                  
                  {/* Quick Attendance Check-in Button */}
                  <button
                    type="button"
                    onClick={() => onCheckInCoach(coach.barcode_id)}
                    className="w-full rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:text-purple-200 py-2.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#d2ff1f]" />
                    <span>{t.coach_check_in_btn}</span>
                  </button>

                  {/* Icon action strip */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(coach.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditCoach(coach)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer"
                      title={t.edit}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCoachForCard(coach)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[#d2ff1f] border border-zinc-700 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title={t.coach_card_title}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>{t.print}</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title={t.share_whatsapp}
                    >
                      <MessageCircle className="h-3.5 w-3.5 fill-black" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Coach ID Card Modal View with PDF / PNG Export */}
      {selectedCoachForCard && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl bg-[#121214] border border-[#222226] text-white p-6 shadow-2xl space-y-6 relative ${isRtl ? 'text-right' : 'text-left'}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#222226] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#d2ff1f]" />
                <span>{t.coach_badge_title}</span>
              </h3>
              <button
                onClick={() => setSelectedCoachForCard(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Digital Card Node */}
            <div
              id="coach-id-card-preview"
              className="rounded-3xl border-2 border-[#27272a] bg-gradient-to-b from-[#18181b] via-[#121214] to-[#0c0c0e] p-6 text-center space-y-5 relative overflow-hidden shadow-2xl"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#d2ff1f]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Club Header Badge */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-[10px] font-mono font-bold bg-[#d2ff1f]/10 text-[#d2ff1f] border border-[#d2ff1f]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  COACH PASS
                </span>
                <div>
                  <span className="text-xs font-black text-white block tracking-tight">{clubName}</span>
                  <span className="text-[9px] text-zinc-500 block">{t.coach_card_title}</span>
                </div>
              </div>

              {/* Coach Avatar and Details */}
              <div className="space-y-2">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-purple-500/15 border-2 border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg">
                  <Dumbbell className="h-8 w-8 stroke-[2.2]" />
                </div>
                <h4 className="text-lg font-black text-white tracking-tight">{selectedCoachForCard.full_name}</h4>
                <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                  {formatSport(selectedCoachForCard.specialty)}
                </div>
              </div>

              {/* QR Code and Barcode */}
              <div className="py-1">
                <DynamicQRCode value={selectedCoachForCard.barcode_id} size={130} />
              </div>

              {/* Footer info in card */}
              <div className="border-t border-zinc-800/80 pt-3 text-[10px] text-zinc-500 flex justify-between items-center font-mono">
                <span>ID: {selectedCoachForCard.barcode_id}</span>
                <span>{t.coach_hire_date}: {selectedCoachForCard.hire_date}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportCard('png')}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4 text-[#d2ff1f]" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportCard('pdf')}
                className="flex-1 py-2.5 rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#d2ff1f]/10"
              >
                <Printer className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Coach Confirmation Modal */}
      {pendingDeleteId && coachToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#121214] border border-[#222226] text-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-extrabold text-white">{t.coach_delete_confirm_title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {t.coach_delete_confirm_msg} (<strong className="text-white">"{coachToDelete.full_name}"</strong>)
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteCoach(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {t.confirm}
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

    </div>
  );
}

