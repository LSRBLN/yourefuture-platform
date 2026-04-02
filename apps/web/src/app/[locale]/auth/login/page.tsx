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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
            <p className="text-slate-400">{t('auth.loginDescription')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? t('auth.loadingSubmit') : t('auth.login')}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
