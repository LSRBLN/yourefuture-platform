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
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a2035] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#3b82f6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{t('auth.registerTitle')}</h1>
          <p className="text-[#8b90a0] text-sm">{t('auth.registerDescription')}</p>
        </div>

        <div className="bg-[#161820] rounded-xl p-6">
          {error && (
            <div className="mb-5 p-3 bg-[#3b0a0a] rounded-lg">
              <p className="text-[#f87171] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[  
              { label: t('auth.email'), name: 'email', type: 'email', placeholder: 'name@example.com' },
              { label: t('auth.firstName'), name: 'firstName', type: 'text', placeholder: 'John' },
              { label: t('auth.lastName'), name: 'lastName', type: 'text', placeholder: 'Doe' },
              { label: t('auth.password'), name: 'password', type: 'password', placeholder: '••••••••' },
              { label: t('auth.confirmPassword'), name: 'confirmPassword', type: 'password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#1c1f29] border border-[#2d3244] rounded-lg text-[#e8eaf0] placeholder-[#5a5f70] focus:outline-none focus:border-[#3b82f6]/60 transition-colors text-sm"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1c1f29] text-white disabled:text-[#5a5f70] rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? t('auth.loadingSubmit') : t('auth.register')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
              {t('auth.alreadyHaveAccount')} {t('auth.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
