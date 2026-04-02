'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data);
      if (data.images) {
        setImages(data.images);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/users/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newImage = await response.json();
      setImages([...images, newImage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/users/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d0f14]">
        <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d0f14]">
        <p className="text-[#f87171] text-sm">{error}</p>
      </div>
    );
  }

  const inputCls = 'w-full px-4 py-2.5 bg-[#1c1f29] border border-[#2d3244] rounded-lg text-[#e8eaf0] placeholder-[#5a5f70] focus:outline-none focus:border-[#3b82f6]/60 transition-colors text-sm';
  const labelCls = 'block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2';

  return (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      <div className="px-8 py-5 border-b border-[#1e2235] flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-semibold text-white">{t('profile.title')}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 rounded-lg bg-[#1c1f29] hover:bg-[#242836] text-[#8b90a0] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
        >
          {t('common.logout')}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-5 p-3 bg-[#3b0a0a] rounded-lg">
            <p className="text-[#f87171] text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#161820] rounded-xl p-1 w-fit">
          {[{id:'profile',label:t('profile.personalInfo')},{id:'images',label:t('profile.myImages')},{id:'settings',label:t('profile.settings')}].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1c1f29] text-white'
                  : 'text-[#8b90a0] hover:text-[#c8cad4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-[#161820] rounded-xl p-6 max-w-2xl">
            <h2 className="text-base font-semibold text-white mb-5">{t('profile.personalInfo')}</h2>
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
            <button className="mt-5 px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-semibold transition-colors">
              {t('common.save')}
            </button>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-5 max-w-2xl">
            <div className="bg-[#161820] rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">{t('profile.uploadNew')}</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-[#8b90a0] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#3b82f6] file:text-white hover:file:bg-[#2563eb] file:cursor-pointer file:transition-colors"
              />
            </div>
            {images.length > 0 && (
              <div className="bg-[#161820] rounded-xl p-6">
                <h2 className="text-base font-semibold text-white mb-4">{t('profile.uploadedImages')}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group overflow-hidden rounded-lg">
                      <img src={img.imageUrl} alt={img.filename} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDeleteImage(img.id)} className="px-3 py-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-lg text-xs font-semibold transition-colors">
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
            <div className="bg-[#161820] rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-5">{t('profile.settings')}</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{t('profile.language')}</label>
                  <select className={inputCls}>
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('profile.theme')}</label>
                  <select className={inputCls}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-[#161820] rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">{t('profile.security')}</h2>
              <button className="px-6 py-2.5 bg-[#1c1f29] hover:bg-[#242836] text-[#3b82f6] rounded-lg text-sm font-semibold transition-colors">
                {t('profile.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
