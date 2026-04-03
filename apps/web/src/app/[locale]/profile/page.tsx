'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { clearAuthTokens, getAccessToken } from '@/lib/auth-storage';
import { getApiErrorMessage } from '@/lib/http-client';
import { applyTheme, getPreferredTheme, type Theme } from '@/lib/theme';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  language: string;
  theme: string;
}

interface UserImage {
  id: string;
  filename: string;
  imageUrl: string;
  isPrimary: boolean;
}

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const errorId = 'profile-error';

  useEffect(() => {
    fetchProfile();
    setTheme(getPreferredTheme());
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      const response = await fetch('/api/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(t('profile.errors.loadFailed'));
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setUser(data);
      if (Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.errors.loadFailed')));
      router.push(`/${locale}/auth/login`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/users/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('profile.errors.uploadFailed'));
      }

      const payload = await response.json();
      const newImage = payload?.data ?? payload;
      setImages([...images, newImage]);
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.errors.uploadFailed')));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(`/api/v1/users/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(t('profile.errors.deleteFailed'));
      }

      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.errors.deleteFailed')));
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--app-bg)] transition-colors">
        <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--app-bg)] transition-colors">
        <p className="text-[#f87171] text-sm">{error}</p>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-high)] px-4 py-2.5 text-sm text-[var(--app-fg)] placeholder-[var(--app-fg-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40';
  const labelCls = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-variant)]';

  return (
    <div className="flex h-full flex-col bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--app-border)] px-8 py-5">
        <h1 className="text-xl font-semibold text-[var(--app-fg)]">{t('profile.title')}</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-[var(--app-surface-high)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg-variant)] transition-colors hover:bg-[var(--app-surface-highest)] hover:text-[var(--app-fg)]"
        >
          {t('common.logout')}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div id={errorId} role="alert" aria-live="assertive" className="mb-5 rounded-lg bg-[#3b0a0a] p-3">
            <p className="text-[#f87171] text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl bg-[var(--app-surface)] p-1">
          {[{id:'profile',label:t('profile.personalInfo')},{id:'images',label:t('profile.myImages')},{id:'settings',label:t('profile.settings')}].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--app-surface-high)] text-[var(--app-fg)]'
                  : 'text-[var(--app-fg-variant)] hover:text-[var(--app-fg)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="max-w-2xl rounded-xl bg-[var(--app-surface)] p-6">
            <h2 className="mb-5 text-base font-semibold text-[var(--app-fg)]">{t('profile.personalInfo')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>{t('auth.email')}</label>
                <input type="email" value={user.email} disabled className={inputCls + ' opacity-50 cursor-not-allowed'} />
              </div>
              <div>
                <label className={labelCls}>{t('auth.firstName')}</label>
                <input type="text" defaultValue={user.firstName || ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('auth.lastName')}</label>
                <input type="text" defaultValue={user.lastName || ''} className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>{t('profile.bio')}</label>
                <textarea defaultValue={user.bio || ''} className={inputCls} rows={3} />
              </div>
            </div>
            <button className="mt-5 rounded-lg bg-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]">
              {t('common.save')}
            </button>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-5 max-w-2xl">
            <div className="rounded-xl bg-[var(--app-surface)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--app-fg)]">{t('profile.uploadNew')}</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                aria-describedby={error ? errorId : undefined}
                className="block w-full text-sm text-[var(--app-fg-variant)] file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#3b82f6] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:transition-colors hover:file:bg-[#2563eb]"
              />
            </div>
            {images.length > 0 && (
              <div className="rounded-xl bg-[var(--app-surface)] p-6">
                <h2 className="mb-4 text-base font-semibold text-[var(--app-fg)]">{t('profile.uploadedImages')}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group overflow-hidden rounded-lg">
                      <img src={img.imageUrl} alt={img.filename} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" aria-label={t('profile.deleteImageAriaLabel', { filename: img.filename })} onClick={() => handleDeleteImage(img.id)} className="rounded-lg bg-[#b91c1c] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#991b1b]">
                          {t('profile.deleteImage')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-5 max-w-2xl">
            <div className="rounded-xl bg-[var(--app-surface)] p-6">
              <h2 className="mb-5 text-base font-semibold text-[var(--app-fg)]">{t('profile.settings')}</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{t('profile.language')}</label>
                  <select className={inputCls}>
                    <option value="de">{t('common.german')}</option>
                    <option value="en">{t('common.english')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('profile.theme')}</label>
                  <select
                    className={inputCls}
                    value={theme}
                    onChange={(event) => {
                      const selectedTheme = event.target.value as Theme;
                      setTheme(selectedTheme);
                      applyTheme(selectedTheme);
                    }}
                  >
                    <option value="dark">{t('theme.dark')}</option>
                    <option value="light">{t('theme.light')}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--app-surface)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--app-fg)]">{t('profile.security')}</h2>
              <button type="button" className="rounded-lg bg-[var(--app-surface-high)] px-6 py-2.5 text-sm font-semibold text-[#3b82f6] transition-colors hover:bg-[var(--app-surface-highest)]">
                {t('profile.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
