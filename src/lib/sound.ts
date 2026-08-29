// Web Audio API helper for soft, subtle UI sound effects

let audioCtx: AudioContext | null = null;
let lastHoverTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a very soft, smooth, gentle micro-sound on hovering menu items
 */
export function playHoverSound() {
  try {
    const now = Date.now();
    // Throttle slightly so rapid cursor sweeps remain pleasant (40ms min gap)
    if (now - lastHoverTime < 45) return;
    lastHoverTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pleasant soft sine chime
    osc.type = 'sine';
    const currentTime = ctx.currentTime;

    // Gentle subtle pitch glide (850Hz -> 1050Hz) for an elegant modern tactile feel
    osc.frequency.setValueAtTime(820, currentTime);
    osc.frequency.exponentialRampToValueAtTime(1080, currentTime + 0.04);

    // Very soft volume (0.028) with fast smooth exponential release
    gain.gain.setValueAtTime(0.028, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + 0.05);
  } catch {
    // Ignore audio permission or playback restrictions
  }
}
