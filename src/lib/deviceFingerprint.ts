/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceInfo {
  device_uuid: string;
  device_type: 'windows' | 'mobile' | 'desktop';
  platform_name: string;
  os_name: string;
  browser_name: string;
  screen_resolution: string;
  hardware_concurrency: number;
  user_agent: string;
  generated_at: string;
}

const STORAGE_KEY_DEVICE_UUID = 'gymflow_device_uuid_v1';

/**
 * Generate a deterministic hash from a string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Generate a subtle Canvas Fingerprint for hardware identification
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'NO_CANVAS_CTX';

    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('GymFlow-HardwareID', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('GymFlow-HardwareID', 4, 17);

    return hashString(canvas.toDataURL());
  } catch {
    return 'CANVAS_DISABLED';
  }
}

/**
 * Detect Operating System and Hardware Platform
 */
export function detectPlatform(): { type: 'windows' | 'mobile' | 'desktop'; os: string; platformName: string } {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const platform = typeof navigator !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform || '' : '';
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent) ||
                   (typeof window !== 'undefined' && window.innerWidth <= 768 && 'ontouchstart' in window);
  
  const isWindows = /Windows|Win32|Win64|WOW64/i.test(userAgent) || /Win/i.test(platform);
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent) || /Mac/i.test(platform);
  const isLinux = /Linux/i.test(userAgent) && !/Android/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  let os = 'Unknown OS';
  if (isWindows) os = 'Windows PC';
  else if (isAndroid) os = 'Android Mobile';
  else if (isIOS) os = 'Apple iOS';
  else if (isMac) os = 'macOS';
  else if (isLinux) os = 'Linux';
  else if (isMobile) os = 'Mobile Device';

  if (isMobile || isAndroid || isIOS) {
    return { type: 'mobile', os, platformName: `📱 ${os}` };
  } else if (isWindows) {
    return { type: 'windows', os, platformName: `💻 ${os}` };
  } else {
    return { type: 'desktop', os, platformName: `💻 ${os}` };
  }
}

/**
 * Retrieve or generate a persistent Device UUID / Hardware Fingerprint
 */
export function getOrCreateDeviceUUID(): DeviceInfo {
  let cachedUUID = '';
  try {
    cachedUUID = localStorage.getItem(STORAGE_KEY_DEVICE_UUID) || '';
  } catch {
    // Fallback if storage blocked
  }

  const { type, os, platformName } = detectPlatform();
  const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
  const hwConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const canvasHash = getCanvasFingerprint();
  const rawUA = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // Generate hardware seed
  const hardwareSeed = `${os}_${screenRes}_${hwConcurrency}_${canvasHash}`;
  const hwHash = hashString(hardwareSeed);

  let deviceUUID = cachedUUID;
  if (!deviceUUID) {
    const prefix = type === 'windows' ? 'WIN-HW' : type === 'mobile' ? 'MOB-HW' : 'DSK-HW';
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    deviceUUID = `${prefix}-${hwHash.substring(0, 4)}-${hwHash.substring(4, 8)}-${randomPart}`;
    
    try {
      localStorage.setItem(STORAGE_KEY_DEVICE_UUID, deviceUUID);
    } catch {
      // Ignored
    }
  }

  // Browser name detection
  let browser = 'Browser';
  if (/Chrome/i.test(rawUA) && !/Edg/i.test(rawUA)) browser = 'Google Chrome';
  else if (/Safari/i.test(rawUA) && !/Chrome/i.test(rawUA)) browser = 'Safari';
  else if (/Edg/i.test(rawUA)) browser = 'Microsoft Edge';
  else if (/Firefox/i.test(rawUA)) browser = 'Mozilla Firefox';

  return {
    device_uuid: deviceUUID,
    device_type: type,
    platform_name: platformName,
    os_name: os,
    browser_name: browser,
    screen_resolution: screenRes,
    hardware_concurrency: hwConcurrency,
    user_agent: rawUA,
    generated_at: new Date().toISOString()
  };
}

/**
 * Reset local device UUID (For debug or explicit re-pairing)
 */
export function resetLocalDeviceUUID(): string {
  try {
    localStorage.removeItem(STORAGE_KEY_DEVICE_UUID);
  } catch {}
  return getOrCreateDeviceUUID().device_uuid;
}
