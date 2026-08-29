import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Key, Award, Calendar, Phone, User, RotateCcw } from 'lucide-react';
import { Member, SportType } from '../types';
import { GymStore } from '../services/store';
import { useLanguage } from '../lib/i18n';

interface MemberFormProps {
  member?: Member | null; // If provided, we are editing. Otherwise, creating.
  onSave: (memberData: any) => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const { t, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const settings = GymStore.getSettings();
  const sports = settings.sports && settings.sports.length > 0 ? settings.sports : ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sportType, setSportType] = useState<SportType>(member?.sport_type || sports[0]);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('1'); // "1" month, "3" months, "6" months, "12" months, "custom"
  const [endDate, setEndDate] = useState('');
  const [subscriptionFee, setSubscriptionFee] = useState('250');
  const [error, setError] = useState('');

  // Setup Form for editing or creating
  useEffect(() => {
    if (member) {
      setFullName(member.full_name);
      setPhone(member.phone);
      setSportType(member.sport_type);
      setStartDate(member.start_date);
      setEndDate(member.end_date);
      setSubscriptionFee(member.subscription_fee !== undefined ? String(member.subscription_fee) : '250');
      setDuration('custom');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setStartDate(todayStr);
      setSubscriptionFee('250');
      // Default to 1 month
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      setEndDate(end.toISOString().split('T')[0]);
      setDuration('1');
    }
  }, [member]);

  // Recalculate end date whenever start date or duration changes
  useEffect(() => {
    if (duration === 'custom' || !startDate) return;

    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      const months = parseInt(duration, 10);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, duration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(t.error + ': ' + t.member_form_name_label);
      return;
    }
    if (!phone.trim()) {
      setError(t.error + ': ' + t.member_form_phone_label);
      return;
    }
    if (!startDate || !endDate) {
      setError(t.error + ': ' + t.member_form_start_label + ' / ' + t.member_form_end_label);
      return;
    }
    if (endDate < startDate) {
      setError(t.error + ': ' + t.member_form_end_label);
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      sport_type: sportType,
      start_date: startDate,
      end_date: endDate,
      subscription_fee: Number(subscriptionFee) || 0,
      ...(member ? { email: member.email, id: member.id, barcode_id: member.barcode_id, created_at: member.created_at, status: member.status, email_verified: member.email_verified } : {})
    };

    onSave(payload);
  };

  return (
    <div className="max-w-2xl mx-auto font-sans pb-10">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#222226]">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#8a8a93] hover:text-white transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />} {t.back}
        </button>
        <h1 className="text-2xl font-extrabold text-white">
          {member ? t.member_form_edit_title : t.member_form_create_title}
        </h1>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Main Carbon Card Container */}
      <form onSubmit={handleSubmit} className={`border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
        
        {/* Full Name field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.member_form_name_label}
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.member_form_name_placeholder}
              className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
            />
            <div className={`absolute inset-y-0 flex items-center text-zinc-500 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Phone number field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.member_form_phone_label}
          </label>
          <div className="flex items-center rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden focus-within:border-[#d2ff1f] focus-within:ring-1 focus-within:ring-[#d2ff1f] transition-all duration-200">
            {/* National prefix lock for Morocco */}
            <div className={`bg-[#1e1e21] px-3.5 py-3 flex items-center gap-1.5 shrink-0 select-none ${isRtl ? 'border-l border-[#27272a]' : 'border-r border-[#27272a]'}`}>
              <span className="text-base select-none">🇲🇦</span>
              <span className="text-xs font-mono font-bold text-zinc-400">+212</span>
            </div>
            
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.member_form_phone_placeholder}
              className="w-full bg-transparent py-3 px-4 text-left font-mono text-white placeholder-zinc-650 focus:outline-none"
            />
            <div className={`flex items-center text-zinc-500 ${isRtl ? 'pl-4' : 'pr-4'}`}>
              <Phone className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-[10px] text-zinc-500 ${isRtl ? 'text-right' : 'text-left'}`}>
            {t.member_form_phone_hint}
          </p>
        </div>

        {/* Sport Type select buttons (Bento box look) */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.member_form_sport_label}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sports.map((sport) => {
              const localizedSport = formatSport(sport);
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSportType(sport)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer truncate ${
                    sportType === sport
                      ? 'border-[#d2ff1f] bg-[#d2ff1f]/10 text-[#d2ff1f]'
                      : 'border-[#27272a] bg-[#18181b] text-[#8a8a93] hover:border-zinc-700 hover:text-white'
                  }`}
                  title={localizedSport}
                >
                  {localizedSport}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscription timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#222226]">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              {t.member_form_start_label}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 px-4 text-white focus:border-[#d2ff1f] focus:outline-none font-mono text-left"
              />
            </div>
          </div>

          {/* Quick durations selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              {t.member_form_duration_label}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: t.member_form_duration_1m, value: '1' },
                { label: t.member_form_duration_3m, value: '3' },
                { label: t.member_form_duration_6m, value: '6' },
                { label: t.member_form_duration_custom, value: 'custom' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    duration === opt.value
                      ? 'border-[#d2ff1f] bg-[#d2ff1f]/10 text-[#d2ff1f]'
                      : 'border-[#27272a] bg-[#18181b] text-[#8a8a93] hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* End Date (Computed dynamically, or editable if custom) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.member_form_end_label}
          </label>
          <input
            type="date"
            required
            disabled={duration !== 'custom'}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full rounded-xl border py-3 px-4 font-mono text-left ${
              duration === 'custom'
                ? 'border-[#27272a] bg-[#18181b] text-white focus:border-[#d2ff1f] focus:outline-none'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Subscription Fee / Value input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            {t.member_form_fee_label}
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              value={subscriptionFee}
              onChange={(e) => setSubscriptionFee(e.target.value)}
              placeholder={t.member_form_fee_placeholder}
              className={`w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 text-white font-mono placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 text-left ${isRtl ? 'pr-4 pl-14' : 'pl-4 pr-14'}`}
            />
            <div className={`absolute inset-y-0 flex items-center text-zinc-400 font-bold pointer-events-none font-sans text-xs ${isRtl ? 'left-0 pl-4' : 'right-0 pr-4'}`}>
              {t.currency}
            </div>
          </div>
        </div>

        {/* Member ID and Barcode Indicator Info if editing */}
        {member && (
          <div className={`flex items-center justify-between border border-dashed border-[#27272a] rounded-xl p-4 bg-zinc-900/10 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="text-xs font-mono font-bold text-[#d2ff1f]">{member.barcode_id}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a8a93]">{t.member_barcode}</span>
              <Key className="h-4 w-4 text-[#8a8a93]" />
            </div>
          </div>
        )}

        {/* Save button actions */}
        <div className={`flex gap-3 pt-6 border-t border-[#222226] ${isRtl ? 'justify-end' : 'justify-start'}`}>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#27272a] hover:bg-[#1c1c1e] text-[#8a8a93] hover:text-white px-6 py-3 text-sm font-bold transition-all cursor-pointer"
          >
            {t.cancel}
          </button>
          
          <button
            type="submit"
            className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-8 py-3 text-sm font-bold transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" /> {member ? t.member_form_submit_update : t.member_form_submit_create}
          </button>
        </div>

      </form>
    </div>
  );
}

