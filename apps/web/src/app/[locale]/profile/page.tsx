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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              ← {t('nav.home')}
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('profile.personalInfo')}
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'images'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('profile.myImages')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('profile.settings')}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">{t('profile.personalInfo')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('auth.firstName')}
                  </label>
                  <input
                    type="text"
                    defaultValue={user.firstName || ''}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    defaultValue={user.lastName || ''}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.bio')}
                  </label>
                  <textarea
                    defaultValue={user.bio || ''}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                {t('common.save')}
              </button>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">{t('profile.uploadNew')}</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
            </div>

            {images.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">{t('profile.uploadedImages')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt={img.filename}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">{t('profile.settings')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.language')}
                  </label>
                  <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500">
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.theme')}
                  </label>
                  <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">{t('profile.security')}</h2>
              <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium">
                {t('profile.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
