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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-lg border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-on-surface-variant hover:text-on-surface transition-colors font-medium">
              ← {t('nav.home')}
            </Link>
            <h1 className="text-2xl font-serif font-bold text-on-surface">{t('profile.title')}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-error-container/50 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-8 border-b border-outline-variant/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 font-medium transition-colors relative ${
              activeTab === 'profile'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('profile.personalInfo')}
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-3 font-medium transition-colors relative ${
              activeTab === 'images'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('profile.myImages')}
            {activeTab === 'images' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-medium transition-colors relative ${
              activeTab === 'settings'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('profile.settings')}
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>
            )}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
              <h2 className="text-2xl font-serif font-bold text-on-surface mb-8">{t('profile.personalInfo')}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface-variant cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('auth.firstName')}
                  </label>
                  <input
                    type="text"
                    defaultValue={user.firstName || ''}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    defaultValue={user.lastName || ''}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('profile.bio')}
                  </label>
                  <textarea
                    defaultValue={user.bio || ''}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    rows={3}
                  />
                </div>
              </div>
              <button className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors shadow-elevation-2">
                {t('common.save')}
              </button>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-8">
            <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
              <h2 className="text-2xl font-serif font-bold text-on-surface mb-8">{t('profile.uploadNew')}</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-on-surface-variant
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90
                  file:cursor-pointer file:transition-colors"
              />
            </div>

            {images.length > 0 && (
              <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
                <h2 className="text-2xl font-serif font-bold text-on-surface mb-8">{t('profile.uploadedImages')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {images.map((img) => (
                    <div key={img.id} className="relative group overflow-hidden rounded-lg shadow-elevation-1">
                      <img
                        src={img.imageUrl}
                        alt={img.filename}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
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
          <div className="space-y-8">
            <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
              <h2 className="text-2xl font-serif font-bold text-on-surface mb-8">{t('profile.settings')}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('profile.language')}
                  </label>
                  <select className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    {t('profile.theme')}
                  </label>
                  <select className="w-full px-4 py-2.5 bg-surface-container rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
              <h2 className="text-2xl font-serif font-bold text-on-surface mb-8">{t('profile.security')}</h2>
              <button className="px-8 py-3 bg-surface-container rounded-md text-primary hover:bg-surface-container-highest font-medium transition-colors shadow-elevation-1">
                {t('profile.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
