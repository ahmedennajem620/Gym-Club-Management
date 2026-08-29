import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit, Printer, CheckCircle, XCircle, Phone, Calendar, Sparkles, Award, MessageCircle, RefreshCw, Mail, FileDown, X, FileText } from 'lucide-react';
import { Member } from '../types';
import { GymStore } from '../services/store';
import { useLanguage } from '../lib/i18n';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const getLast12Months = (lang: string) => {
  const list = [];
  const arabicMonths = [
    'يناير (01)', 'فبراير (02)', 'مارس (03)', 'أبريل (04)', 'مايو (05)', 'يونيو (06)',
    'يوليو (07)', 'أغسطس (08)', 'سبتمبر (09)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
  ];
  const frenchMonths = [
    'Janvier (01)', 'Février (02)', 'Mars (03)', 'Avril (04)', 'Mai (05)', 'Juin (06)',
    'Juillet (07)', 'Août (08)', 'Septembre (09)', 'Octobre (10)', 'Novembre (11)', 'Décembre (12)'
  ];
  const englishMonths = [
    'January (01)', 'February (02)', 'March (03)', 'April (04)', 'May (05)', 'June (06)',
    'July (07)', 'August (08)', 'September (09)', 'October (10)', 'November (11)', 'December (12)'
  ];

  const monthNames = lang === 'ar' ? arabicMonths : lang === 'fr' ? frenchMonths : englishMonths;

  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const value = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    const label = `${monthNames[monthIdx]} ${year}`;
    list.push({ value, label });
  }
  return list;
};

interface MembersListProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onSelectMember: (id: string) => void;
  selectedMemberId?: string | null;
  onRenewMember: (id: string, months: number) => void;
  initialFilter?: 'all' | 'active' | 'expired' | 'expiring';
  onOpenPdfModal?: () => void;
}

// Highly reliable QR Code renderer using a clean and fast client-side dynamic QR image generator.
function DynamicQRCode({ value, size = 120 }: { value: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=000000&bgcolor=ffffff`;
  return (
    <div className="flex flex-col items-center bg-white text-black p-3 rounded-xl border border-zinc-200">
      <img
        src={qrUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="object-contain"
      />
      <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] mt-1.5 text-zinc-950">{value}</span>
    </div>
  );
}

// Format specific customized template message content and generate standard WhatsApp deep-link
function getWhatsAppUrl(
  phone: string, 
  name: string, 
  memberId: string, 
  sportType: string, 
  startDate: string, 
  endDate: string, 
  lang: string,
  isExpired: boolean = false
) {
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
  const clubName = settings.club_name || 'GymFlow';

  let text = '';
  if (isExpired) {
    // Specialized Renewal Reminder message for expired members
    if (lang === 'fr') {
      text = `Bonjour *${name}*, 

L'équipe *${clubName}* espère que vous allez bien ! 💪🏋️

Nous vous rappelons que votre abonnement pour *${sportType}* a pris fin le *${endDate}*. Nous serions ravis de vous accueillir à nouveau pour continuer vos entraînements et atteindre vos objectifs ! 🔥

📲 Répondez directement à ce message pour renouveler votre abonnement ou avoir plus d'informations.
À très bientôt à la salle ! ✨`;
    } else if (lang === 'en') {
      text = `Hello *${name}*, 

Greetings from *${clubName}*! 💪🏋️

This is a friendly reminder that your *${sportType}* membership ended on *${endDate}*. We'd love to welcome you back to keep crushing your fitness goals! 🔥

📲 Feel free to reply to this message to renew your membership easily.
See you soon! ✨`;
    } else if (lang === 'es') {
      text = `¡Hola *${name}*! 

Saludos desde *${clubName}* 💪🏋️

Le recordamos amablemente que su suscripción para *${sportType}* venció el *${endDate}*. ¡Estaremos encantados de darle la bienvenida de nuevo para continuar con sus entrenamientos! 🔥

📲 Responda a este mensaje para renovar su membresía fácilmente.
¡Nos vemos pronto! ✨`;
    } else {
      text = `مرحباً كابتن *${name}*،

تحية طيبة من إدارة نادي *${clubName}* 💪🏋️

نود تذكيرك بأن اشتراكك في رياضة *${sportType}* قد انتهى بتاريخ *${endDate}*.
يسعدنا جداً عودتك وتجديد اشتراكك معنا لمواصلة تدريباتك، لياقتك وصحتك البدنية! 🔥

📲 بإمكانك التواصل معنا عبر هذه المحادثة لتجديد الاشتراك فوراً والترحيب بك من جديد في النادي.
نتمنى لك دوام الصحة والتوفيق! ✨`;
    }
  } else {
    // Standard Active Welcome & Digital QR Card Pass message
    if (lang === 'fr') {
      text = `Bonjour *${name}*, bienvenue chez *${clubName}* ! 💪🏋️

Voici les détails de votre abonnement et votre pass digital :
🆔 *N° d'adhérent :* ${memberId}
⚽ *Activité :* ${sportType}
📅 *Date de début :* ${startDate}
📆 *Date d'expiration :* ${endDate}

📲 Accédez à votre code QR d'entrée via ce lien :
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}

Bonne séance et bon entraînement ! ✨🔥`;
    } else if (lang === 'en') {
      text = `Hello *${name}*, welcome to *${clubName}*! 💪🏋️

Here are your membership details and digital pass:
🆔 *Member ID:* ${memberId}
⚽ *Sport / Plan:* ${sportType}
📅 *Start Date:* ${startDate}
📆 *Expiry Date:* ${endDate}

📲 Access your check-in QR code at:
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}

Have a great workout! ✨🔥`;
    } else if (lang === 'es') {
      text = `¡Hola *${name}*, bienvenido a *${clubName}*! 💪🏋️

Detalles de su membresía y pase digital:
🆔 *N° de Miembro:* ${memberId}
⚽ *Actividad:* ${sportType}
📅 *Fecha de Inicio:* ${startDate}
📆 *Fecha de Vencimiento:* ${endDate}

📲 Su código QR para acceso:
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}

¡Buen entrenamiento! ✨🔥`;
    } else {
      text = `مرحباً كابتن *${name}* في *${clubName}* 💪🏋️

يسعدنا تأكيد اشتراكك وبطاقتك الرقمية للمرور:
🆔 *رقم العضوية:* ${memberId}
⚽ *نوع الرياضة المشتركة:* ${sportType}
📅 *تاريخ البدء:* ${startDate}
📆 *تاريخ انتهاء الصلاحية:* ${endDate}

📲 بإمكانك مسح أو الاحتفاظ برمز الباركود المرفق بالرابط التالي لتسجيل الدخول:
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}

نتمنى لك رحلة رياضية موفقة ونشاط دائم! ✨🔥`;
    }
  }

  return `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(text)}`;
}

export default function MembersList({
  members,
  onEditMember,
  onDeleteMember,
  onSelectMember,
  selectedMemberId,
  onRenewMember,
  initialFilter = 'all',
  onOpenPdfModal
}: MembersListProps) {
  const { t, dir, language, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>(initialFilter);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [renewingMemberId, setRenewingMemberId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const todayStr = new Date().toISOString().split('T')[0];

  const activeCount = members.filter(m => m.status === 'active').length;
  const expiredCount = members.filter(m => m.status === 'expired').length;
  const expiringSoonCount = members.filter(m => {
    if (m.status !== 'active') return false;
    const msLeft = new Date(m.end_date).getTime() - new Date(todayStr).getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 3;
  }).length;

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          m.id.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search);
    let matchesFilter = true;
    if (filter === 'active') {
      matchesFilter = m.status === 'active';
    } else if (filter === 'expired') {
      matchesFilter = m.status === 'expired';
    } else if (filter === 'expiring') {
      if (m.status !== 'active') {
        matchesFilter = false;
      } else {
        const msLeft = new Date(m.end_date).getTime() - new Date(todayStr).getTime();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
        matchesFilter = daysLeft >= 0 && daysLeft <= 3;
      }
    }
    return matchesSearch && matchesFilter;
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const monthsList = getLast12Months(language);

  // Helper to format days since expired or days remaining
  const getExpiryDetails = (endDateStr: string, status: string) => {
    const endMs = new Date(endDateStr).getTime();
    const todayMs = new Date(todayStr).getTime();
    const diffDays = Math.round((todayMs - endMs) / (1000 * 60 * 60 * 24));
    
    if (status === 'expired' || diffDays > 0) {
      if (diffDays <= 0) return language === 'ar' ? 'انتهى اليوم' : language === 'fr' ? "Expiré aujourd'hui" : 'Expired today';
      if (diffDays === 1) return language === 'ar' ? 'منتهي منذ يوم واحد' : language === 'fr' ? 'Expiré depuis 1 jour' : 'Expired 1 day ago';
      if (diffDays === 2) return language === 'ar' ? 'منتهي منذ يومين' : language === 'fr' ? 'Expiré depuis 2 jours' : 'Expired 2 days ago';
      return language === 'ar' ? `منتهي منذ ${diffDays} يوم` : language === 'fr' ? `Expiré depuis ${diffDays} jours` : `Expired ${diffDays} days ago`;
    } else {
      const remaining = Math.abs(diffDays);
      if (remaining === 0) return language === 'ar' ? 'ينتهي اليوم' : language === 'fr' ? "Expire aujourd'hui" : 'Expires today';
      if (remaining === 1) return language === 'ar' ? 'يوم واحد متبقي' : language === 'fr' ? '1 jour restant' : '1 day left';
      return language === 'ar' ? `${remaining} أيام متبقية` : language === 'fr' ? `${remaining} jours restants` : `${remaining} days left`;
    }
  };

  // Filter report members who registered / started in the selected month
  const reportMembers = members.filter(m => {
    const matchesMonth = m.start_date && m.start_date.startsWith(selectedMonth);
    const matchesReportStatus = reportStatusFilter === 'all' || m.status === reportStatusFilter;
    return matchesMonth && matchesReportStatus;
  });

  const generatePDFReport = async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const settings = GymStore.getSettings();
      const monthLabel = monthsList.find(m => m.value === selectedMonth)?.label || selectedMonth;
      pdf.save(`Report_${settings.club_name.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger browser print for card
  const handlePrintCard = () => {
    const printContent = document.getElementById('printable-card-area');
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (winPrint) {
      winPrint.document.write(`
        <html>
          <head>
            <title>${GymStore.getSettings().club_name} - ${selectedMember?.full_name}</title>
            <style>
              body { font-family: sans-serif; text-align: center; background-color: white; padding: 40px; color: black; }
              .card { display: inline-block; border: 4px solid #111; border-radius: 20px; padding: 30px; width: 350px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #111; letter-spacing: 1px; }
              .subtitle { font-size: 11px; text-transform: uppercase; color: #555; margin-bottom: 25px; font-weight: bold; }
              .name { font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #000; }
              .phone { font-size: 14px; color: #444; margin-bottom: 15px; }
              .badge { background-color: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; color: #111; display: inline-block; margin-bottom: 25px; }
              .dates { font-size: 11px; color: #555; margin-top: 20px; text-align: center; border-top: 1px dashed #ddd; padding-top: 15px; }
              .barcode-container { margin: 20px 0; }
              @media print {
                body { padding: 0; }
                .card { box-shadow: none; border-color: black; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">${GymStore.getSettings().club_name}</div>
              <div class="subtitle">Digital Membership Card</div>
              <div class="name">${selectedMember?.full_name}</div>
              <div class="phone">${selectedMember?.phone}</div>
              <div class="badge">${formatSport(selectedMember?.sport_type || '')}</div>
              <div class="barcode-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; margin: 20px 0;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(selectedMember?.barcode_id || '')}" width="130" height="130" style="display: block; margin: 0 auto 10px;" />
                <div style="font-weight: bold; font-family: monospace; letter-spacing: 3px; font-size: 17px; margin: 5px 0;">${selectedMember?.barcode_id}</div>
              </div>
              <div class="dates">
                <div>Start: ${selectedMember?.start_date} | Expiry: ${selectedMember?.end_date}</div>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      winPrint.document.close();
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className={`text-3xl font-extrabold text-white ${isRtl ? 'text-right' : 'text-left'}`}>
          {t.members_title}
        </h1>
        
        {/* Actions & Filters */}
        <div className={`flex flex-col sm:flex-row gap-3 w-full md:w-auto ${isRtl ? 'justify-end' : 'justify-start'}`}>
          {/* Status selector with dynamic badge counters */}
          <div className="flex flex-wrap rounded-xl bg-[#121214] border border-[#222226] p-1 font-sans">
            {[
              { id: 'all', label: t.members_tab_all, count: members.length },
              { id: 'active', label: t.members_tab_active, count: activeCount },
              { id: 'expiring', label: t.filter_expiring || 'تنتهي قريباً (3 أيام)', count: expiringSoonCount },
              { id: 'expired', label: t.members_tab_expired, count: expiredCount }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`py-1.5 px-3 sm:px-4 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  filter === opt.id
                    ? opt.id === 'expiring' 
                      ? 'bg-amber-400 text-black font-extrabold shadow'
                      : opt.id === 'expired'
                      ? 'bg-red-500 text-white font-extrabold shadow'
                      : 'bg-[#d2ff1f] text-black shadow'
                    : 'text-[#8a8a93] hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  filter === opt.id
                    ? opt.id === 'expired'
                      ? 'bg-white text-red-600'
                      : 'bg-black/20 text-black'
                    : opt.id === 'expired' && opt.count > 0
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {opt.count}
                </span>
              </button>
            ))}
          </div>

          {/* Download Comprehensive PDF Button */}
          <button
            onClick={() => onOpenPdfModal ? onOpenPdfModal() : setShowReportModal(true)}
            className="rounded-xl border border-[#222226] bg-[#121214] hover:bg-[#1c1c1e] text-white px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98] font-sans flex items-center justify-center gap-2 cursor-pointer border-[#d2ff1f]/20 hover:border-[#d2ff1f]/60"
          >
            <FileDown className="h-4 w-4 text-[#d2ff1f]" />
            <span>{t.pdf_export_btn || t.report_modal_btn}</span>
          </button>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder={t.search_placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-[#121214] border border-[#222226] text-white rounded-xl py-2 px-4 text-sm focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 transition-colors ${
                isRtl ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'
              }`}
            />
            <Search className={`absolute top-2.5 h-4.5 w-4.5 text-zinc-500 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
        </div>
      </div>

      {/* Dedicated Informational Banner when viewing Expired Subscriptions */}
      {filter === 'expired' && (
        <div className={`rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-[#161214] to-red-950/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'سجل واحتفاظ المشتركين المنتهية اشتراكاتهم' : language === 'fr' ? 'Registre des Abonnements Expirés' : 'Expired & Non-Renewed Members Archive'}</span>
                <span className="bg-red-500/20 text-red-400 text-[11px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {expiredCount} {language === 'ar' ? 'مشترك' : language === 'fr' ? 'adhérents' : 'members'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {language === 'ar' 
                  ? 'يتم الاحتفاظ بجميع بيانات وسجلات المشتركين غير المجددين بشكل دائم في هذا القسم لتمكينك من متابعتهم، إرسال رسائل تذكير للتجديد عبر واتساب، وتجديد اشتراكهم بنقرة واحدة فور عودتهم.' 
                  : language === 'fr'
                  ? 'Tous les adhérents dont l\'abonnement a expiré sont conservés ici en permanence pour faciliter les relances WhatsApp et le renouvellement rapide.'
                  : 'All expired and non-renewed members are preserved permanently in this list for easy WhatsApp follow-ups and instant 1-click renewal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenPdfModal ? onOpenPdfModal() : setShowReportModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="h-4 w-4" />
              <span>{language === 'ar' ? 'تصدير قائمة المنتهين PDF' : language === 'fr' ? 'Exporter Liste Expirés' : 'Export Expired List PDF'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Members listing grid */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="border border-[#222226] bg-[#121214] rounded-2xl p-12 text-center text-[#8a8a93]">
              {search || filter !== 'all' 
                ? t.members_no_results
                : t.members_empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((member) => {
                const isSelected = member.id === selectedMemberId;
                const isActive = member.status === 'active';
                const localizedSport = formatSport(member.sport_type);
                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMember(member.id)}
                    className={`rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isRtl ? 'text-right' : 'text-left'
                    } ${
                      isSelected
                        ? 'border-[#d2ff1f] bg-[#d2ff1f]/[0.02]'
                        : 'border-[#222226] bg-[#121214] hover:border-zinc-700 hover:bg-[#151518]'
                    }`}
                  >
                    <div>
                      {/* Member header card with status badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isActive ? (
                            <>{t.active} <CheckCircle className="h-3.5 w-3.5" /></>
                          ) : (
                            <>{t.expired} <XCircle className="h-3.5 w-3.5" /></>
                          )}
                        </span>
                        
                        <span className="text-xs font-bold text-[#8a8a93] font-mono">
                          {member.id}
                        </span>
                      </div>

                      {/* Main member Info */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-white">{member.full_name}</h3>
                        <p className={`text-xs text-[#8a8a93] font-mono flex items-center gap-1.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                          <span>{member.phone}</span>
                          <Phone className="h-3 w-3 text-[#c4c4c7]" />
                        </p>
                        {member.email && (
                          <div className={`flex items-center gap-1.5 text-[11px] font-mono mt-1 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              member.email_verified 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {member.email_verified ? '✓' : '⏳'}
                            </span>
                            <span className="text-zinc-400 truncate max-w-[130px]" title={member.email}>{member.email}</span>
                            <Mail className="h-3 w-3 text-[#c4c4c7]" />
                          </div>
                        )}
                      </div>

                      {/* Dynamic QR Code shown directly beneath registration info */}
                      <div className={`mt-3.5 flex ${isRtl ? 'justify-end' : 'justify-start'}`} onClick={(e) => e.stopPropagation()}>
                        <DynamicQRCode value={member.barcode_id} size={90} />
                      </div>

                      {/* Sport type badge & Expiration detail */}
                      <div className={`mt-3 flex flex-wrap items-center gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
                          {member.subscription_fee !== undefined ? member.subscription_fee : 250} {t.currency}
                        </span>
                        <span className="text-xs font-bold bg-[#18181b] border border-[#27272a] text-[#c4c4c7] px-2.5 py-1 rounded-lg">
                          {localizedSport}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg font-mono ${
                          !isActive 
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}>
                          {getExpiryDetails(member.end_date, member.status)}
                        </span>
                      </div>
                    </div>

                    {/* Footer timelines & actions */}
                    <div className="mt-5 pt-3 border-t border-[#222226] flex items-center justify-between">
                      <div className="flex gap-2">
                        {renewingMemberId === member.id ? (
                          <div 
                            className="flex items-center gap-1 bg-yellow-950/20 border border-yellow-500/20 rounded-lg p-1 animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] text-yellow-400 font-bold px-1 select-none">{t.renew}:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenewMember(member.id, 1);
                                setRenewingMemberId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#d2ff1f] text-black hover:opacity-90 cursor-pointer"
                              title="1 شهر"
                            >
                              1M
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenewMember(member.id, 3);
                                setRenewingMemberId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#d2ff1f] text-black hover:opacity-90 cursor-pointer"
                              title="3 أشهر"
                            >
                              3M
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenewMember(member.id, 6);
                                setRenewingMemberId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#d2ff1f] text-black hover:opacity-90 cursor-pointer"
                              title="6 أشهر"
                            >
                              6M
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenewMember(member.id, 12);
                                setRenewingMemberId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#d2ff1f] text-black hover:opacity-90 cursor-pointer"
                              title="سنة كاملة"
                            >
                              1Y
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenewingMemberId(null);
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 cursor-pointer"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <>
                            <a
                              href={getWhatsAppUrl(member.phone, member.full_name, member.barcode_id, localizedSport, member.start_date, member.end_date, language, member.status === 'expired')}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className={`p-2 rounded-lg border transition-colors flex items-center justify-center font-bold cursor-pointer ${
                                member.status === 'expired'
                                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-400'
                                  : 'bg-green-500/10 border-green-500/20 hover:border-green-500 hover:bg-green-500/20 text-green-400'
                              }`}
                              title={member.status === 'expired' ? (language === 'ar' ? 'إرسال تذكير بالتجديد عبر واتساب' : 'WhatsApp Renewal Reminder') : 'WhatsApp'}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditMember(member);
                              }}
                              className="p-2 rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] text-zinc-400 transition-colors cursor-pointer"
                              title={t.edit}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            {member.status === 'expired' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenewingMemberId(member.id);
                                }}
                                className="p-2 rounded-lg bg-[#d2ff1f]/10 border border-[#d2ff1f]/30 hover:border-[#d2ff1f] hover:bg-[#d2ff1f]/20 text-[#d2ff1f] transition-colors cursor-pointer"
                                title={t.renew}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {deletingMemberId === member.id ? (
                              <div 
                                className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/20 rounded-lg p-1 animate-fadeIn"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] text-red-400 font-bold px-1 select-none">?</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMember(member.id);
                                    setDeletingMemberId(null);
                                  }}
                                  className="px-2 py-1 text-[10px] font-extrabold rounded bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                                >
                                  {t.confirm}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingMemberId(null);
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                                >
                                  {t.cancel}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingMemberId(member.id);
                                }}
                                className="p-2 rounded-lg bg-zinc-900 border border-[#27272a] hover:border-red-500 hover:text-red-500 text-zinc-400 transition-colors cursor-pointer"
                                title={t.delete}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-[10px] text-[#8a8a93] font-mono">
                        {t.member_end}: {member.end_date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Highly detailed membership card viewing with Dynamic SVG generates barcodes */}
        <div>
          {selectedMember ? (
            <div className={`rounded-2xl border border-[#222226] bg-[#121214] p-6 space-y-6 sticky top-6 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                <div className="flex gap-2">
                  <a
                    href={getWhatsAppUrl(selectedMember.phone, selectedMember.full_name, selectedMember.barcode_id, formatSport(selectedMember.sport_type), selectedMember.start_date, selectedMember.end_date, language, selectedMember.status === 'expired')}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-500/10 border border-green-500/20 hover:border-green-500 hover:bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400 transition-all flex items-center gap-1 font-sans cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {t.whatsapp}
                  </a>
                  <button
                    onClick={handlePrintCard}
                    className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1 font-sans cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" /> {t.print_card}
                  </button>
                </div>
                <h3 className={`text-lg font-extrabold text-white flex items-center gap-1.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                  <Sparkles className="h-4 w-4 text-[#d2ff1f]" /> {t.digital_card}
                </h3>
              </div>

              {/* Printable design frame */}
              <div id="printable-card-area" className="border border-[#222226] bg-[#18181b] rounded-2xl p-5 text-center space-y-5 relative overflow-hidden shadow-xl">
                {/* Brand watermarks */}
                <div className="absolute -left-10 -top-10 h-32 w-32 bg-[#d2ff1f]/[0.01] rounded-full blur-2xl" />
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{GymStore.getSettings().club_name}</div>

                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-white">{selectedMember.full_name}</h4>
                  <p className="text-sm font-semibold text-[#8a8a93] font-mono">{selectedMember.phone}</p>
                </div>

                <div className="bg-[#121214] border border-[#222226] rounded-xl p-3 inline-block">
                  <span className="text-sm font-bold text-white px-2">{formatSport(selectedMember.sport_type)}</span>
                </div>

                {/* QR Code box */}
                <div className="py-2 flex justify-center">
                  <DynamicQRCode value={selectedMember.barcode_id} size={130} />
                </div>

                {/* Sub timelines */}
                <div className="border-t border-[#222226] pt-4 grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
                  <div className="text-left font-sans">
                    <span className="text-zinc-500 block text-[9px]">{t.member_end}</span>
                    <span className="font-extrabold text-white text-[11px] block mt-0.5">{selectedMember.end_date}</span>
                  </div>
                  <div className="text-center font-sans border-r border-l border-[#222226]">
                    <span className="text-zinc-500 block text-[9px]">{t.member_form_fee_label}</span>
                    <span className="font-extrabold text-emerald-400 text-[11px] block mt-0.5">
                      {selectedMember.subscription_fee !== undefined ? `${selectedMember.subscription_fee} ${t.currency}` : `250 ${t.currency}`}
                    </span>
                  </div>
                  <div className="text-right font-sans">
                    <span className="text-zinc-500 block text-[9px]">{t.member_start}</span>
                    <span className="font-extrabold text-[#c4c4c7] text-[11px] block mt-0.5">{selectedMember.start_date}</span>
                  </div>
                </div>
              </div>

              {/* Status details with alert warnings if expired */}
              {selectedMember.status === 'expired' ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-red-500 block font-sans">{t.expired}</span>
                    <span className="text-[11px] font-bold text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                      {getExpiryDetails(selectedMember.end_date, selectedMember.status)}
                    </span>
                  </div>

                  {/* Direct WhatsApp Reminder Button for Expired Member */}
                  <a
                    href={getWhatsAppUrl(selectedMember.phone, selectedMember.full_name, selectedMember.barcode_id, formatSport(selectedMember.sport_type), selectedMember.start_date, selectedMember.end_date, language, true)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{language === 'ar' ? 'إرسال رسالة تذكير للتجديد (واتساب)' : language === 'fr' ? 'Envoyer Relance WhatsApp' : 'Send WhatsApp Renewal Reminder'}</span>
                  </a>
                  
                  {/* Subscription Renewal Actions */}
                  <div className={`pt-2 border-t border-[#222226]/50 space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">{t.renew}:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => onRenewMember(selectedMember.id, 1)}
                        className="py-1.5 px-2 bg-[#d2ff1f] hover:bg-[#bce310] text-black transition-colors rounded-lg font-extrabold text-[11px] shadow cursor-pointer text-center"
                        title="1 شهر"
                      >
                        1M
                      </button>
                      <button
                        onClick={() => onRenewMember(selectedMember.id, 3)}
                        className="py-1.5 px-2 bg-[#d2ff1f] hover:bg-[#bce310] text-black transition-colors rounded-lg font-extrabold text-[11px] shadow cursor-pointer text-center"
                        title="3 أشهر"
                      >
                        3M
                      </button>
                      <button
                        onClick={() => onRenewMember(selectedMember.id, 6)}
                        className="py-1.5 px-2 bg-[#d2ff1f] hover:bg-[#bce310] text-black transition-colors rounded-lg font-extrabold text-[11px] shadow cursor-pointer text-center"
                        title="6 أشهر"
                      >
                        6M
                      </button>
                      <button
                        onClick={() => onRenewMember(selectedMember.id, 12)}
                        className="py-1.5 px-2 bg-[#d2ff1f] hover:bg-[#bce310] text-black transition-colors rounded-lg font-extrabold text-[11px] shadow cursor-pointer text-center"
                        title="سنة كاملة"
                      >
                        1Y
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-4 text-center space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-400 block font-sans">{t.active}</span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {getExpiryDetails(selectedMember.end_date, selectedMember.status)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-500/10">
                    <details className={`cursor-pointer group ${isRtl ? 'text-right' : 'text-left'}`}>
                      <summary className="text-[10px] text-zinc-400 font-sans select-none hover:text-white transition-colors">{t.renew} ➕</summary>
                      <div className="grid grid-cols-4 gap-1.5 mt-2 animate-fadeIn">
                        <button
                          onClick={() => onRenewMember(selectedMember.id, 1)}
                          className="py-1 bg-green-500 hover:bg-green-600 text-black transition-colors rounded-lg font-extrabold text-[10px] cursor-pointer"
                        >
                          +1M
                        </button>
                        <button
                          onClick={() => onRenewMember(selectedMember.id, 3)}
                          className="py-1 bg-green-500 hover:bg-green-600 text-black transition-colors rounded-lg font-extrabold text-[10px] cursor-pointer"
                        >
                          +3M
                        </button>
                        <button
                          onClick={() => onRenewMember(selectedMember.id, 6)}
                          className="py-1 bg-green-500 hover:bg-green-600 text-black transition-colors rounded-lg font-extrabold text-[10px] cursor-pointer"
                        >
                          +6M
                        </button>
                        <button
                          onClick={() => onRenewMember(selectedMember.id, 12)}
                          className="py-1 bg-green-500 hover:bg-green-600 text-black transition-colors rounded-lg font-extrabold text-[10px] cursor-pointer"
                        >
                          +1Y
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#222226] bg-[#121214]/50 p-12 text-center text-[#8a8a93]">
              {t.members_empty}
            </div>
          )}
        </div>

      </div>

      {/* Monthly Report PDF Modal Overlay */}
      {showReportModal && (() => {
        const reportSportCounts = reportMembers.reduce((acc, m) => {
          acc[m.sport_type] = (acc[m.sport_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const totalSubFees = reportMembers.reduce((sum, m) => {
          return sum + (m.subscription_fee !== undefined ? m.subscription_fee : 250);
        }, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans" dir={dir}>
            <div className="relative w-full max-w-5xl bg-[#111115] border border-[#222226] rounded-2xl md:p-6 p-4 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#222226] pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#d2ff1f]" />
                  <h2 className="text-xl font-extrabold text-white">{t.report_modal_title}</h2>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-[#222226] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Config Panel (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#18181b] p-4 rounded-xl border border-[#222226]">
                {/* Target Month Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 block pb-1">{t.report_month_select}:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-zinc-900 text-white rounded-xl border border-[#2f2f33] py-2.5 px-3 text-sm focus:border-[#d2ff1f] focus:outline-none focus:ring-1 focus:ring-[#d2ff1f] cursor-pointer"
                  >
                    {monthsList.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 block pb-1">{t.filter}:</label>
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 text-white rounded-xl border border-[#2f2f33] py-2.5 px-3 text-sm focus:border-[#d2ff1f] focus:outline-none focus:ring-1 focus:ring-[#d2ff1f] cursor-pointer"
                  >
                    <option value="all">{t.members_tab_all}</option>
                    <option value="active">{t.members_tab_active}</option>
                    <option value="expired">{t.members_tab_expired}</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-end justify-end gap-2">
                  <button
                    onClick={generatePDFReport}
                    disabled={isGenerating || reportMembers.length === 0}
                    className={`w-full rounded-xl py-2.5 px-4 text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      reportMembers.length === 0
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        : 'bg-[#d2ff1f] text-black hover:bg-[#c1eb13] hover:shadow-lg hover:shadow-[#d2ff1f]/10'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        <span>{t.report_modal_btn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live A4 Print Report View Area */}
              <div className="space-y-2 mt-2">
                <div className="border border-[#222226] bg-[#161619] p-4 rounded-xl max-h-[46vh] overflow-y-auto">
                  {/* Visual rendering page for PDF Capture */}
                  <div 
                    id="report-print-area" 
                    className="w-full bg-white text-zinc-900 p-8 rounded shadow-lg mx-auto" 
                    style={{ width: '100%', minWidth: '760px', minHeight: '100%', direction: dir, fontFamily: 'system-ui, sans-serif' }}
                  >
                    {/* Official Gym Header */}
                    <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-5 mb-6">
                      <div className="text-left font-sans">
                        <h1 className="text-2xl font-black text-black tracking-tight">{GymStore.getSettings().club_name}</h1>
                        <p className="text-xs text-zinc-500 font-bold mt-1">{t.report_modal_title}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="inline-block border-2 border-zinc-900 px-3 py-1 font-mono font-black text-xs tracking-wider text-black bg-zinc-100 rounded">
                          {monthsList.find(m => m.value === selectedMonth)?.label || selectedMonth}
                        </span>
                      </div>
                    </div>

                    {/* Summary Dashboard metrics bar */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="bg-zinc-50 border border-zinc-200 p-3 rounded text-center">
                        <span className="text-[10px] font-bold text-zinc-500 block mb-1">{t.stat_total_members}</span>
                        <strong className="text-base font-black text-black">{reportMembers.length}</strong>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded text-center">
                        <span className="text-[10px] font-bold text-emerald-700 block mb-1">{t.active}</span>
                        <strong className="text-base font-black text-emerald-800">
                          {reportMembers.filter(m => m.status === 'active').length}
                        </strong>
                      </div>
                      <div className="bg-red-50 border border-red-100 p-3 rounded text-center">
                        <span className="text-[10px] font-bold text-red-600 block mb-1">{t.expired}</span>
                        <strong className="text-base font-black text-red-700">
                          {reportMembers.filter(m => m.status === 'expired').length}
                        </strong>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-300 p-3 rounded text-center">
                        <span className="text-[10px] font-bold text-emerald-800 block mb-1">{t.member_form_fee_label}</span>
                        <strong className="text-base font-mono font-black text-emerald-950">
                          {totalSubFees} {t.currency}
                        </strong>
                      </div>
                    </div>

                    {/* Sports breakdown tags list on PDF */}
                    <div className="bg-zinc-50/50 rounded border border-zinc-200 p-3 mb-6">
                      <span className="text-xs font-black text-zinc-800 block mb-2">{t.sports_title}:</span>
                      <div className="flex flex-wrap gap-4 text-xs justify-start">
                        {Object.entries(reportSportCounts).map(([sport, count]) => (
                          <div key={sport} className="flex items-center gap-1.5 bg-white border border-zinc-200 px-2.5 py-1 rounded">
                            <span className="font-bold text-zinc-700">{formatSport(sport)}:</span>
                            <strong className="text-zinc-950 font-black">{count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Members Main Table */}
                    <div className="overflow-x-auto min-w-full">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-950 text-white border border-zinc-950 font-sans">
                            <th className="py-2.5 px-3 border border-zinc-900 text-center font-bold">#</th>
                            <th className="py-2.5 px-3 border border-zinc-900 font-bold">{t.member_id}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 font-bold">{t.member_name}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 font-bold">{t.phone}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 font-bold">{t.member_sport}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 text-center font-bold">{t.member_start}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 text-center font-bold">{t.member_end}</th>
                            <th className="py-2.5 px-3 border border-zinc-900 text-center font-bold">{t.status}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportMembers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-10 text-center text-zinc-400 font-bold border border-zinc-200">
                                {t.members_empty}
                              </td>
                            </tr>
                          ) : (
                            <>
                              {reportMembers.map((m, idx) => {
                                const isAct = m.status === 'active';
                                return (
                                  <tr key={m.id} className="border-b border-zinc-200 hover:bg-zinc-50/50">
                                    <td className="py-2 px-3 border border-zinc-200 text-center font-mono text-zinc-500">{idx + 1}</td>
                                    <td className="py-2 px-3 border border-zinc-200 font-mono text-zinc-700 font-bold">{m.id}</td>
                                    <td className="py-2 px-3 border border-zinc-200 font-bold text-zinc-900">{m.full_name}</td>
                                    <td className="py-2 px-3 border border-zinc-200 font-mono text-zinc-600">{m.phone}</td>
                                    <td className="py-2 px-3 border border-zinc-200 text-zinc-700">{formatSport(m.sport_type)}</td>
                                    <td className="py-2 px-3 border border-zinc-200 text-center font-mono text-zinc-600">{m.start_date}</td>
                                    <td className="py-2 px-3 border border-zinc-200 text-center font-mono text-zinc-600">{m.end_date}</td>
                                    <td className="py-2 px-3 border border-zinc-200 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isAct 
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                          : 'bg-red-50 text-red-800 border border-red-200'
                                      }`}>
                                        {isAct ? t.active : t.expired}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>

              {/* Modal Bottom control buttons */}
              <div className="flex justify-start border-t border-[#222226] pt-4 gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl border border-[#222226] bg-[#121214] hover:bg-[#1c1c1e] text-zinc-400 hover:text-white px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer text-sans"
                >
                  {t.cancel}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

