import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Eye, 
  EyeOff, 
  Mail, 
  Building2, 
  Smartphone, 
  X, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Laptop, 
  RefreshCw, 
  MessageCircle, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { GymStore } from '../services/store';
import { useLanguage } from '../lib/i18n';
import LanguageSelector from './LanguageSelector';
import { getOrCreateDeviceUUID, DeviceInfo } from '../lib/deviceFingerprint';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
}

// Global list of supported country codes with flag emojis, descriptive names, local placeholders & standard lengths
const COUNTRY_CODES = [
  { code: '+212', flag: '🇲🇦', name: 'المملكة المغربية', shortName: 'المغرب', placeholder: '612345678', length: 9 },
  { code: '+966', flag: '🇸🇦', name: 'المملكة العربية السعودية', shortName: 'السعودية', placeholder: '599123456', length: 9 },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات العربية المتحدة', shortName: 'الإمارات', placeholder: '501234567', length: 9 },
  { code: '+20', flag: '🇪🇬', name: 'جمهورية مصر العربية', shortName: 'مصر', placeholder: '1012345678', length: 10 },
  { code: '+962', flag: '🇯🇴', name: 'المملكة الأردنية الهاشمية', shortName: 'الأردن', placeholder: '791234567', length: 9 },
  { code: '+965', flag: '🇰🇼', name: 'دولة الكويت', shortName: 'الكويت', placeholder: '51234567', length: 8 },
  { code: '+974', flag: '🇶🇦', name: 'دولة قطر', shortName: 'قطر', placeholder: '55123456', length: 8 },
  { code: '+973', flag: '🇧🇭', name: 'مملكة البحرين', shortName: 'البحرين', placeholder: '31234567', length: 8 },
  { code: '+968', flag: '🇴🇲', name: 'سلطنة عمان', shortName: 'عمان', placeholder: '91234567', length: 8 },
  { code: '+213', flag: '🇩🇿', name: 'الجمهورية الجزائرية', shortName: 'الجزائر', placeholder: '512345678', length: 9 },
  { code: '+216', flag: '🇹🇳', name: 'الجمهورية التونسية', shortName: 'تونس', placeholder: '21234567', length: 8 },
  { code: '+964', flag: '🇮🇶', name: 'جمهورية العراق', shortName: 'العراق', placeholder: '7701234567', length: 10 },
  { code: '+961', flag: '🇱🇧', name: 'الجمهورية اللبنانية', shortName: 'لبنان', placeholder: '3123456', length: 7 },
  { code: '+963', flag: '🇸🇾', name: 'الجمهورية العربية السورية', shortName: 'سوريا', placeholder: '912345678', length: 9 },
  { code: '+970', flag: '🇵🇸', name: 'دولة فلسطين', shortName: 'فلسطين', placeholder: '591234567', length: 9 },
  { code: '+249', flag: '🇸🇩', name: 'جمهورية السودان', shortName: 'السودان', placeholder: '912345678', length: 9 },
  { code: '+218', flag: '🇱🇾', name: 'دولة ليبيا', shortName: 'ليبيا', placeholder: '912345678', length: 9 },
  { code: '+967', flag: '🇾🇪', name: 'الجمهورية اليمنية', shortName: 'اليمن', placeholder: '712345678', length: 9 },
];

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { language: lang, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubWhatsapp, setClubWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Field validation flags
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Country & phone states (silently auto-detected in background)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Device Binding State
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo>(getOrCreateDeviceUUID());
  const [deviceMismatchData, setDeviceMismatchData] = useState<{
    boundDeviceId: string;
    attemptedDeviceId: string;
    deviceType: 'windows' | 'mobile' | 'desktop';
    email: string;
  } | null>(null);
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isUnbindingLoading, setIsUnbindingLoading] = useState(false);

  // Initialize remembered credentials if saved
  useEffect(() => {
    setCurrentDevice(getOrCreateDeviceUUID());
    const remembered = GymStore.getRememberedCredentials();
    if (remembered && remembered.email) {
      setEmail(remembered.email);
      setRememberMe(true);
    }
  }, []);

  const handlePhoneDigitsChange = (digits: string) => {
    const cleanDigits = digits.replace(/\D/g, '');
    setPhoneDigits(cleanDigits);
    setClubWhatsapp(selectedCountry.code + cleanDigits);
  };

  const handleCountryChange = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setClubWhatsapp(country.code + phoneDigits);
  };

  // Auto-detect timezone/country silently on initial mount
  useEffect(() => {
    function getFlagEmoji(countryCode: string) {
      try {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
      } catch {
        return '';
      }
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let country: typeof COUNTRY_CODES[0] | undefined;

      if (tz.includes('Casablanca')) country = COUNTRY_CODES.find((c) => c.code === '+212');
      else if (tz.includes('Riyadh')) country = COUNTRY_CODES.find((c) => c.code === '+966');
      else if (tz.includes('Dubai')) country = COUNTRY_CODES.find((c) => c.code === '+971');
      else if (tz.includes('Cairo')) country = COUNTRY_CODES.find((c) => c.code === '+20');
      else if (tz.includes('Amman')) country = COUNTRY_CODES.find((c) => c.code === '+962');
      else if (tz.includes('Kuwait')) country = COUNTRY_CODES.find((c) => c.code === '+965');
      else if (tz.includes('Qatar')) country = COUNTRY_CODES.find((c) => c.code === '+974');
      else if (tz.includes('Bahrain')) country = COUNTRY_CODES.find((c) => c.code === '+973');
      else if (tz.includes('Muscat')) country = COUNTRY_CODES.find((c) => c.code === '+968');
      else if (tz.includes('Algiers')) country = COUNTRY_CODES.find((c) => c.code === '+213');
      else if (tz.includes('Tunis')) country = COUNTRY_CODES.find((c) => c.code === '+216');
      else if (tz.includes('Baghdad')) country = COUNTRY_CODES.find((c) => c.code === '+964');
      else if (tz.includes('Beirut')) country = COUNTRY_CODES.find((c) => c.code === '+961');
      else if (tz.includes('Damascus')) country = COUNTRY_CODES.find((c) => c.code === '+963');
      else if (tz.includes('Gaza') || tz.includes('Hebron')) country = COUNTRY_CODES.find((c) => c.code === '+970');
      else if (tz.includes('Khartoum')) country = COUNTRY_CODES.find((c) => c.code === '+249');
      else if (tz.includes('Tripoli')) country = COUNTRY_CODES.find((c) => c.code === '+218');
      else if (tz.includes('Aden')) country = COUNTRY_CODES.find((c) => c.code === '+967');

      if (country) {
        setSelectedCountry(country);
      }
    } catch {
      // Fallback silently
    }

    fetch('https://ipapi.co/json/')
      .then((res) => {
        if (!res.ok) throw new Error('Geo fetch error');
        return res.json();
      })
      .then((data) => {
        if (data && (data.country_code || data.country_calling_code)) {
          const apiCc = data.country_code ? data.country_code.toLowerCase() : '';
          const apiCall = data.country_calling_code ? data.country_calling_code : '';

          const match = COUNTRY_CODES.find((c) => {
            const cleanCode = c.code.replace('+', '');
            const cleanApiCall = apiCall.replace('+', '');
            return (
              (apiCc && c.flag && c.flag === getFlagEmoji(apiCc.toUpperCase())) ||
              (cleanApiCall && cleanCode === cleanApiCall) ||
              (apiCc && c.name.includes(apiCc))
            );
          });

          if (match) {
            setSelectedCountry(match);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Translations with support for Arabic, French, English and Spanish
  const t = {
    brandBadge: 'GymFlow',
    title: isRegister 
      ? (lang === 'ar' ? 'إنشاء حساب جديد' : lang === 'fr' ? 'Créer un compte' : lang === 'es' ? 'Crear Cuenta Nueva' : 'Create New Account') 
      : (lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : lang === 'es' ? 'Iniciar Sesión' : 'Sign In'),
    subtitle: isRegister 
      ? (lang === 'ar' ? 'أنشئ حساب ناديك الرياضي على GymFlow وابدأ الإدارة فوراً بدون تعقيد' : lang === 'fr' ? 'Créez votre club sur GymFlow et commencez immédiatement' : lang === 'es' ? 'Cree la cuenta de su club en GymFlow y empiece a gestionar al instante' : 'Set up your gym club on GymFlow and start managing immediately') 
      : (lang === 'ar' ? 'لوحة التحكم والإدارة الذكية للنادي الرياضي • GymFlow' : lang === 'fr' ? 'Panneau de contrôle et de gestion du club • GymFlow' : lang === 'es' ? 'Panel de Control y Gestión del Club • GymFlow' : 'GymFlow Management & Control Portal'),
    tabLogin: lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : lang === 'es' ? 'Iniciar Sesión' : 'Sign In',
    tabRegister: lang === 'ar' ? 'تسجيل جديد' : lang === 'fr' ? 'Inscription' : lang === 'es' ? 'Registro' : 'Register',
    clubNameLabel: lang === 'ar' ? 'اسم النادي الرياضي' : lang === 'fr' ? 'Nom du club de sport' : lang === 'es' ? 'Nombre del Club Deportivo' : 'Gym Club Name',
    clubNamePlaceholder: lang === 'ar' ? 'مثال: فتنس أوليمبيا جيم' : lang === 'fr' ? 'Ex: Fitness Olympia Gym' : lang === 'es' ? 'Ej: Fitness Olympia Gym' : 'e.g. Olympia Fitness Gym',
    clubWhatsappLabel: lang === 'ar' ? 'رقم الواتساب للتواصل والبطاقات' : lang === 'fr' ? 'Numéro WhatsApp de contact' : lang === 'es' ? 'Número de WhatsApp de Contacto' : 'WhatsApp Contact Number',
    emailLabel: lang === 'ar' ? 'البريد الإلكتروني' : lang === 'fr' ? 'Adresse e-mail' : lang === 'es' ? 'Correo Electrónico' : 'Email Address',
    emailPlaceholder: 'admin@yourclub.com',
    passwordLabel: lang === 'ar' ? 'كلمة المرور' : lang === 'fr' ? 'Mot de passe' : lang === 'es' ? 'Contraseña' : 'Password',
    passwordPlaceholder: lang === 'ar' ? '•••••••• (6 خانات أو أكثر)' : lang === 'fr' ? '•••••••• (6 caractères ou plus)' : lang === 'es' ? '•••••••• (6 o más caracteres)' : '•••••••• (6+ characters)',
    forgotPassword: lang === 'ar' ? 'نسيت كلمة المرور؟' : lang === 'fr' ? 'Mot de passe oublié ?' : lang === 'es' ? '¿Olvidó su contraseña?' : 'Forgot password?',
    rememberMeLabel: lang === 'ar' ? 'تذكرني على هذا الجهاز (حفظ الجلسة)' : lang === 'fr' ? 'Se souvenir de moi sur cet appareil' : lang === 'es' ? 'Recordarme en este dispositivo' : 'Remember me on this device',
    btnSubmit: isRegister 
      ? (lang === 'ar' ? 'إنشاء الحساب والدخول للوحة التحكم 🚀' : lang === 'fr' ? 'Créer & Accéder au Tableau de Bord 🚀' : lang === 'es' ? 'Crear Cuenta y Abrir Panel 🚀' : 'Create Account & Open Dashboard 🚀') 
      : (lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Se connecter' : lang === 'es' ? 'Iniciar Sesión' : 'Sign In'),
    entered: lang === 'ar' ? 'المدخل:' : lang === 'fr' ? 'Saisi :' : lang === 'es' ? 'Ingresado:' : 'Entered:',
    perfect: lang === 'ar' ? '✅ متطابق' : lang === 'fr' ? '✅ Conforme' : lang === 'es' ? '✅ Válido' : '✅ Valid',
    flagDropdownTitle: lang === 'ar' ? 'اختر الدولة ومفتاح الاتصال:' : lang === 'fr' ? 'Sélectionnez le pays :' : lang === 'es' ? 'Seleccionar país y prefijo:' : 'Select Country & Calling Code:',
    errorEmptyClub: lang === 'ar' ? 'يرجى كتابة اسم النادي الرياضي.' : lang === 'fr' ? 'Veuillez renseigner le nom du club.' : lang === 'es' ? 'Por favor ingrese el nombre del club.' : 'Please enter club name.',
    errorEmptyEmail: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : lang === 'fr' ? 'Veuillez saisir votre adresse e-mail.' : lang === 'es' ? 'Por favor ingrese su correo electrónico.' : 'Please enter your email.',
    errorInvalidEmail: lang === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة.' : lang === 'fr' ? 'Format d\'e-mail invalide.' : lang === 'es' ? 'Formato de correo inválido.' : 'Invalid email format.',
    errorEmptyPassword: lang === 'ar' ? 'يرجى إدخال كلمة المرور.' : lang === 'fr' ? 'Veuillez saisir votre mot de passe.' : lang === 'es' ? 'Por favor ingrese la contraseña.' : 'Please enter password.',
    errorShortPassword: lang === 'ar' ? 'كلمة المرور يجب ألا تقل عن 6 خانات.' : lang === 'fr' ? 'Le mot de passe doit comporter au moins 6 caractères.' : lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.',
    errorLength: (name: string, exp: number, got: number) => lang === 'ar'
      ? `رقم الواتساب غير مطابق لمعيار ${name} (${exp} أرقام). أدخلت ${got} أرقام.`
      : lang === 'fr'
        ? `Le numéro doit comporter ${exp} chiffres pour ${name} (saisi : ${got}).`
        : lang === 'es'
          ? `El número debe tener ${exp} dígitos para ${name} (ingresó: ${got}).`
          : `Phone number must be ${exp} digits for ${name} (entered: ${got}).`,
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError(t.errorInvalidEmail);
      return;
    }

    if (forgotNewPassword && forgotNewPassword.length < 6) {
      setForgotError(t.errorShortPassword);
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      const result = GymStore.resetPassword(cleanEmail, forgotNewPassword || undefined);
      setForgotLoading(false);

      if (result.success) {
        setForgotSuccess(
          lang === 'ar'
            ? `تم بنجاح! تم تعيين كلمة المرور الجديدة: (${result.tempPassword}). يمكنك استخدامها للدخول الآن.`
            : lang === 'fr'
              ? `Succès ! Nouveau mot de passe : (${result.tempPassword}). Vous pouvez vous connecter.`
              : lang === 'es'
                ? `¡Éxito! Nueva contraseña asignada: (${result.tempPassword}). Ya puede iniciar sesión.`
                : `Success! New password set: (${result.tempPassword}). You can sign in now.`
        );
        // Pre-fill login credentials for extreme convenience
        setEmail(cleanEmail);
        if (result.tempPassword) {
          setPassword(result.tempPassword);
        }
      } else {
        setForgotError(result.message || (lang === 'ar' ? 'تعذر العثور على هذا البريد.' : lang === 'fr' ? 'E-mail introuvable.' : lang === 'es' ? 'Correo no encontrado.' : 'Email address not found.'));
      }
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Mark fields touched
    setTouched({ email: true, password: true, clubName: true, phone: true });

    if (!cleanEmail) {
      setError(t.errorEmptyEmail);
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t.errorInvalidEmail);
      return;
    }

    if (!cleanPassword) {
      setError(t.errorEmptyPassword);
      return;
    }

    if (cleanPassword.length < 6) {
      setError(t.errorShortPassword);
      return;
    }

    if (isRegister) {
      if (!clubName.trim()) {
        setError(t.errorEmptyClub);
        return;
      }
      if (phoneDigits.length > 0 && phoneDigits.length !== selectedCountry.length) {
        setError(t.errorLength(selectedCountry.name, selectedCountry.length, phoneDigits.length));
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      if (isRegister) {
        // Direct Registration Flow
        const regResult = GymStore.registerUser({
          email: cleanEmail,
          password_hash: cleanPassword,
          club_name: clubName.trim(),
          club_whatsapp: clubWhatsapp.trim() || `${selectedCountry.code}612345678`,
          created_at: new Date().toISOString(),
        });

        if (regResult.success) {
          GymStore.loginUser(cleanEmail);
          GymStore.setRememberedCredentials(cleanEmail, rememberMe);
          onLoginSuccess(cleanEmail);
        } else {
          setError(regResult.error || (lang === 'ar' ? 'حدث خطأ أثناء التسجيل.' : lang === 'fr' ? 'Erreur lors de l\'inscription.' : 'Registration error occurred.'));
          setLoading(false);
        }
      } else {
        // Login Flow
        const loginResult = GymStore.authenticateUser(cleanEmail, cleanPassword);
        if (loginResult.success) {
          GymStore.loginUser(cleanEmail, loginResult.sessionToken);
          GymStore.setRememberedCredentials(cleanEmail, rememberMe);
          onLoginSuccess(cleanEmail);
        } else {
          if (loginResult.deviceMismatch) {
            setDeviceMismatchData({
              boundDeviceId: loginResult.boundDeviceId || 'UNKNOWN-DEVICE',
              attemptedDeviceId: loginResult.attemptedDeviceId || currentDevice.device_uuid,
              deviceType: loginResult.deviceType || 'windows',
              email: cleanEmail
            });
            setError(
              lang === 'ar'
                ? 'هذا الحساب مربوط بجهاز آخر بالفعل، يرجى التواصل مع الدعم لنقل الترخيص'
                : lang === 'fr'
                ? 'Ce compte est déjà lié à un autre appareil. Veuillez contacter le support pour transférer la licence.'
                : lang === 'es'
                ? 'Esta cuenta ya está vinculada a otro dispositivo. Póngase en contacto con el soporte para transferir la licencia.'
                : 'This account is already bound to another device. Please contact support to transfer the license.'
            );
          } else {
            setError(loginResult.error || (lang === 'ar' ? 'بيانات الدخول غير صحيحة، يرجى إعادة المحاولة.' : lang === 'fr' ? 'Identifiants incorrects.' : 'Invalid credentials. Please try again.'));
          }
          setLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 font-sans selection:bg-[#d2ff1f] selection:text-black">
      {/* Background soft ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,255,31,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div
        className="w-full max-w-md space-y-6 rounded-3xl border border-[#222226] bg-[#121214] p-7 md:p-9 shadow-2xl relative"
        dir={dir}
      >
        {/* Language Selection Dropdown (Top Corner) */}
        <div
          className={`absolute top-4 ${
            isRtl ? 'left-4' : 'right-4'
          } z-20`}
        >
          <LanguageSelector variant="compact" />
        </div>

        {/* Logo and Brand Title with Luxurious Accents */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-2 rounded-3xl bg-[#d2ff1f]/20 blur-lg" />
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d2ff1f] to-[#b0dd08] text-black shadow-xl shadow-[#d2ff1f]/20 border border-[#d2ff1f]">
              <Dumbbell className="h-8 w-8 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d2ff1f]/10 border border-[#d2ff1f]/30 text-[#d2ff1f] text-[10px] font-extrabold font-mono mb-1 tracking-wider uppercase">
              {t.brandBadge}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              {t.title}
            </h1>
            <p className="mt-1.5 text-xs text-[#8a8a93] font-sans leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Selector (Login / Register) */}
        <div className="grid grid-cols-2 gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-[#222226]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-[#d2ff1f] text-black shadow-lg shadow-[#d2ff1f]/10'
                : 'text-[#8a8a93] hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{t.tabLogin}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegister
                ? 'bg-[#d2ff1f] text-black shadow-lg shadow-[#d2ff1f]/10'
                : 'text-[#8a8a93] hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{t.tabRegister}</span>
          </button>
        </div>

        {/* Interactive Error Alert Banner */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs text-red-400 font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-ping shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Registration Mode Exclusive Fields */}
          {isRegister && (
            <>
              <div>
                <label
                  htmlFor="clubName"
                  className={`block text-xs font-bold text-[#c4c4c7] mb-1.5 font-sans ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                >
                  {t.clubNameLabel} <span className="text-[#d2ff1f]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="clubName"
                    name="clubName"
                    type="text"
                    required={isRegister}
                    value={clubName}
                    onChange={(e) => {
                      setClubName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={t.clubNamePlaceholder}
                    className={`w-full rounded-xl border ${
                      touched.clubName && !clubName.trim()
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-[#27272a] bg-[#18181b]'
                    } py-3 text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 text-xs font-semibold ${
                      isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                    }`}
                  />
                  <div
                    className={`absolute inset-y-0 flex items-center text-zinc-500 pointer-events-none ${
                      isRtl ? 'right-0 pr-4' : 'left-0 pl-4'
                    }`}
                  >
                    <Building2 className="h-4.5 w-4.5 text-[#d2ff1f]" />
                  </div>
                </div>
              </div>

              {/* Phone & Country Prefix Picker */}
              <div>
                <label
                  htmlFor="clubPhoneDigits"
                  className={`block text-xs font-bold text-[#c4c4c7] mb-1.5 font-sans ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                >
                  {t.clubWhatsappLabel}
                </label>
                <div className="relative">
                  <div className="flex items-center rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden focus-within:border-[#d2ff1f] focus-within:ring-1 focus-within:ring-[#d2ff1f] transition-all duration-200">
                    <div className="relative shrink-0">
                      <div
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className={`flex items-center bg-zinc-900 px-3 py-3 h-full select-none cursor-pointer hover:bg-zinc-800 transition-colors shrink-0 ${
                          isRtl ? 'border-l border-[#27272a]' : 'border-r border-[#27272a]'
                        }`}
                      >
                        <span className="text-xs font-bold text-[#d2ff1f] flex items-center gap-1.5 font-sans">
                          <span className="text-base select-none">{selectedCountry.flag}</span>
                          <span className="font-mono">{selectedCountry.code}</span>
                          <span className="text-[8px] text-zinc-500">▼</span>
                        </span>
                      </div>

                      {isCountryDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsCountryDropdownOpen(false)}
                          />
                          <div
                            className={`absolute z-50 top-full mt-2 w-72 max-h-64 overflow-y-auto rounded-2xl border border-[#27272a] bg-[#121214] p-3 shadow-2xl animate-fadeIn font-sans select-none ${
                              isRtl ? 'right-0 text-right' : 'left-0 text-left'
                            }`}
                          >
                            <p className="text-[10px] text-zinc-500 font-bold mb-2 pb-1.5 border-b border-zinc-800">
                              {t.flagDropdownTitle}
                            </p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {COUNTRY_CODES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    handleCountryChange(c);
                                    setIsCountryDropdownOpen(false);
                                  }}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                                    selectedCountry.code === c.code
                                      ? 'bg-[#d2ff1f] text-black font-extrabold shadow-lg shadow-[#d2ff1f]/10'
                                      : 'bg-[#18181b] border border-[#222226] text-white hover:border-[#8a8a93] hover:bg-zinc-800'
                                  }`}
                                >
                                  <span className="text-xl mb-0.5">{c.flag}</span>
                                  <span className="text-[10px] font-mono leading-none">{c.code}</span>
                                  <span className="text-[8px] opacity-80 mt-1 truncate max-w-full font-sans">
                                    {c.shortName}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <input
                      id="clubPhoneDigits"
                      name="clubPhoneDigits"
                      type="tel"
                      dir="ltr"
                      value={phoneDigits}
                      onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                      placeholder={selectedCountry.placeholder}
                      className="flex-1 bg-transparent py-3 px-3.5 text-left text-white placeholder-zinc-700 focus:outline-none font-mono text-xs"
                    />

                    <div
                      className={`flex items-center text-zinc-500 shrink-0 ${
                        isRtl ? 'pr-3.5' : 'pl-3.5'
                      }`}
                    >
                      <Smartphone className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {phoneDigits.length > 0 && (
                    <div
                      className={`mt-1.5 flex items-center text-[10px] font-sans ${
                        isRtl ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">{t.entered}</span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] ${
                            phoneDigits.length === selectedCountry.length
                              ? 'bg-[#d2ff1f]/10 text-[#d2ff1f] border border-[#d2ff1f]/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {phoneDigits.length} / {selectedCountry.length}
                        </span>
                        {phoneDigits.length === selectedCountry.length && (
                          <span className="text-emerald-400 text-[10px] font-bold">{t.perfect}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Email Address Field */}
          <div>
            <label
              htmlFor="email"
              className={`block text-xs font-bold text-[#c4c4c7] mb-1.5 font-sans ${
                isRtl ? 'text-right' : 'text-left'
              }`}
            >
              {t.emailLabel} <span className="text-[#d2ff1f]">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.emailPlaceholder}
                className={`w-full rounded-xl border ${
                  touched.email && (!email.trim() || !email.includes('@'))
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-[#27272a] bg-[#18181b]'
                } py-3 text-left text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 text-xs font-semibold font-mono ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
              />
              <div
                className={`absolute inset-y-0 flex items-center text-zinc-500 pointer-events-none ${
                  isRtl ? 'right-0 pr-4' : 'left-0 pl-4'
                }`}
              >
                <Mail className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          {/* Password Field: Clean single Eye Toggle button without cluttered lock icon */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#c4c4c7] font-sans"
              >
                {t.passwordLabel} <span className="text-[#d2ff1f]">*</span>
              </label>

              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-[#d2ff1f] hover:underline transition-all cursor-pointer font-sans"
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.passwordPlaceholder}
                className={`w-full rounded-xl border ${
                  touched.password && (!password.trim() || password.length < 6)
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-[#27272a] bg-[#18181b]'
                } py-3 text-left text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200 font-mono text-xs ${
                  isRtl ? 'pr-4 pl-11' : 'pl-4 pr-11'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 flex items-center text-zinc-400 hover:text-[#d2ff1f] transition-colors cursor-pointer ${
                  isRtl ? 'left-0 pl-3.5' : 'right-0 pr-3.5'
                }`}
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox (Session Persistence) */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#d2ff1f] focus:ring-[#d2ff1f] cursor-pointer accent-[#d2ff1f]"
            />
            <label
              htmlFor="rememberMe"
              className="text-[11px] font-semibold text-zinc-400 select-none cursor-pointer hover:text-zinc-200 transition-colors font-sans"
            >
              {t.rememberMeLabel}
            </label>
          </div>

          {/* Submit Button (Direct Transition to Dashboard) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#d2ff1f] py-3.5 px-4 text-sm font-extrabold text-black transition-all duration-200 hover:bg-[#c2ed14] hover:shadow-lg hover:shadow-[#d2ff1f]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <span>{t.btnSubmit}</span>
                  {isRtl ? <ArrowLeft className="h-4 w-4 stroke-[3]" /> : <ArrowRight className="h-4 w-4 stroke-[3]" />}
                </>
              )}
            </button>
          </div>

          {/* Device Fingerprint Security Badge (Simplified & Discreet) */}
          <div className="pt-2 text-center border-t border-zinc-800/80">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-sans">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'نظام ترخيص مشفر ومحمي للأجهزة المعتمدة'
                  : 'Encrypted Device License Security'}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Device Mismatch / License Transfer Modal */}
      {deviceMismatchData && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans animate-fadeIn"
          dir={dir}
        >
          <div className="w-full max-w-md rounded-3xl bg-[#121214] border border-amber-500/30 text-white shadow-2xl p-6 md:p-8 relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {lang === 'ar' ? 'تنبيه: الحساب مرتبط بجهاز آخر' : lang === 'fr' ? 'Compte lié à un autre appareil' : lang === 'es' ? 'Cuenta Vinculada a Otro Dispositivo' : 'Account Bound to Another Device'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {lang === 'ar' ? 'حماية الترخيص والبيانات' : 'License and data protection'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeviceMismatchData(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Message Box */}
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'هذا الحساب مربوط بجهاز آخر بالفعل، يرجى التواصل مع الدعم لنقل الترخيص'
                    : 'This account is already bound to another device. Please contact support or request a license transfer.'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300">
                {lang === 'ar'
                  ? 'لحماية بيانات ناديك الرياضي وضمان عدم فتح الحساب من أجهزة متعددة غير مصرح بها، يرجى طلب نقل الترخيص للجهاز الحالي.'
                  : 'To safeguard your gym records and prevent unauthorized multi-device access, each license is bound to authorized hardware.'}
              </p>
            </div>

            {/* Account Info Box */}
            <div className="space-y-2.5 mb-5 bg-[#18181b] p-4 rounded-2xl border border-zinc-800 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                <span className="text-zinc-400">{lang === 'ar' ? 'البريد الإلكتروني:' : 'Account Email:'}</span>
                <span className="text-white font-mono font-bold">{deviceMismatchData.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">{lang === 'ar' ? 'نوع الجهاز الحالي:' : 'Current Device Type:'}</span>
                <span className="text-sky-400 font-bold">
                  {deviceMismatchData.deviceType === 'mobile'
                    ? (lang === 'ar' ? '📱 هاتف ذكي' : 'Mobile Phone')
                    : (lang === 'ar' ? '💻 حاسوب شخصي' : 'Computer')}
                </span>
              </div>
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

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* WhatsApp Support Button with Pre-filled message */}
              <a
                href={`https://wa.me/212612345678?text=${encodeURIComponent(
                  `السلام عليكم، أطلب نقل ترخيص نظام GymFlow للحساب: ${deviceMismatchData.email}\nنوع الجهاز: ${deviceMismatchData.deviceType === 'mobile' ? 'هاتف ذكي' : 'كمبيوتر'}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{lang === 'ar' ? 'تواصل عبر واتساب لطلب نقل الترخيص' : 'Contact Support on WhatsApp'}</span>
              </a>

              {/* Instant Reset / Unbind for Account Owner */}
              <button
                type="button"
                disabled={isUnbindingLoading}
                onClick={() => {
                  setIsUnbindingLoading(true);
                  setTransferError('');
                  setTimeout(() => {
                    const result = GymStore.unbindDevice(
                      deviceMismatchData.email,
                      deviceMismatchData.deviceType === 'mobile' ? 'mobile' : 'windows'
                    );
                    if (result.success) {
                      setTransferSuccess(lang === 'ar' ? 'تمت إعادة ضبط الترخيص بنجاح، جاري تسجيل الدخول...' : result.message);
                      setTimeout(() => {
                        setDeviceMismatchData(null);
                        setError('');
                        // Auto retry login
                        const autoLogin = GymStore.authenticateUser(email, password);
                        if (autoLogin.success) {
                          GymStore.loginUser(email, autoLogin.sessionToken);
                          onLoginSuccess(email);
                        }
                      }, 800);
                    } else {
                      setTransferError(result.message);
                    }
                    setIsUnbindingLoading(false);
                  }, 500);
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-[#d2ff1f] ${isUnbindingLoading ? 'animate-spin' : ''}`} />
                <span>{lang === 'ar' ? 'نقل وتفعيل الترخيص لهذا الجهاز الآن' : 'Transfer & Bind License to This Device'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMismatchData(null)}
                className="w-full py-2 rounded-xl text-zinc-500 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-fadeIn"
          dir={dir}
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#121214] border border-[#222226] text-white shadow-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#d2ff1f]" />
                <h3 className="text-sm font-extrabold text-white">
                  {lang === 'ar' ? 'استعادة وتعيين كلمة المرور' : lang === 'fr' ? 'Récupération du mot de passe' : lang === 'es' ? 'Recuperar y Restablecer Contraseña' : 'Reset Password'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400 font-bold">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-400 font-bold">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  {lang === 'ar' ? 'البريد الإلكتروني للحساب:' : lang === 'fr' ? 'E-mail du compte :' : lang === 'es' ? 'Correo electrónico de la cuenta:' : 'Account Email:'}
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@yourclub.com"
                  className="w-full rounded-xl border border-zinc-800 bg-[#18181b] py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور الجديدة (اختياري، أو سيتم توليد كلمة جديدة تلقائياً):' : lang === 'fr' ? 'Nouveau mot de passe (optionnel) :' : lang === 'es' ? 'Nueva contraseña (opcional):' : 'New Password (optional):'}
                </label>
                <div className="relative">
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="•••••••• (6 خانات أو أكثر)"
                    className={`w-full rounded-xl border border-zinc-800 bg-[#18181b] py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:outline-none font-mono ${
                      isRtl ? 'pr-3 pl-10' : 'pl-3 pr-10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className={`absolute inset-y-0 flex items-center text-zinc-500 hover:text-white cursor-pointer ${
                      isRtl ? 'left-0 pl-3' : 'right-0 pr-3'
                    }`}
                  >
                    {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#d2ff1f] hover:bg-[#c2ed14] text-black font-extrabold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <span>{lang === 'ar' ? 'تأكيد وحفظ كلمة المرور' : lang === 'fr' ? 'Confirmer le mot de passe' : lang === 'es' ? 'Confirmar y Guardar' : 'Confirm & Save Password'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : lang === 'es' ? 'Cerrar' : 'Close'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
