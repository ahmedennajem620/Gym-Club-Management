import React, { useState } from 'react';
import { 
  Building2, 
  Smartphone, 
  Mail, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Save, 
  Sparkles, 
  Info,
  Users,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  Code,
  FileDown,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Laptop,
  Lock,
  Unlock,
  KeyRound,
  QrCode,
  MessageCircle,
  Share2,
  HelpCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { GymStore } from '../services/store';
import { GymSettings, Member, GymUser } from '../types';
import { testSupabaseConnection } from '../lib/supabase';
import { useLanguage } from '../lib/i18n';
import { getOrCreateDeviceUUID, DeviceInfo } from '../lib/deviceFingerprint';

interface SettingsProps {
  members: Member[];
  onSettingsUpdated: () => void;
  showToastMsg: (message: string, type?: 'success' | 'dark' | 'error') => void;
  onOpenPdfModal?: () => void;
}

export default function Settings({ members, onSettingsUpdated, showToastMsg, onOpenPdfModal }: SettingsProps) {
  const { t, language, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [settings, setSettings] = useState<GymSettings>(GymStore.getSettings());
  
  // General inputs state
  const [clubName, setClubName] = useState(settings.club_name);
  const [clubWhatsapp, setClubWhatsapp] = useState(settings.club_whatsapp);
  const [ownerEmail, setOwnerEmail] = useState(settings.owner_email);

  // Sports management state
  const [newSport, setNewSport] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [confirmingDeleteSport, setConfirmingDeleteSport] = useState<string | null>(null);

  // Supabase management state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isPushingSupabase, setIsPushingSupabase] = useState(false);

  // Device Binding & Simplified License Protection
  const [currentDevice] = useState<DeviceInfo>(getOrCreateDeviceUUID());
  const [currentUserData, setCurrentUserData] = useState<GymUser | null>(
    GymStore.getUserByEmail(settings.owner_email)
  );
  const [isUnbinding, setIsUnbinding] = useState(false);
  const [showMobileQrModal, setShowMobileQrModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferError, setTransferError] = useState('');

  const handleUnbindDevice = (target: 'windows' | 'mobile' | 'both') => {
    setIsUnbinding(true);
    setTransferError('');
    setTransferSuccess('');
    const result = GymStore.unbindDevice(settings.owner_email, target);
    setIsUnbinding(false);
    if (result.success) {
      setCurrentUserData(GymStore.getUserByEmail(settings.owner_email));
      setTransferSuccess(language === 'ar' ? 'تمت إعادة ضبط الترخيص بنجاح، يمكنك الآن تفعيل الجهاز الجديد.' : result.message);
      showToastMsg(result.message, 'success');
      setTimeout(() => {
        setShowTransferModal(false);
        setTransferSuccess('');
      }, 2500);
    } else {
      setTransferError(result.message);
      showToastMsg(result.message, 'error');
    }
  };

  const getOwnerAppUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?role=owner&email=${encodeURIComponent(settings.owner_email)}`;
  };

  const handleCopyOwnerLink = () => {
    navigator.clipboard.writeText(getOwnerAppUrl());
    setCopiedLink(true);
    showToastMsg(language === 'ar' ? 'تم نسخ رابط تطبيق المالك بنجاح!' : 'Owner app link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Supabase action handlers
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    const result = await testSupabaseConnection();
    setIsTestingConn(false);
    showToastMsg(result.message, result.success ? 'success' : 'error');
  };

  const handlePullFromSupabase = async () => {
    setIsSyncingSupabase(true);
    const result = await GymStore.syncFromSupabase();
    setIsSyncingSupabase(false);
    if (result.success) {
      onSettingsUpdated();
      setSettings(GymStore.getSettings());
      setClubName(GymStore.getSettings().club_name);
      setClubWhatsapp(GymStore.getSettings().club_whatsapp);
      setOwnerEmail(GymStore.getSettings().owner_email);
      showToastMsg(result.message, 'success');
    } else {
      showToastMsg(result.message, 'error');
    }
  };

  const handlePushToSupabase = async () => {
    setIsPushingSupabase(true);
    const result = await GymStore.pushAllToSupabase();
    setIsPushingSupabase(false);
    showToastMsg(result.message, result.success ? 'success' : 'error');
  };

  // General Settings Submit Handlers
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) {
      showToastMsg(language === 'ar' ? 'يرجى إدخال اسم النادي بشكل صحيح.' : 'Please enter club name.', 'error');
      return;
    }
    if (!clubWhatsapp.trim()) {
      showToastMsg(language === 'ar' ? 'يرجى إدخال رقم واتساب معتمد.' : 'Please enter a valid WhatsApp number.', 'error');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      showToastMsg(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح وصالح للمالك.' : 'Please enter a valid owner email.', 'error');
      return;
    }

    const updated: GymSettings = {
      ...settings,
      club_name: clubName.trim(),
      club_whatsapp: clubWhatsapp.trim().replace(/\s+/g, ''),
      owner_email: ownerEmail.trim().toLowerCase()
    };

    GymStore.updateSettings(updated);
    setSettings(updated);
    onSettingsUpdated();
    showToastMsg(language === 'ar' ? 'تم حفظ وتعديل إعدادات النادي والمالك بنجاح!' : 'Club settings saved successfully!', 'success');
  };

  // Add a new sport
  const handleAddSport = () => {
    if (!newSport.trim()) {
      showToastMsg(language === 'ar' ? 'يرجى كتابة اسم الرياضة المراد إضافتها أولاً' : 'Please enter sport name.', 'error');
      return;
    }
    
    const normalizedSport = newSport.trim();
    if (settings.sports.some(s => s.toLowerCase() === normalizedSport.toLowerCase())) {
      showToastMsg(language === 'ar' ? 'هذه الرياضة مضافة بالفعل سابقاً' : 'This sport already exists.', 'error');
      return;
    }

    const updatedSports = [...settings.sports, normalizedSport];
    const updatedSettings = {
      ...settings,
      sports: updatedSports
    };

    GymStore.updateSettings(updatedSettings);
    setSettings(updatedSettings);
    setNewSport('');
    onSettingsUpdated();
    showToastMsg(language === 'ar' ? `تم إضافة رياضة "${normalizedSport}" بنجاح للخيارات المتاحة!` : `Sport "${normalizedSport}" added successfully!`, 'success');
  };

  // Start inline editing of a sport name
  const startEditSport = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  // Save renamed sport
  const saveSportRename = (index: number) => {
    const oldName = settings.sports[index];
    const newName = editingValue.trim();

    if (!newName) {
      showToastMsg(language === 'ar' ? 'اسم الرياضة لا يمكن أن يكون فارغاً' : 'Sport name cannot be empty.', 'error');
      return;
    }

    if (newName === oldName) {
      setEditingIndex(null);
      return;
    }

    // Check if duplicate
    const alreadyExists = settings.sports.some((s, idx) => idx !== index && s.toLowerCase() === newName.toLowerCase());
    if (alreadyExists) {
      showToastMsg(language === 'ar' ? 'اسم رياضة آخر مسجل بنفس هذا المسمى الجديد' : 'A sport with this name already exists.', 'error');
      return;
    }

    // Call store layer to update sport list & shift all affected members' sport_type
    GymStore.renameSportInStore(oldName, newName);
    
    // Refresh local component states
    const updated = GymStore.getSettings();
    setSettings(updated);
    setEditingIndex(null);
    onSettingsUpdated();
    showToastMsg(language === 'ar' ? `تم تعديل الرياضة بنجاح وتحديث كافة أعضائها المشتركين!` : `Sport updated successfully!`, 'success');
  };

  // Delete a sport format
  const deleteSport = (sportName: string) => {
    GymStore.deleteSportInStore(sportName);
    const updated = GymStore.getSettings();
    setSettings(updated);
    onSettingsUpdated();
    showToastMsg(language === 'ar' ? `تم حذف الرياضة بنجاح وإعادة تكوين اشتراكات الأعضاء المتأثرين.` : `Sport deleted successfully.`, 'dark');
  };

  // Helper to count members in a specific sport
  const getMemberCountBySport = (sportName: string) => {
    return members.filter(m => m.sport_type === sportName).length;
  };

  return (
    <div className={`space-y-8 font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Header Banner */}
      <div className="pb-4 border-b border-[#222226]">
        <h1 className="text-3xl font-extrabold text-white">{t.settings_title}</h1>
        <p className="text-sm text-[#8a8a93] mt-1 font-sans">
          {t.settings_desc}
        </p>
      </div>

      {/* Section: Comprehensive PDF Data & Reports Export */}
      <div className={`border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d2ff1f]/10 text-[#d2ff1f] flex items-center justify-center">
              <FileDown className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">{t.pdf_export_title}</h2>
              <p className="text-xs text-[#8a8a93]">{t.pdf_export_desc}</p>
            </div>
          </div>

          {onOpenPdfModal && (
            <button
              type="button"
              onClick={onOpenPdfModal}
              className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-5 py-2.5 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d2ff1f]/10"
            >
              <FileDown className="h-4 w-4 stroke-[2.5]" />
              <span>{t.pdf_export_btn}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a]">
            <span className="text-xs font-bold text-white block">{t.pdf_export_members}</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">تصدير كافة سجلات المشتركين وتواريخ الانتهاء والرياضات المسجلة.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a]">
            <span className="text-xs font-bold text-white block">{t.pdf_export_coaches}</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">سجلات الكادر الفني والمدربين والرواتب والمجالات التخصصية.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a]">
            <span className="text-xs font-bold text-white block">{t.pdf_export_attendance}</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">كشوفات الحضور اليومية والتوقيتات وأختام الدخول الذكية.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section A: Club general Profile settings */}
        <div className="space-y-6">
          <div className="border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className={`text-lg font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#222226] ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <Sparkles className="h-4.5 w-4.5 text-[#d2ff1f]" /> {t.settings_basic_title}
            </h2>

            <form onSubmit={handleSaveGeneralSettings} className="space-y-5">
              
              {/* Club name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#c4c4c7] block">
                  {t.settings_club_name}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="GYM CLUB"
                    className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 ${
                      isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                    }`}
                  />
                  <div className={`absolute inset-y-0 flex items-center text-zinc-500 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#c4c4c7] block">
                  {t.settings_whatsapp}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clubWhatsapp}
                    onChange={(e) => setClubWhatsapp(e.target.value)}
                    placeholder="212612345678"
                    className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 font-mono text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 ${
                      isRtl ? 'pr-11 pl-4 text-left' : 'pl-11 pr-4 text-left'
                    }`}
                  />
                  <div className={`absolute inset-y-0 flex items-center text-zinc-500 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                    <Smartphone className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Owner email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#c4c4c7] block">
                  {t.settings_owner_email}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@gymclub.com"
                    className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 font-mono text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 ${
                      isRtl ? 'pr-11 pl-4 text-left' : 'pl-11 pr-4 text-left'
                    }`}
                  />
                  <div className={`absolute inset-y-0 flex items-center text-zinc-500 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Actions submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black py-3 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-md shadow-[#d2ff1f]/15 cursor-pointer"
              >
                <Save className="h-4 w-4" /> {t.save_changes}
              </button>

            </form>
          </div>
        </div>

        {/* Section B: Sports & Activities Dynamic setup */}
        <div className="space-y-6">
          <div className="border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className={`text-lg font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#222226] ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <Users className="h-4.5 w-4.5 text-[#d2ff1f]" /> {t.sports_manage_title}
            </h2>

            {/* Form to add a new sport */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#c4c4c7] block">
                {t.sports_add_new}
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: جودو، كاراتيه، كرة قدم' : 'e.g. Judo, Karate, Yoga'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSport();
                    }
                  }}
                  className={`flex-1 rounded-xl border border-[#27272a] bg-[#18181b] py-3 px-4 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none transition-all duration-200 ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddSport}
                  className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-4 flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List of current dynamic sports */}
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-[#8a8a93] block mb-1">{t.sports_title}:</span>
              
              {settings.sports.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-[#222226] rounded-xl">
                  {t.members_empty}
                </div>
              ) : (
                settings.sports.map((sport, index) => {
                  const isEditing = editingIndex === index;
                  const count = getMemberCountBySport(sport);
                  const localizedSport = formatSport(sport);

                  return (
                    <div 
                      key={sport + '-' + index}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#222226] bg-[#18181b] hover:border-[#27272a] transition-all"
                    >
                      {/* Name and athletic statistics */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveSportRename(index);
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            className="bg-black/40 border border-[#d2ff1f] rounded-lg py-1 px-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none w-full max-w-[150px]"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <span className="text-xs font-bold text-white block truncate">
                              {localizedSport} {localizedSport !== sport && <span className="text-[10px] text-zinc-500 font-mono">({sport})</span>}
                            </span>
                            <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 mt-0.5 inline-block font-sans">
                              {count} {t.members_title}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action editing or deletion buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveSportRename(index)}
                              className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              title={t.confirm}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-2 rounded-lg bg-zinc-800 border border-[#27272a] text-zinc-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                              title={t.cancel}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : confirmingDeleteSport === sport ? (
                          <div className="flex items-center gap-1 bg-red-950/20 border border-red-500/20 rounded-lg p-1 animate-fadeIn">
                            <span className="text-[10px] text-red-400 font-bold px-1 select-none">?</span>
                            <button
                              onClick={() => {
                                deleteSport(sport);
                                setConfirmingDeleteSport(null);
                              }}
                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              {t.confirm}
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteSport(null)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] cursor-pointer"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditSport(index, sport)}
                              className="p-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title={t.edit}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteSport(sport)}
                              disabled={settings.sports.length <= 1}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                settings.sports.length <= 1 
                                  ? 'opacity-30 cursor-not-allowed text-zinc-600 bg-transparent' 
                                  : 'bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/20 text-red-400'
                              }`}
                              title={t.delete}
                            >
                               <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Section C: Cloud Synchronization & Backup (Simplified & Secured) */}
      <div className="border border-emerald-500/20 bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'ar' ? 'السحابة متصلة ومؤمنة' : 'Cloud Connected & Encrypted'}
            </span>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              {language === 'ar' ? 'المزامنة والنسخ الاحتياطي السحابي' : 'Cloud Sync & Data Backup'}
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-sans">
            {language === 'ar' ? 'حفظ تلقائي للبيانات وحمايتها من الضياع' : 'Automatic real-time data sync & cloud protection'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Action 1: Test Connection */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">1. {language === 'ar' ? 'فحص حالة السحابة' : 'Check Cloud Status'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {language === 'ar' ? 'التحقق من جاهزية السحابة وسرعة اتصال الخوادم المشفرة.' : 'Verify encrypted cloud server connection health.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="w-full mt-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isTestingConn ? 'animate-spin' : ''}`} />
              {isTestingConn ? '...' : (language === 'ar' ? 'فحص الاتصال بالسحابة' : 'Test Connection')}
            </button>
          </div>

          {/* Action 2: Push Local to Supabase */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">2. {language === 'ar' ? 'حفظ نسخة احتياطية' : 'Create Cloud Backup'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {language === 'ar' ? 'رفع وحفظ كافة المشتركين والمدفوعات والإعدادات فورياً في السحابة.' : 'Save all members, finances, and settings to the cloud.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePushToSupabase}
              disabled={isPushingSupabase}
              className="w-full mt-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-4 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15"
            >
              <Database className="h-4 w-4" />
              {isPushingSupabase ? '...' : (language === 'ar' ? 'حفظ نسخة احتياطية سحابية' : 'Backup to Cloud')}
            </button>
          </div>

          {/* Action 3: Fetch Data from Supabase */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <RefreshCw className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">3. {language === 'ar' ? 'مزامنة واسترجاع' : 'Sync & Restore'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {language === 'ar' ? 'استيراد آخر التحديثات والسجلات المحفوظة في السحابة وتحديث الجهاز.' : 'Fetch and load the latest updates from the cloud.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePullFromSupabase}
              disabled={isSyncingSupabase}
              className="w-full mt-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-[#3f3f46] text-white py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
              {isSyncingSupabase ? '...' : (language === 'ar' ? 'مزامنة البيانات من السحابة' : 'Sync from Cloud')}
            </button>
          </div>

        </div>
      </div>

      {/* Section D: Simplified & User-Facing License Management & Device Binding */}
      <div className="border border-sky-500/20 bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              {language === 'ar' ? 'نظام الحماية معتمد' : 'Certified Protection'}
            </span>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
              {language === 'ar' ? 'حالة الترخيص وإدارة الأجهزة' : 'License & Device Security'}
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-sans">
            {language === 'ar' ? 'حسابك محمي ومقيد بأجهزتك المعتمدة فقط' : 'Protected and bound to your authorized devices only'}
          </span>
        </div>

        {/* 1. Main License Status Badge Banner */}
        <div className="bg-gradient-to-r from-emerald-950/30 via-[#18181b] to-sky-950/20 border border-emerald-500/30 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {language === 'ar'
                    ? (currentDevice.device_type === 'mobile' ? 'الترخيص مفعل (هاتف ذكي معتمد)' : 'الترخيص مفعل (جهاز حاسوب معتمد)')
                    : (currentDevice.device_type === 'mobile' ? 'License Active (Verified Mobile Device)' : 'License Active (Verified Windows PC)')}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans">
                {language === 'ar'
                  ? 'تم التحقق من مطابقة ترخيص النظام مع جهازك الحالي في السحابة بنجاح.'
                  : 'Your device hardware has been verified against your cloud license.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex items-center gap-3 bg-[#121214] px-4 py-2 rounded-xl border border-zinc-800 text-xs">
              <div className="flex items-center gap-1.5">
                <Laptop className="h-4 w-4 text-sky-400" />
                <span className="text-zinc-300">
                  {language === 'ar' ? 'الحاسوب:' : 'PC:'}
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentUserData?.allowed_windows_device_id ? '✓ معتمد' : (language === 'ar' ? 'جاهز للربط' : 'Ready')}
                </span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-amber-400" />
                <span className="text-zinc-300">
                  {language === 'ar' ? 'الهاتف:' : 'Mobile:'}
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentUserData?.allowed_mobile_device_id ? '✓ معتمد' : (language === 'ar' ? 'جاهز للربط' : 'Ready')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. User-Facing Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Action A: Connect Mobile App for Owner */}
          <div className="bg-[#18181b] border border-sky-500/20 hover:border-sky-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {language === 'ar' ? 'ربط تطبيق المالك على الهاتف' : 'Connect Owner Mobile App'}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {language === 'ar' ? 'متابعة النادي وتسجيل الدخول من هاتفك الشخصي' : 'Access your gym dashboard directly from your phone'}
                    </p>
                  </div>
                </div>
                {currentUserData?.allowed_mobile_device_id ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {language === 'ar' ? 'مرتبط' : 'Connected'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                    {language === 'ar' ? 'متاح للربط' : 'Available'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans pt-1">
                {language === 'ar'
                  ? 'امسح رمز QR لفتح النظام على هاتفك، وسيتم التعرف على جهازك واعتماده تلقائياً في الخلفية.'
                  : 'Scan the QR code to open the app on your phone and automatically bind it as your verified device.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileQrModal(true)}
              className="w-full mt-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black py-2.5 px-4 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/15"
            >
              <QrCode className="h-4 w-4" />
              <span>{language === 'ar' ? 'ربط تطبيق المالك على الهاتف' : 'Pair Owner Mobile App'}</span>
            </button>
          </div>

          {/* Action B: Transfer License to New Device */}
          <div className="bg-[#18181b] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
                    <RefreshCw className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {language === 'ar' ? 'نقل الترخيص لجهاز آخر' : 'Transfer License to New Device'}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {language === 'ar' ? 'عند تغيير حاسوب النادي أو شراء هاتف جديد' : 'When upgrading or changing your computer or phone'}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans pt-1">
                {language === 'ar'
                  ? 'هل ترغب في تغيير جهاز الحاسوب أو الهاتف؟ يمكنك طلب نقل الترخيص للجهاز الجديد بكل سهولة.'
                  : 'Need to switch to a new PC or smartphone? Submit a transfer request or reassign your license.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTransferError('');
                setTransferSuccess('');
                setShowTransferModal(true);
              }}
              className="w-full mt-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white hover:text-[#d2ff1f] py-2.5 px-4 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-amber-400" />
              <span>{language === 'ar' ? 'طلب نقل الترخيص لجهاز جديد' : 'Request License Transfer'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Modal 1: Mobile App Pairing QR Code Modal */}
      {showMobileQrModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-fadeIn" dir={dir}>
          <div className="w-full max-w-sm rounded-3xl bg-[#121214] border border-sky-500/30 text-white shadow-2xl p-6 md:p-7 relative text-center">
            <button
              type="button"
              onClick={() => setShowMobileQrModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <QrCode className="h-6 w-6" />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1">
              {language === 'ar' ? 'ربط تطبيق المالك على الهاتف' : 'Pair Owner Mobile App'}
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-sans">
              {language === 'ar'
                ? 'امسح هذا الرمز بواسطة كاميرا هاتفك لفتح تطبيق المالك وربط الهاتف كجهاز معتمد تلقائياً.'
                : 'Scan with your phone camera to open the app and automatically bind your mobile device.'}
            </p>

            {/* Dynamic QR Code Image */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl mb-4 border-2 border-sky-400/30">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getOwnerAppUrl())}&color=000000&bgcolor=ffffff`}
                alt="Owner App QR Code"
                width={180}
                height={180}
                referrerPolicy="no-referrer"
                className="object-contain"
              />
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCopyOwnerLink}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-sky-400" />}
                <span>{copiedLink ? (language === 'ar' ? 'تم نسخ الرابط!' : 'Link Copied!') : (language === 'ar' ? 'نسخ رابط الدخول المباشر' : 'Copy Access Link')}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `رابط تطبيق المالك لنادي ${settings.club_name}:\n${getOwnerAppUrl()}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Share2 className="h-4 w-4" />
                <span>{language === 'ar' ? 'إرسال الرابط إلى هاتفي عبر واتساب' : 'Send Link via WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Transfer License Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-fadeIn" dir={dir}>
          <div className="w-full max-w-md rounded-3xl bg-[#121214] border border-amber-500/30 text-white shadow-2xl p-6 md:p-8 relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {language === 'ar' ? 'طلب نقل الترخيص لجهاز جديد' : 'Request License Transfer'}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    {language === 'ar' ? 'نقل البرنامج إلى حاسوب جديد أو هاتف جديد' : 'Reassign your license to a new PC or smartphone'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {transferSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-400 font-bold">
                {transferSuccess}
              </div>
            )}

            {transferError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400 font-bold">
                {transferError}
              </div>
            )}

            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 mb-5 space-y-2 text-xs text-zinc-300 font-sans leading-relaxed">
              <p className="font-bold text-white">
                {language === 'ar' ? 'كيف تعمل عملية نقل الترخيص؟' : 'How does license transfer work?'}
              </p>
              <p className="text-zinc-400">
                {language === 'ar'
                  ? 'عند نقل الترخيص، يتم إلغاء ربط الجهاز القديم وإتاحة تسجيل الدخول من جهازك الجديد ليتم اعتماده وتأمينه تلقائياً.'
                  : 'Transferring your license unbinds the old hardware slot so your new PC or phone is automatically authorized upon login.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: WhatsApp Support Transfer */}
              <a
                href={`https://wa.me/212612345678?text=${encodeURIComponent(
                  `السلام عليكم، أطلب نقل ترخيص نظام GymFlow لنادي: ${settings.club_name}\nالبريد المسجل: ${settings.owner_email}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{language === 'ar' ? 'إرسال طلب نقل الترخيص للدعم الفني (WhatsApp)' : 'Contact Support for Transfer'}</span>
              </a>

              {/* Option 2: Instant Unbind for PC or Mobile */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={isUnbinding}
                  onClick={() => handleUnbindDevice('windows')}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Laptop className="h-3.5 w-3.5 text-sky-400" />
                  <span>{language === 'ar' ? 'نقل ترخيص الحاسوب' : 'Transfer PC'}</span>
                </button>
                <button
                  type="button"
                  disabled={isUnbinding}
                  onClick={() => handleUnbindDevice('mobile')}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'نقل ترخيص الهاتف' : 'Transfer Mobile'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="w-full py-2 text-zinc-500 hover:text-white text-xs font-bold transition-colors cursor-pointer mt-1"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


