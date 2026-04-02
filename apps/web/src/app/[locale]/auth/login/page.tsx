'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const { token } = await response.json();
      localStorage.setItem('authToken', token);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a2035] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#3b82f6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{t('auth.loginTitle')}</h1>
          <p className="text-[#8b90a0] text-sm">{t('auth.loginDescription')}</p>
        </div>

        <div className="bg-[#161820] rounded-xl p-6">
          {error && (
            <div className="mb-5 p-3 bg-[#3b0a0a] rounded-lg">
              <p className="text-[#f87171] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1c1f29] border border-[#2d3244] rounded-lg text-[#e8eaf0] placeholder-[#5a5f70] focus:outline-none focus:border-[#3b82f6]/60 transition-colors text-sm"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1c1f29] border border-[#2d3244] rounded-lg text-[#e8eaf0] placeholder-[#5a5f70] focus:outline-none focus:border-[#3b82f6]/60 transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1c1f29] text-white disabled:text-[#5a5f70] rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? t('auth.loadingSubmit') : t('auth.login')}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-xs">
            <Link href="/auth/forgot-password" className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
              {t('auth.forgotPassword')}
            </Link>
            <Link href="/auth/register" className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
