import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Scan, CheckCircle2, History, Keyboard, Info, BellRing } from 'lucide-react';
import { Member, Attendance } from '../types';

interface ScannerProps {
  members: Member[];
  onCheckIn: (barcodeId: string) => { success: boolean; message: string; attendance?: Attendance };
  recentAttendance: Attendance[];
}

export default function Scanner({ members, onCheckIn, recentAttendance }: ScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const laserRef = useRef<HTMLDivElement>(null);

  // Audio beep feedback simulator
  const playBeep = (isSuccess: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch beep
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio feedback not allowed by user interaction yet:', e);
    }
  };

  const handleScanAction = (barcodeId: string) => {
    if (!barcodeId.trim()) return;
    
    // Process Check-In
    const result = onCheckIn(barcodeId.trim());
    setScanResult({
      success: result.success,
      message: result.message
    });
    
    playBeep(result.success);
    setManualInput('');

    // Clear alert outcome after 5 seconds to permit routine check-ins
    setTimeout(() => {
      setScanResult(null);
    }, 6000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanAction(manualInput);
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Page Header */}
      <div className="text-right pb-4 border-b border-[#222226]">
        <h1 className="text-3xl font-extrabold text-white">ماسح الباركود وجهاز تسجيل الحضور</h1>
        <p className="text-sm text-[#8a8a93] mt-1 font-sans">
          قم بمسح باركود العضو اللاسلكي أو حدده يدوياً لمحاكاة مسح الكود وتسجيل الدخول الفوري بنجاح
        </p>
      </div>

      {/* Main Grid: Left Scanner Screen Frame, Right simulated cards panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: The main scanning frame with red laser line */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Visual Scanner HUD box */}
          <div className="relative overflow-hidden border border-[#222226] bg-[#121214] rounded-3xl p-6 text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
            
            {/* Red Laser Sweeper Line when simulating */}
            {isSimulatingCamera && (
              <div 
                ref={laserRef}
                className="absolute left-0 w-full h-[3px] bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse z-10"
                style={{
                  top: '50%',
                  animationName: 'bounce',
                  animationDuration: '3s',
                  animationIterationCount: 'infinite'
                }}
              />
            )}

            {/* Glowing Scan Target borders */}
            <div className="absolute top-8 left-8 h-8 w-8 border-t-4 border-l-4 border-[#d2ff1f] rounded-tl-lg" />
            <div className="absolute top-8 right-8 h-8 w-8 border-t-4 border-r-4 border-[#d2ff1f] rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 h-8 w-8 border-b-4 border-l-4 border-[#d2ff1f] rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 h-8 w-8 border-b-4 border-r-4 border-[#d2ff1f] rounded-br-lg" />

            {/* Simulated Live View Finder Graphic */}
            <div className="space-y-3 z-0">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#d2ff1f]/10 text-[#d2ff1f] animate-pulse">
                <Scan className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">بث الكاميرا الافتراضي وقارئ الباركود</h3>
              <p className="text-xs text-[#8a8a93] max-w-sm mx-auto">
                يرجى توجيه بطاقة الباركود الخاصة بالعضو إلى الكاميرا بشكل مستوٍ أو تحديد العضو المراد مسح بطاقته من القائمة الجانبية للتجربة الفورية.
              </p>
            </div>

            {/* Scan Outcome Alert Banner */}
            {scanResult && (
              <div className={`absolute inset-x-4 bottom-4 z-20 rounded-2xl border p-4 text-right flex items-start gap-3 transition-all animate-bounce ${
                scanResult.success
                  ? 'border-green-500/20 bg-green-500/5 text-green-400'
                  : 'border-red-500/20 bg-red-500/5 text-red-500'
              }`}>
                <div className="p-1">
                  {scanResult.success ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 shrink-0" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-sm font-sans">
                    {scanResult.success ? 'تم تسجيل الحضور بنجاح' : 'تنبيه: عجز في تسجيل الحضور'}
                  </h4>
                  <p className="text-xs leading-relaxed font-sans">{scanResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick keyboard typing input drawer */}
          <div className="border border-[#222226] bg-[#121214] rounded-2xl p-4 text-right">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 justify-end">
              <span>إدخال يدوي لرقم المشترك</span>
              <Keyboard className="h-4 w-4 text-[#8a8a93]" />
            </h3>
            
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-5 text-xs font-bold font-sans transition-all active:scale-[0.98]"
              >
                مسح وتثبيت
              </button>
              
              <input
                type="text"
                placeholder="مثال: MBR_10025"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 text-left bg-[#18181b] border border-[#27272a] text-white rounded-xl py-2 px-4 focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 font-mono text-xs"
              />
            </form>
          </div>
        </div>

        {/* Right 1 Column: Interactive simulation deck containing quick buttons with Active / Expired indicators */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 text-right space-y-4">
            <h3 className="text-sm font-extrabold text-white mb-1">لوحة المحاكاة وتجربة المسح</h3>
            <p className="text-xs text-[#8a8a93] font-sans">
              اضغط على أي مشترك في الأسفل لإجراء عملية مسح رمز الباركود الخاص به تلقائياً والتحقق من حالته (نشطة أو منتهية):
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {members.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 text-xs">لا يوجد أعضاء في قاعدة البيانات للمحاكاة</div>
              ) : (
                members.map((member) => {
                  const isActive = member.status === 'active';
                  return (
                    <button
                      key={member.id}
                      onClick={() => handleScanAction(member.id)}
                      className="w-full relative flex items-center justify-between p-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#d2ff1f] hover:bg-[#1f1f23] transition-all text-right group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-sans ${
                          isActive 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isActive ? 'نشط' : 'منتهي'}
                        </span>
                        
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-white transition-colors">
                          اضغط للمسح
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-bold text-white leading-none">{member.full_name}</p>
                        <p className="text-[9px] text-[#8a8a93] font-mono mt-1">{member.sport_type} • {member.id}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick logs drawer inside scanner screen */}
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 text-right space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 justify-end">
              <span>آخر عمليات الحضور اليوم</span>
              <History className="h-4 w-4 text-[#8a8a93]" />
            </h3>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {recentAttendance.length === 0 ? (
                <p className="text-xs text-center text-zinc-600 py-3 font-sans">لا توجد سجلات لليوم بعد</p>
              ) : (
                recentAttendance.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-xs border-b border-[#222226] pb-2 last:border-0 last:pb-0">
                    <span className="font-mono text-[#d2ff1f]">{log.checkin_time}</span>
                    <div className="text-right">
                      <p className="font-semibold text-[#c4c4c7] line-clamp-1">{log.member_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Styled bouncy animations markup for laser scanner */}
      <style>{`
        @keyframes bounce {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
}
