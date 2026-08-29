import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Award, Calendar, Phone, User, DollarSign, FileText, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Coach } from '../types';
import { GymStore } from '../services/store';
import { useLanguage } from '../lib/i18n';

interface CoachFormProps {
  coach?: Coach | null; // If provided, we are editing. Otherwise, creating.
  onSave: (coachData: any) => void;
  onCancel: () => void;
}

export default function CoachForm({ coach, onSave, onCancel }: CoachFormProps) {
  const { t, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const settings = GymStore.getSettings();
  const availableSports = settings.sports && settings.sports.length > 0 ? settings.sports : ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState(availableSports[0] || 'Gym');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('4000');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Setup Form for editing or creating
  useEffect(() => {
    if (coach) {
      setFullName(coach.full_name);
      setPhone(coach.phone);
      setEmail(coach.email || '');
      if (availableSports.includes(coach.specialty)) {
        setSpecialty(coach.specialty);
        setIsCustomSpecialty(false);
      } else {
        setIsCustomSpecialty(true);
        setCustomSpecialty(coach.specialty);
      }
      setHireDate(coach.hire_date);
      setSalary(coach.salary !== undefined ? String(coach.salary) : '4000');
      setStatus(coach.status);
      setNotes(coach.notes || '');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setHireDate(todayStr);
      setSalary('4000');
      setStatus('active');
    }
  }, [coach]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(t.error + ': ' + t.coach_form_name_label);
      return;
    }
    if (!phone.trim()) {
      setError(t.error + ': ' + t.coach_form_phone_label);
      return;
    }
    if (!hireDate) {
      setError(t.error + ': ' + t.coach_form_hire_label);
      return;
    }

    const finalSpecialty = isCustomSpecialty ? (customSpecialty.trim() || 'Gym') : specialty;

    const payload: Partial<Coach> = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      specialty: finalSpecialty,
      hire_date: hireDate,
      salary: Number(salary) || 0,
      status,
      notes: notes.trim() || undefined,
      ...(coach ? { id: coach.id, barcode_id: coach.barcode_id, created_at: coach.created_at } : {})
    };

    onSave(payload);
  };

  return (
    <div className={`max-w-2xl mx-auto font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      {/* Back Header */}
      <div className={`flex items-center justify-between mb-8 pb-4 border-b border-[#222226] ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#8a8a93] hover:text-white transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span>{t.back}</span>
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-[#d2ff1f]" />
            <span>{coach ? t.coach_form_edit_title : t.coach_form_create_title}</span>
          </h1>
          <p className="text-xs text-[#8a8a93] mt-1 font-sans">
            {t.coaches_subtitle}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs font-bold text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Main Carbon Card Container */}
      <form onSubmit={handleSubmit} className="border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        
        {/* Full Name field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.coach_form_name_label} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.coach_form_name_placeholder}
              className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 text-sm font-sans ${
                isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
              }`}
            />
            <div className={`absolute inset-y-0 flex items-center text-zinc-500 pointer-events-none ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Phone number field with Morocco +212 flag */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.coach_form_phone_label} <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden focus-within:border-[#d2ff1f] focus-within:ring-1 focus-within:ring-[#d2ff1f] transition-all duration-200">
            {/* National prefix */}
            <div className="bg-[#1e1e21] px-3.5 py-3 border-r border-[#27272a] flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-base select-none">🇲🇦</span>
              <span className="text-xs font-mono font-bold text-zinc-400">+212</span>
            </div>
            
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.coach_form_phone_placeholder}
              className="w-full bg-transparent py-3 px-4 text-left font-mono text-white placeholder-zinc-650 focus:outline-none text-sm"
            />
            <div className="flex items-center px-4 text-zinc-500">
              <Phone className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">
            {t.member_form_phone_hint}
          </p>
        </div>

        {/* Email field (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.coach_form_email_label}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.coach_form_email_placeholder}
            className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 px-4 text-white text-left font-mono placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none text-sm"
          />
        </div>

        {/* Specialty Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              {t.coach_form_specialty_label} <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomSpecialty(!isCustomSpecialty)}
              className="text-xs text-[#d2ff1f] hover:underline font-bold cursor-pointer"
            >
              {isCustomSpecialty ? t.members_filter_all : `+ ${t.member_form_duration_custom}`}
            </button>
          </div>

          {isCustomSpecialty ? (
            <input
              type="text"
              required
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              placeholder={t.coach_form_specialty_label}
              className="w-full rounded-xl border border-[#d2ff1f] bg-[#18181b] py-3 px-4 text-white placeholder-zinc-600 focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSpecialty(sport)}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    specialty === sport
                      ? 'border-[#d2ff1f] bg-[#d2ff1f]/10 text-[#d2ff1f] shadow-sm shadow-[#d2ff1f]/10'
                      : 'border-[#27272a] bg-[#18181b] text-[#8a8a93] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {formatSport(sport)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Employment and Salary details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#222226]">
          {/* Hire Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              {t.coach_form_hire_label} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 px-4 text-white focus:border-[#d2ff1f] focus:outline-none font-mono text-left text-sm"
              />
            </div>
          </div>

          {/* Salary / Fee */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              {t.coach_form_salary_label}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder={t.coach_form_salary_placeholder}
                className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 text-white font-mono placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none text-left text-sm ${
                  isRtl ? 'pr-4 pl-14' : 'pl-4 pr-14'
                }`}
              />
              <div className={`absolute inset-y-0 flex items-center text-zinc-400 font-bold pointer-events-none font-sans text-xs ${
                isRtl ? 'left-0 pl-4' : 'right-0 pr-4'
              }`}>
                {t.currency}
              </div>
            </div>
          </div>
        </div>

        {/* Status selector */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.coach_form_status_label}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                status === 'active'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#27272a] bg-[#18181b] text-zinc-500 hover:text-white'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.active}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus('inactive')}
              className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                status === 'inactive'
                  ? 'border-zinc-500 bg-zinc-800/40 text-zinc-300'
                  : 'border-[#27272a] bg-[#18181b] text-zinc-500 hover:text-white'
              }`}
            >
              <span>{t.inactive}</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.coach_form_notes_label}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.coach_form_notes_placeholder}
            className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 px-4 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none text-xs font-sans resize-none"
          />
        </div>

        {/* Save button actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#222226]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#27272a] hover:bg-[#1c1c1e] text-[#8a8a93] hover:text-white px-6 py-3 text-sm font-bold transition-all cursor-pointer"
          >
            {t.cancel}
          </button>
          
          <button
            type="submit"
            className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-8 py-3 text-sm font-extrabold transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-lg shadow-[#d2ff1f]/15"
          >
            <Save className="h-4 w-4" /> {coach ? t.coach_form_submit_update : t.coach_form_submit_create}
          </button>
        </div>

      </form>
    </div>
  );
}
