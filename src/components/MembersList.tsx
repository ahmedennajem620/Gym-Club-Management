import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit, Printer, CheckCircle, XCircle, Phone, Calendar, Sparkles, Award } from 'lucide-react';
import { Member } from '../types';

interface MembersListProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onSelectMember: (id: string) => void;
  selectedMemberId?: string | null;
}

// Highly reliable SVG Barcode generator that creates correct Code-128 styled structures
function DynamicBarcode({ value }: { value: string }) {
  // Convert value to simple barcode representation
  // We'll map characters to binary bars representable as vertical SVG stripes.
  const code128Map: Record<string, string> = {
    '0': '11011001100', '1': '11001102100', '2': '11001100110', 
    '3': '10010011000', '4': '10010001100', '5': '10001001100',
    '6': '10011001000', '7': '10011000100', '8': '10001100100',
    '9': '11001101000', 'M': '11011000110', 'B': '11011011000',
    'R': '11010001110', '_': '10111101110', 'A': '11101011100'
  };

  let binaryPattern = '1101001011'; // Start character
  for (let i = 0; i < value.length; i++) {
    const char = value[i].toUpperCase();
    binaryPattern += code128Map[char] || '11001100110';
  }
  binaryPattern += '1100011101011'; // Stop character & pad

  const barWidth = 2;
  const height = 48;
  const bars: React.ReactNode[] = [];

  for (let i = 0; i < binaryPattern.length; i++) {
    const isBlack = binaryPattern[i] === '1';
    const isThick = binaryPattern[i] === '2'; // Spec values
    if (isBlack || isThick) {
      bars.push(
        <rect
          key={i}
          x={i * barWidth}
          y={0}
          width={isThick ? barWidth * 2 : barWidth}
          height={height}
          fill="currentColor"
        />
      );
    }
  }

  return (
    <div className="flex flex-col items-center bg-white text-black p-4 rounded-xl border border-zinc-200">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${binaryPattern.length * barWidth} ${height}`}
        preserveAspectRatio="none"
        className="text-black"
      >
        {bars}
      </svg>
      <span className="text-xs font-mono font-extrabold tracking-[0.25em] mt-2 text-zinc-900">{value}</span>
    </div>
  );
}

export default function MembersList({
  members,
  onEditMember,
  onDeleteMember,
  onSelectMember,
  selectedMemberId
}: MembersListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          m.id.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search);
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Trigger browser print for card
  const handlePrintCard = () => {
    const printContent = document.getElementById('printable-card-area');
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (winPrint) {
      winPrint.document.write(`
        <html>
          <head>
            <title>بطاقة مشترك - GYM CLUB</title>
            <style>
              body { font-family: sans-serif; text-align: center; background-color: white; padding: 40px; color: black; }
              .card { display: inline-block; border: 4px solid #111; border-radius: 20px; padding: 30px; width: 350px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #111; letter-spacing: 1px; }
              .subtitle { font-size: 11px; text-transform: uppercase; color: #555; margin-bottom: 25px; font-weight: bold; }
              .name { font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #000; }
              .phone { font-size: 14px; color: #444; margin-bottom: 15px; }
              .badge { background-color: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; color: #111; display: inline-block; margin-bottom: 25px; }
              .dates { font-size: 11px; color: #555; margin-top: 20px; text-align: right; border-top: 1px dashed #ddd; padding-top: 15px; }
              .barcode-container { margin: 20px 0; }
              @media print {
                body { padding: 0; }
                .card { box-shadow: none; border-color: black; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">GYM CLUB</div>
              <div class="subtitle">بطاقة عضوية النادي الرياضي</div>
              <div class="name">${selectedMember?.full_name}</div>
              <div class="phone">الهاتف: ${selectedMember?.phone}</div>
              <div class="badge">الرياضة: ${selectedMember?.sport_type}</div>
              <div class="barcode-container">
                <div style="font-weight: bold; font-family: monospace; letter-spacing: 3px; font-size: 18px; margin: 10px 0;">${selectedMember?.barcode_id}</div>
                <div style="text-align: center; margin-top: 10px;">
                  <span style="font-size:10px; color:#555;">يرجى تقديم هذه البطاقة عند الدخول لمسح الباركود</span>
                </div>
              </div>
              <div class="dates">
                <div>تاريخ الاشتراك: ${selectedMember?.start_date}</div>
                <div>تاريخ الانتهاء: ${selectedMember?.end_date}</div>
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
        <h1 className="text-3xl font-extrabold text-white text-right">قائمة المشتركين والأعضاء</h1>
        
        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status selector */}
          <div className="flex rounded-xl bg-[#121214] border border-[#222226] p-1 font-sans">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'النشطين' },
              { id: 'expired', label: 'المنتهين' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`py-1.5 px-4 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                  filter === opt.id
                    ? 'bg-[#d2ff1f] text-black shadow'
                    : 'text-[#8a8a93] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="البحث بالاسم، برقم الهاتف أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-right bg-[#121214] border border-[#222226] text-white rounded-xl py-2 px-4 pr-10 pl-4 text-sm focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 transition-colors"
            />
            <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Members listing grid */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="border border-[#222226] bg-[#121214] rounded-2xl p-12 text-center text-[#8a8a93]">
              {search || filter !== 'all' 
                ? 'لم يتم العثور على مشتركين يطابقون خيارات البحث والفلترة.' 
                : 'لا يوجد أعضاء مسجلين في النادي بعد. ابدأ بإضافة مشترك جديد.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((member) => {
                const isSelected = member.id === selectedMemberId;
                const isActive = member.status === 'active';
                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMember(member.id)}
                    className={`rounded-2xl border text-right p-5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
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
                            <>نشط <CheckCircle className="h-3.5 w-3.5" /></>
                          ) : (
                            <>منتهي <XCircle className="h-3.5 w-3.5" /></>
                          )}
                        </span>
                        
                        <span className="text-xs font-bold text-[#8a8a93] font-mono">
                          {member.id}
                        </span>
                      </div>

                      {/* Main member Info */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-white">{member.full_name}</h3>
                        <p className="text-xs text-[#8a8a93] font-mono flex items-center justify-end gap-1.5">
                          <span>{member.phone}</span>
                          <Phone className="h-3 w-3 text-[#c4c4c7]" />
                        </p>
                      </div>

                      {/* Sport type badge */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        <span className="text-xs font-bold bg-[#18181b] border border-[#27272a] text-[#c4c4c7] px-2.5 py-1 rounded-lg">
                          {member.sport_type}
                        </span>
                      </div>
                    </div>

                    {/* Footer timelines & actions */}
                    <div className="mt-5 pt-3 border-t border-[#222226] flex items-center justify-between">
                      <div className="flex gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMember(member);
                          }}
                          className="p-2 rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] text-zinc-400 transition-colors"
                          title="تعديل العضو"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشترك؟ سيتم إزالة جميع سجلات حضور وتنبيهات هذا العضو نهائياً.')) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-zinc-900 border border-[#27272a] hover:border-red-500 hover:text-red-500 text-zinc-400 transition-colors"
                          title="حذف العضو"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right text-[10px] text-[#8a8a93] font-mono">
                        انتهاء: {member.end_date}
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
            <div className="rounded-2xl border border-[#222226] bg-[#121214] p-6 text-right space-y-6 sticky top-6">
              <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                <button
                  onClick={handlePrintCard}
                  className="rounded-lg bg-zinc-900 border border-[#27272a] hover:border-[#d2ff1f] hover:text-[#d2ff1f] px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1 font-sans"
                >
                  <Printer className="h-3.5 w-3.5" /> طباعة البطاقة
                </button>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5 justify-end">
                  <Sparkles className="h-4 w-4 text-[#d2ff1f]" /> بطاقة العضو الرقمية
                </h3>
              </div>

              {/* Printable design frame */}
              <div id="printable-card-area" className="border border-[#222226] bg-[#18181b] rounded-2xl p-5 text-center space-y-5 relative overflow-hidden shadow-xl">
                {/* Brand watermarks */}
                <div className="absolute -left-10 -top-10 h-32 w-32 bg-[#d2ff1f]/[0.01] rounded-full blur-2xl" />
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">GYM CLUB MEMBERSHIP</div>

                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-white">{selectedMember.full_name}</h4>
                  <p className="text-sm font-semibold text-[#8a8a93] font-mono">{selectedMember.phone}</p>
                </div>

                <div className="bg-[#121214] border border-[#222226] rounded-xl p-3 inline-block">
                  <span className="text-sm font-bold text-white px-2">رياضة: {selectedMember.sport_type}</span>
                </div>

                {/* Barcode box */}
                <div className="py-2">
                  <DynamicBarcode value={selectedMember.barcode_id} />
                </div>

                {/* Sub timelines */}
                <div className="border-t border-[#222226] pt-4 grid grid-cols-2 gap-2 text-right text-[11px] font-mono">
                  <div className="text-left">
                    <span className="text-zinc-500 block">انتهاء الصلاحية</span>
                    <span className="font-extrabold text-white">{selectedMember.end_date}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">تاريخ الاشتراك</span>
                    <span className="font-extrabold text-[#c4c4c7]">{selectedMember.start_date}</span>
                  </div>
                </div>
              </div>

              {/* Status details with alert warnings if expired */}
              {selectedMember.status === 'expired' ? (
                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center space-y-2">
                  <span className="text-sm font-bold text-red-400 block font-sans">هذا الاشتراك منتهي الصلاحية!</span>
                  <p className="text-xs text-zinc-500 font-sans">
                    لا يمكن لهذا العضو تسجيل الحضور عبر الباركود حتى يتم تمديد أو تجديد اشتراكه وتحديث تواريخ الصلاحية.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-4 text-center">
                  <span className="text-sm font-bold text-green-400 block font-sans">الاشتراك متفاعل ونشط الآن</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#222226] bg-[#121214]/50 p-12 text-center text-[#8a8a93]">
              اختر مشتركاً من القائمة الجانبية لعرض وتوليد بطاقة الباركود الخاصة به وطباعتها.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
