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
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-2">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold text-on-surface mb-2">{t('auth.loginTitle')}</h1>
            <p className="text-on-surface-variant">{t('auth.loginDescription')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-container/50 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-on-surface/20 text-white rounded-md font-medium transition-colors shadow-elevation-2 disabled:shadow-elevation-0"
            >
              {loading ? t('auth.loadingSubmit') : t('auth.login')}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80 font-medium">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-sm">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
