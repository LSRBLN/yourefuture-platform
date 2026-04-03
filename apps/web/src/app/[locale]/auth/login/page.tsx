'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/http-client';
import { setAccessToken, setRefreshToken } from '@/lib/auth-storage';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailInputId = 'login-email';
  const passwordInputId = 'login-password';
  const errorId = 'login-error';

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
        throw new Error(data.message || t('auth.errors.loginFailed'));
      }

      const { token, refreshToken } = await response.json();
      setAccessToken(token);

      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      router.push(`/${locale}/profile`);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.errors.loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-6 py-12 text-[var(--app-fg)] transition-colors">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a2035] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#3b82f6" />
            </svg>
          </div>
          <h1 className="mb-1 text-xl font-bold text-[var(--app-fg)]">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-[var(--app-fg-variant)]">{t('auth.loginDescription')}</p>
        </div>

        <div className="rounded-xl bg-[var(--app-surface)] p-6">
          {error && (
            <div className="mb-5 rounded-lg bg-[#3b0a0a] p-3" role="alert" aria-live="assertive" id={errorId}>
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-describedby={error ? errorId : undefined}>
            <div>
              <label htmlFor={emailInputId} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-variant)]">
                {t('auth.email')}
              </label>
              <input
                id={emailInputId}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                aria-invalid={Boolean(error)}
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-high)] px-4 py-2.5 text-sm text-[var(--app-fg)] placeholder-[var(--app-fg-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
                placeholder={t('auth.placeholders.email')}
              />
            </div>

            <div>
              <label htmlFor={passwordInputId} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-variant)]">
                {t('auth.password')}
              </label>
              <input
                id={passwordInputId}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                minLength={8}
                aria-invalid={Boolean(error)}
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-high)] px-4 py-2.5 text-sm text-[var(--app-fg)] placeholder-[var(--app-fg-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
                placeholder={t('auth.placeholders.password')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:bg-[var(--app-surface-high)] disabled:text-[var(--app-fg-muted)]"
            >
              {loading ? t('auth.loadingSubmit') : t('auth.login')}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-xs">
            <Link href={`/${locale}/auth/forgot-password`} className="font-medium text-[#3b82f6] transition-colors hover:text-[#60a5fa]">
              {t('auth.forgotPassword')}
            </Link>
            <Link href={`/${locale}/auth/register`} className="font-medium text-[#3b82f6] transition-colors hover:text-[#60a5fa]">
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
