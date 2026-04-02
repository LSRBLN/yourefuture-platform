'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
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

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Bitte alle Felder ausfüllen');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      // API call to register
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to profile on success
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
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.registerTitle')}</h1>
            <p className="text-slate-400">{t('auth.registerDescription')}</p>
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

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.firstName')}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.lastName')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Doe"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? t('auth.loadingSubmit') : t('auth.register')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
