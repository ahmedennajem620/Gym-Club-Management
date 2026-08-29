import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Scan, CheckCircle2, History, Keyboard, Info, BellRing, Smartphone, Laptop, Award, Users, Dumbbell } from 'lucide-react';
import { Member, Coach, Attendance } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '../lib/i18n';

interface ScannerProps {
  members: Member[];
  coaches?: Coach[];
  onCheckIn: (barcodeId: string) => { success: boolean; message: string; attendance?: Attendance; personType?: 'member' | 'coach' };
  recentAttendance: Attendance[];
}

export default function Scanner({ members, coaches = [], onCheckIn, recentAttendance }: ScannerProps) {
  const { t, dir, formatSport } = useLanguage();
  const isRtl = dir === 'rtl';

  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; personType?: 'member' | 'coach' } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simTab, setSimTab] = useState<'members' | 'coaches'>('members');
  const laserRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Buffer state to accumulate hardware scanner inputs (keyboard emulation)
  const keyboardScannerBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

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
      message: result.message,
      personType: result.personType
    });
    
    playBeep(result.success);
    setManualInput('');

    // Clear alert outcome after 6 seconds to permit routine check-ins
    setTimeout(() => {
      setScanResult(null);
    }, 6000);
  };

  // 1. Compatibility with External Hardware Scanners (USB/Bluetooth devices simulating fast typing + Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Filter out if user is intentionally chatting, or typing in other native text inputs
      const isEditingNormalField = activeEl && 
        (activeEl.tagName === 'TEXTAREA' || 
         (activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type === 'text' && activeEl !== document.getElementById('manual-entry-scan-input')));

      const now = Date.now();
      // Hardware physical scanners dispatch keys extremely fast (usually < 30ms interval between keys)
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        // When Enter is keypressed, evaluate stored buffer contents
        const finalCode = keyboardScannerBufferRef.current.trim();
        if (finalCode.length > 2) {
          handleScanAction(finalCode);
          keyboardScannerBufferRef.current = '';
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        // Append characters to buffer
        if (!isEditingNormalField) {
          // If time gap is large, and we're not inside any inputs, still keep buffering but reset if stale
          if (timeDiff > 1200) {
            keyboardScannerBufferRef.current = '';
          }
          keyboardScannerBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [members]);

  // 2. Compatibility with Built-in Camera/Mobile Camera using html5-qrcode
  useEffect(() => {
    if (cameraActive) {
      setCameraError(null);
      // Wait for DOM container to render
      setTimeout(() => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          html5QrCodeRef.current = html5QrCode;

          html5QrCode.start(
            { facingMode: "environment" }, // Default to environments/back camera on phones
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.75;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              // On success scan
              handleScanAction(decodedText);
            },
            (errorMessage) => {
              // Standard verbose failures when no QR code found in video frame are ignored
            }
          ).catch((err) => {
            console.error("Camera startup error:", err);
            setCameraError(t.error + ": " + err);
            setCameraActive(false);
          });
        } catch (e: any) {
          setCameraError(e.message || t.error);
          setCameraActive(false);
        }
      }, 100);
    } else {
      stopCameraInstance();
    }

    return () => {
      stopCameraInstance();
    };
  }, [cameraActive]);

  const stopCameraInstance = () => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current = null;
        }).catch((err) => {
          console.error("Failed to stop QR camera stream safely:", err);
        });
      } else {
        html5QrCodeRef.current = null;
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanAction(manualInput);
  };

  return (
    <div className={`space-y-6 font-sans pb-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      {/* Page Header */}
      <div className="pb-4 border-b border-[#222226]">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Scan className="h-7 w-7 text-[#d2ff1f]" />
          <span>{t.scanner_title}</span>
        </h1>
        <p className="text-sm text-[#8a8a93] mt-1 font-sans">
          {t.scanner_subtitle}
        </p>
      </div>

      {/* Hardware Indicator banner */}
      <div className={`bg-[#121214] border border-[#222226] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${isRtl ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-white font-extrabold block">{t.scanner_manual_tab}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">● {t.active}</span>
          </div>
        </div>

        <div className="text-xs text-[#8a8a93] max-w-md leading-relaxed">
          <span className="font-bold text-white">{t.att_scanner_tips}:</span> {t.att_scanner_tips_desc}
        </div>
      </div>

      {/* Main Grid: Left Scanner Screen Frame, Right simulated cards panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Scanning Frame */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Visual Scanner HUD box */}
          <div className="relative overflow-hidden border border-[#222226] bg-[#0c0c0e] rounded-3xl p-6 text-center flex flex-col items-center justify-center min-h-[380px]">
            
            {/* Live Web/Mobile Camera View Finder Container */}
            {cameraActive ? (
              <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden relative border border-[#222226] bg-[#121214]">
                <div id="reader" className="w-full"></div>
                {cameraActive && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-[#d2ff1f] text-[10px] font-mono px-3 py-1.5 rounded-full z-10 font-bold">
                    {t.scanner_camera_tab}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 z-0 max-w-sm my-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#d2ff1f]/10 text-[#d2ff1f] animate-pulse">
                  <Scan className="h-8 w-8 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-white">{t.scanner_camera_tab}</h3>
                <p className="text-xs text-[#8a8a93] leading-relaxed">
                  {t.scanner_camera_instruction}
                </p>
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  className="mx-auto rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-6 py-2.5 text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-[#d2ff1f]/10 cursor-pointer"
                >
                  <Camera className="h-4 w-4" /> {t.scanner_camera_start}
                </button>
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl max-w-md mx-auto mt-2 text-center">
                ⚠️ {cameraError}
              </div>
            )}

            {/* Red Laser Sweeper Line when simulating/scanning */}
            {cameraActive && (
              <div 
                ref={laserRef}
                className="absolute left-0 w-full h-[2px] bg-red-400 shadow-[0_0_10px_#ef4444] animate-pulse z-10"
                style={{
                  top: '50%',
                  animationName: 'bounce',
                  animationDuration: '2.5s',
                  animationIterationCount: 'infinite'
                }}
              />
            )}

            {/* Camera Switcher to stop it and save battery */}
            {cameraActive && (
              <button
                onClick={() => setCameraActive(false)}
                className="mt-4 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs transition-colors cursor-pointer"
              >
                {t.scanner_camera_stop}
              </button>
            )}

            {/* Scan Outcome Alert Banner */}
            {scanResult && (
              <div className={`absolute inset-x-4 bottom-4 z-20 rounded-2xl border p-4 flex items-start gap-3 transition-all animate-bounce ${
                scanResult.success
                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                  : 'border-red-500/20 bg-red-500/10 text-red-400'
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
                    {scanResult.success ? t.success : t.error}
                  </h4>
                  <p className="text-xs leading-relaxed font-sans">{scanResult.message}</p>
                </div>
              </div>
            )}
          </div>
 
          {/* Quick manual typing input drawer */}
          <div className="border border-[#222226] bg-[#121214] rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <Keyboard className="h-4 w-4 text-[#8a8a93]" />
              <span>{t.scanner_manual_tab}</span>
            </h3>
            
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                id="manual-entry-scan-input"
                type="text"
                placeholder={t.scanner_manual_placeholder}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 text-left bg-[#18181b] border border-[#27272a] text-white rounded-xl py-2 px-4 focus:border-[#d2ff1f] focus:outline-none placeholder-zinc-600 font-mono text-xs"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black px-5 text-xs font-bold font-sans transition-all active:scale-[0.98] cursor-pointer"
              >
                {t.scanner_manual_submit}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Interactive simulation deck containing quick buttons */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{t.scanner_simulator_title}</h3>

              {/* Tabs Switcher */}
              <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSimTab('coaches')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    simTab === 'coaches' ? 'bg-purple-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Award className="h-3 w-3" />
                  <span>{t.coaches} ({coaches.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimTab('members')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    simTab === 'members' ? 'bg-[#d2ff1f] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3 w-3" />
                  <span>{t.members} ({members.length})</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#8a8a93] font-sans">
              {t.scanner_simulator_hint}
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {simTab === 'members' ? (
                members.length === 0 ? (
                  <div className="text-center py-6 text-zinc-600 text-xs">{t.members_empty}</div>
                ) : (
                  members.map((member) => {
                    const isActive = member.status === 'active';
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleScanAction(member.barcode_id || member.id)}
                        className="w-full relative flex items-center justify-between p-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#d2ff1f] hover:bg-[#1f1f23] transition-all group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{member.full_name}</p>
                          <p className="text-[9px] text-[#8a8a93] font-mono mt-1">{formatSport(member.sport_type)} • {member.barcode_id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-sans ${
                            isActive 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {isActive ? t.active : t.expired}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )
              ) : (
                coaches.length === 0 ? (
                  <div className="text-center py-6 text-zinc-600 text-xs">{t.coaches_empty}</div>
                ) : (
                  coaches.map((coach) => {
                    const isActive = coach.status === 'active';
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => handleScanAction(coach.barcode_id || coach.id)}
                        className="w-full relative flex items-center justify-between p-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-purple-400 hover:bg-[#1f1f23] transition-all group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-white leading-none flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-purple-400" />
                            <span>{coach.full_name}</span>
                          </p>
                          <p className="text-[9px] text-purple-400/80 font-mono mt-1">{formatSport(coach.specialty)} • {coach.barcode_id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-sans ${
                            isActive 
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isActive ? t.active : t.inactive}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Quick logs drawer inside scanner screen */}
          <div className="rounded-2xl border border-[#222226] bg-[#121214] p-5 space-y-3 shadow-lg">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <History className="h-4 w-4 text-[#8a8a93]" />
              <span>{t.scanner_recent_title}</span>
            </h3>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {recentAttendance.length === 0 ? (
                <p className="text-xs text-center text-zinc-600 py-3 font-sans">{t.dash_no_attendance_today}</p>
              ) : (
                recentAttendance.slice(0, 5).map((log) => {
                  const isCoach = log.person_type === 'coach' || log.member_id.startsWith('COA_');
                  return (
                    <div key={log.id} className="flex justify-between items-center text-xs border-b border-[#222226] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        {isCoach && (
                          <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {t.scanner_coach_badge}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-[#c4c4c7] line-clamp-1">{log.member_name}</p>
                          {log.sport_or_specialty && (
                            <p className="text-[10px] text-zinc-500 font-mono">{formatSport(log.sport_or_specialty)}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[#d2ff1f]">{log.checkin_time}</span>
                    </div>
                  );
                })
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


