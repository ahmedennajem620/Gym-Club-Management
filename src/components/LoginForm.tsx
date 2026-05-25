import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { GymStore } from '../services/store';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);

    // Simulate authenticating against Firebase/Local Auth
    setTimeout(() => {
      if (email.includes('@') && password.length >= 6) {
        GymStore.loginUser(email);
        onLoginSuccess(email);
      } else {
        setError('بيانات الدخول غير صحيحة. يرجى إدخال بريد صالح وكلمة مرور لا تقل عن 6 أحرف.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12 font-sans selection:bg-[#d2ff1f] selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,255,31,0.04)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#222226] bg-[#121214] p-8 md:p-10 shadow-2xl relative">
        {/* Logo and Brand Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d2ff1f] text-black shadow-lg shadow-[#d2ff1f]/10">
            <Dumbbell className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              GYM CLUB
            </h1>
            <p className="mt-2 text-sm text-[#8a8a93] font-sans">
              لوحة التحكم والإدارة لـ النادي الرياضي
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-right text-sm font-medium text-[#c4c4c7] mb-2 font-sans">
                البريد الإلكتروني (Email)
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gymclub.com"
                  className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 pr-11 pl-4 text-left text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-right text-sm font-medium text-[#c4c4c7] mb-2 font-sans">
                كلمة المرور (Password)
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#27272a] bg-[#18181b] py-3 pr-11 pl-12 text-left text-white placeholder-zinc-600 focus:border-[#d2ff1f] focus:ring-1 focus:ring-[#d2ff1f] focus:outline-none transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8a8a93] font-sans">
              * للتجريب السريع، يرجى كتابة أي بريد إلكتروني وكلمة سر مكونة من 6 خانات أو أكثر.
            </span>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center rounded-xl bg-[#d2ff1f] py-3.5 px-4 text-sm font-bold text-black transition-all duration-200 hover:bg-[#c2ed14] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
