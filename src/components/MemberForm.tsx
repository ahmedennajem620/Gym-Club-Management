import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, Key, Award, Calendar, Phone, User, RotateCcw } from 'lucide-react';
import { Member, SportType } from '../types';

interface MemberFormProps {
  member?: Member | null; // If provided, we are editing. Otherwise, creating.
  onSave: (memberData: any) => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sportType, setSportType] = useState<SportType>('Gym');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('1'); // "1" month, "3" months, "6" months, "12" months, "custom"
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  // Setup Form for editing or creating
  useEffect(() => {
    if (member) {
      setFullName(member.full_name);
      setPhone(member.phone);
      setSportType(member.sport_type);
      setStartDate(member.start_date);
      setEndDate(member.end_date);
      setDuration('custom');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setStartDate(todayStr);
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
      setError('يرجى كتابة الاسم الكامل للمشترك');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى كتابة رقم الهاتف للمشترك');
      return;
    }
    if (!startDate || !endDate) {
      setError('يرجى تحديد تواريخ الاشتراك والانتهاء صراحةً');
      return;
    }
    if (endDate < startDate) {
      setError('تاريخ انتهاء الاشتراك لا يمكن أن يكون قبل تاريخ البداية');
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      sport_type: sportType,
      start_date: startDate,
      end_date: endDate,
      ...(member ? { id: member.id, barcode_id: member.barcode_id, created_at: member.created_at, status: member.status } : {})
    };

    onSave(payload);
  };

  const sports: SportType[] = ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'];

  return (
    <div className="max-w-2xl mx-auto font-sans pb-10">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#222226]">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#8a8a93] hover:text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" /> العودة للقائمة
        </button>
        <h1 className="text-2xl font-extrabold text-white">
          {member ? 'تعديل بيانات المشترك' : 'إضافة مشترك جديد للمركز'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Main Carbon Card Container */}
      <form onSubmit={handleSubmit} className="border border-[#222226] bg-[#121214] rounded-3xl p-6 md:p-8 space-y-6 text-right">
        
        {/* Full Name field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            الاسم بالكامل للمشترك (Full Name)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد عبد الرحمن"
              className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 pr-11 pl-4 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Phone number field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            رقم الهاتف (Phone Number)
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 059xxxxxxxx"
              className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 pr-11 pl-4 text-left font-mono text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500">
              <Phone className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Sport Type select buttons (Bento box look) */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#c4c4c7] block">
            نوع الرياضة والاشتراك (Sport Type)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sports.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => setSportType(sport)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  sportType === sport
                    ? 'border-[#d2ff1f] bg-[#d2ff1f]/10 text-[#d2ff1f]'
                    : 'border-[#27272a] bg-[#18181b] text-[#8a8a93] hover:border-zinc-700 hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#222226]">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#c4c4c7] block">
              تاريخ بداية الاشتراك (Subscription Start)
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
              مدة الاشتراك / الباقة
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'شهر', value: '1' },
                { label: '٣ شهور', value: '3' },
                { label: '٦ شهور', value: '6' },
                { label: 'مخصص', value: 'custom' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
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
            تاريخ انتهاء الاشتراك (Subscription End)
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
          {duration !== 'custom' && (
            <p className="text-xs text-zinc-500 font-sans mt-1">
              * يتم الحساب والانتهاء تلقائياً بمقدار الباقة المحددة في الأعلى.
            </p>
          )}
        </div>

        {/* Member ID and Barcode Indicator Info if editing */}
        {member && (
          <div className="flex items-center justify-between border border-dashed border-[#27272a] rounded-xl p-4 bg-zinc-900/10 text-right">
            <span className="text-xs font-mono font-bold text-[#d2ff1f]">{member.barcode_id}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8a8a93]">الرمز والباركود الحالي للعضو</span>
              <Key className="h-4 w-4 text-[#8a8a93]" />
            </div>
          </div>
        )}

        {/* Save button actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#222226]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#27272a] hover:bg-[#1c1c1e] text-[#8a8a93] hover:text-white px-6 py-3 text-sm font-bold transition-all"
          >
            إلغاء
          </button>
          
          <button
            type="submit"
            className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-8 py-3 text-sm font-bold transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> حفظ المشترك
          </button>
        </div>

      </form>
    </div>
  );
}
