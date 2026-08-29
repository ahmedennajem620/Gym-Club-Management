import React, { useState, useRef } from 'react';
import { 
  FileDown, 
  Printer, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  DollarSign, 
  ClipboardList, 
  Dumbbell, 
  ShieldCheck,
  Building2,
  FileText,
  Layers,
  ArrowDownToLine,
  Loader2
} from 'lucide-react';
import { Member, Coach, Attendance } from '../types';
import { GymStore } from '../services/store';
import { useLanguage } from '../lib/i18n';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DataExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  coaches: Coach[];
  attendance: Attendance[];
}

type ReportType = 'ALL' | 'MEMBERS' | 'COACHES' | 'ATTENDANCE';

export default function DataExportPdfModal({
  isOpen,
  onClose,
  members,
  coaches,
  attendance
}: DataExportPdfModalProps) {
  const { t, language, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [reportType, setReportType] = useState<ReportType>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const settings = GymStore.getSettings();

  if (!isOpen) return null;

  // Compute live statistics
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const totalRevenue = members.reduce((sum, m) => sum + (Number(m.subscription_fee) || 0), 0);
  const activeCoaches = coaches.filter(c => c.status === 'active').length;
  const totalCoachSalaries = coaches.reduce((sum, c) => sum + (Number(c.salary) || 0), 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.checkin_date === todayStr).length;

  const nowFormatted = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      setIsGenerating(true);
      setStatusMessage(t.pdf_export_generating);

      const element = reportRef.current;
      
      // Render canvas with crisp scale
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculate A4 dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const dateCode = new Date().toISOString().split('T')[0];
      const fileName = `${settings.club_name.replace(/\s+/g, '_')}_Report_${reportType}_${dateCode}.pdf`;
      
      pdf.save(fileName);
      setStatusMessage(null);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setStatusMessage('Error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    
    // Create a printable window
    const printContent = reportRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}">
        <head>
          <title>${settings.club_name} - Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: ${language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
              color: #09090b;
              background-color: #ffffff;
              margin: 0;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th, td { border: 1px solid #e4e4e7; padding: 6px 8px; text-align: ${isRtl ? 'right' : 'left'}; }
            th { background-color: #f4f4f5; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .badge-active { background-color: #dcfce7; color: #15803d; }
            .badge-expired { background-color: #fee2e2; color: #b91c1c; }
            .badge-coach { background-color: #f3e8ff; color: #7e22ce; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
            .kpi-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px; background: #fafafa; }
            .kpi-val { font-size: 18px; font-weight: 800; }
            .kpi-lbl { font-size: 10px; color: #71717a; font-weight: bold; }
            @page { margin: 15mm; size: A4; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121214] border border-[#222226] shadow-2xl text-white overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222226] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#d2ff1f]/10 text-[#d2ff1f] flex items-center justify-center font-bold">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>{t.pdf_export_title}</span>
              </h2>
              <p className="text-xs text-[#8a8a93] font-sans">
                {t.pdf_export_desc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-zinc-900 border border-[#27272a] hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t.pdf_export_close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Report Filter Buttons & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#18181b] border-b border-[#222226]">
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121214] border border-[#27272a] rounded-xl text-xs font-bold">
            <button
              onClick={() => setReportType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'ALL' ? 'bg-[#d2ff1f] text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t.pdf_export_all}</span>
            </button>
            <button
              onClick={() => setReportType('MEMBERS')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'MEMBERS' ? 'bg-[#d2ff1f] text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t.members} ({members.length})</span>
            </button>
            <button
              onClick={() => setReportType('COACHES')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'COACHES' ? 'bg-[#d2ff1f] text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>{t.coaches} ({coaches.length})</span>
            </button>
            <button
              onClick={() => setReportType('ATTENDANCE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                reportType === 'ATTENDANCE' ? 'bg-[#d2ff1f] text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>{t.attendance} ({attendance.length})</span>
            </button>
          </div>

          {/* Download & Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-[#27272a] hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t.pdf_export_print}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d2ff1f] hover:bg-[#bceb17] text-black font-extrabold text-xs transition-all shadow shadow-[#d2ff1f]/15 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.pdf_export_generating}</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4 stroke-[2.5]" />
                  <span>{t.pdf_export_download_now}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Preview Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0e0e10] flex justify-center">
          
          {/* Printable Report Canvas - High contrast White background for Crisp Printing */}
          <div 
            ref={reportRef}
            className="w-full max-w-3xl bg-white text-zinc-900 rounded-xl p-8 shadow-xl font-sans text-xs leading-normal"
            style={{ minHeight: '800px' }}
            dir={dir}
          >
            {/* Header / Brand of the PDF */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 text-[#d2ff1f] flex items-center justify-center font-bold shadow-md">
                  <Dumbbell className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">{settings.club_name}</h1>
                  <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                    {settings.club_whatsapp && `WhatsApp: ${settings.club_whatsapp}`} {settings.owner_email && `• Email: ${settings.owner_email}`}
                  </p>
                </div>
              </div>

              <div className={isRtl ? 'text-left' : 'text-right'}>
                <span className="inline-block bg-zinc-900 text-white font-extrabold px-3 py-1 rounded-md text-[11px] tracking-wider uppercase">
                  {reportType === 'ALL' && t.pdf_export_all}
                  {reportType === 'MEMBERS' && t.pdf_export_members}
                  {reportType === 'COACHES' && t.pdf_export_coaches}
                  {reportType === 'ATTENDANCE' && t.pdf_export_attendance}
                </span>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  {t.pdf_export_generated_at}: {nowFormatted}
                </p>
              </div>
            </div>

            {/* KPI Summary Block (Always visible in ALL or respective modes) */}
            <div className="mb-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-zinc-900" />
                <span>{t.pdf_export_summary_stats}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="text-[10px] font-bold text-zinc-500 block">{t.members_stat_total}</span>
                  <span className="text-lg font-extrabold text-zinc-900 mt-0.5 block">{members.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-700 block">{t.members_stat_active}</span>
                  <span className="text-lg font-extrabold text-emerald-800 mt-0.5 block">{activeMembers}</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[10px] font-bold text-red-700 block">{t.members_stat_expired}</span>
                  <span className="text-lg font-extrabold text-red-800 mt-0.5 block">{expiredMembers}</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-[10px] font-bold text-purple-700 block">{t.coaches_stat_total}</span>
                  <span className="text-lg font-extrabold text-purple-800 mt-0.5 block">{coaches.length}</span>
                </div>
              </div>

              {/* Financial mini summary */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-zinc-900 text-white rounded-lg flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300">{t.pdf_export_financial} (إجمالي الاشتراكات)</span>
                  <span className="text-base font-extrabold text-[#d2ff1f] font-mono">{totalRevenue.toLocaleString()} {t.currency}</span>
                </div>
                <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-600">حضور اليوم بالماسح ({todayStr})</span>
                  <span className="text-base font-extrabold text-zinc-900 font-mono">{todayAttendance} عملية حضور</span>
                </div>
              </div>
            </div>

            {/* SECTION 1: MEMBERS TABLE */}
            {(reportType === 'ALL' || reportType === 'MEMBERS') && (
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{t.pdf_export_members} ({members.length})</span>
                  </h3>
                </div>

                {members.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">{t.members_empty}</p>
                ) : (
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 font-bold border-y border-zinc-300">
                        <th className="py-2 px-2 text-left font-mono">ID</th>
                        <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.members_th_name}</th>
                        <th className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.members_th_phone}</th>
                        <th className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.members_th_sport}</th>
                        <th className="py-2 px-2 text-center">{t.status}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.member_end}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.member_form_fee_label}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {members.map((m) => {
                        const isActive = m.status === 'active';
                        return (
                          <tr key={m.id} className="hover:bg-zinc-50">
                            <td className="py-2 px-2 font-mono text-[10px] text-zinc-500 font-bold">{m.barcode_id}</td>
                            <td className={`py-2 px-3 font-bold text-zinc-900 ${isRtl ? 'text-right' : 'text-left'}`}>{m.full_name}</td>
                            <td className={`py-2 px-2 font-mono text-[10px] text-zinc-600 ${isRtl ? 'text-right' : 'text-left'}`}>{m.phone}</td>
                            <td className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{formatSport(m.sport_type)}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isActive ? t.active : t.expired}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-mono text-[10px] text-zinc-700">{m.end_date}</td>
                            <td className="py-2 px-2 font-mono text-[10px] font-bold text-zinc-900">{m.subscription_fee || 0} {t.currency}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SECTION 2: COACHES TABLE */}
            {(reportType === 'ALL' || reportType === 'COACHES') && (
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>{t.pdf_export_coaches} ({coaches.length})</span>
                  </h3>
                </div>

                {coaches.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">{t.coaches_empty}</p>
                ) : (
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 font-bold border-y border-zinc-300">
                        <th className="py-2 px-2 text-left font-mono">ID</th>
                        <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.coaches_col_name}</th>
                        <th className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.coaches_col_phone}</th>
                        <th className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.coaches_col_specialty}</th>
                        <th className="py-2 px-2 text-center">{t.status}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.coach_form_salary_label}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.coach_form_hire_label}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {coaches.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-50">
                          <td className="py-2 px-2 font-mono text-[10px] text-zinc-500 font-bold">{c.barcode_id}</td>
                          <td className={`py-2 px-3 font-bold text-zinc-900 ${isRtl ? 'text-right' : 'text-left'}`}>{c.full_name}</td>
                          <td className={`py-2 px-2 font-mono text-[10px] text-zinc-600 ${isRtl ? 'text-right' : 'text-left'}`}>{c.phone}</td>
                          <td className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{formatSport(c.specialty)}</td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                              {c.status === 'active' ? t.active : t.inactive}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-mono text-[10px] font-bold text-zinc-900">{c.salary ? `${c.salary} ${t.currency}` : '-'}</td>
                          <td className="py-2 px-2 font-mono text-[10px] text-zinc-600">{c.hire_date || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SECTION 3: ATTENDANCE LOGS TABLE */}
            {(reportType === 'ALL' || reportType === 'ATTENDANCE') && (
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4" />
                    <span>{t.pdf_export_attendance} ({attendance.length})</span>
                  </h3>
                </div>

                {attendance.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">{t.att_empty}</p>
                ) : (
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 font-bold border-y border-zinc-300">
                        <th className="py-2 px-2 text-left font-mono">{t.att_col_date}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.att_col_time}</th>
                        <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.att_col_name}</th>
                        <th className="py-2 px-2 text-left font-mono">{t.att_col_id}</th>
                        <th className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.att_col_role_sport}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {attendance.slice(0, 30).map((a) => {
                        const isCoach = a.person_type === 'coach' || a.member_id.startsWith('COA_');
                        return (
                          <tr key={a.id} className="hover:bg-zinc-50">
                            <td className="py-2 px-2 font-mono text-[10px] text-zinc-600">{a.checkin_date}</td>
                            <td className="py-2 px-2 font-mono text-[10px] font-bold text-zinc-900">{a.checkin_time}</td>
                            <td className={`py-2 px-3 font-bold text-zinc-900 ${isRtl ? 'text-right' : 'text-left'}`}>{a.member_name}</td>
                            <td className="py-2 px-2 font-mono text-[10px] text-zinc-500">{a.member_id}</td>
                            <td className={`py-2 px-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                isCoach ? 'bg-purple-100 text-purple-800' : 'bg-zinc-100 text-zinc-800'
                              }`}>
                                {isCoach ? `${t.scanner_coach_badge} (${formatSport(a.sport_or_specialty || 'Coach')})` : formatSport(a.sport_or_specialty || 'Gym')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                {attendance.length > 30 && (
                  <p className="text-[10px] text-zinc-400 italic text-center mt-2">
                    * يتم عرض أحدث 30 عملية حضور مسجلة في هذا التقرير
                  </p>
                )}
              </div>
            )}

            {/* Footer of the PDF Report */}
            <div className="border-t border-zinc-300 pt-4 mt-8 flex items-center justify-between text-[10px] text-zinc-500">
              <span>{settings.club_name} • Smart Gym Management System</span>
              <span>الصفحة 1 من 1</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
