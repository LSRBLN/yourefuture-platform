/**
 * FaceSearchPanel Component
 * 
 * Modern reusable face search interface integrated with FaceSeek & FaceOnLive
 * Supports image upload, URL input, real-time search results, and detailed analysis
 */

'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Search, AlertCircle, CheckCircle, Loader, X, Download } from 'lucide-react';

interface FaceMatch {
  url: string;
  imageUrl: string;
  source: string;
  similarity_score?: number;
  is_video?: boolean;
  contains_deepfake?: boolean;
  is_nsfw?: boolean;
  title?: string;
}

interface FaceSearchResult {
  success: boolean;
  data?: {
    person?: string;
    search_summary: {
      total_images: number;
      videos_found: number;
      deepfakes: number;
      nsfw_content: number;
    };
    risk_assessment: {
      overall_risk: 'critical' | 'high' | 'medium' | 'low' | 'safe';
      confidence_score: number;
      exposure_level: string;
    };
    top_matches: FaceMatch[];
    deepfake_analysis?: {
      contains_deepfake: boolean;
      deepfake_confidence: number;
    };
    nsfw_analysis?: {
      count: number;
      type: string;
    };
    recommendations: string[];
    next_steps: string[];
  };
  error?: string;
}

interface FaceSearchPanelProps {
  onSearchComplete?: (results: FaceSearchResult) => void;
  defaultPersonName?: string;
  showDeepfakeCheck?: boolean;
  showNSFWCheck?: boolean;
  apiEndpoint?: string;
}

const FaceSearchPanel: React.FC<FaceSearchPanelProps> = ({
  onSearchComplete,
  defaultPersonName = '',
  showDeepfakeCheck = true,
  showNSFWCheck = true,
  apiEndpoint = '/api/v1/checks/face-exposure-report',
}) => {
  // State Management
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [personName, setPersonName] = useState<string>(defaultPersonName);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FaceSearchResult | null>(null);
  const [error, setError] = useState<string>('');
  const useBase64 = false;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte nur Bilder hochladen');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Bilddatei ist zu groß (max 10MB)');
      return;
    }

    setUploadedImage(file);
    setImageUrl('');
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Image URL Input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setUploadedImage(null);
    setPreviewUrl('');
    setError('');
  };

  // Convert Image to Base64
  const convertToBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!uploadedImage) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(uploadedImage);
    });
  };

  // Perform Face Search
  const handleFaceSearch = async () => {
    // Validation
    if (!uploadedImage && !imageUrl) {
      setError('Bitte ein Bild hochladen oder URL eingeben');
      return;
    }

    if (!personName.trim()) {
      setError('Bitte einen Namen eingeben');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults(null);

    try {
      const requestBody: any = {
        personName: personName.trim(),
        checkDeepfakes: showDeepfakeCheck,
        checkNSFW: showNSFWCheck,
      };

      // Use base64 for uploaded files or URL for external images
      if (uploadedImage && useBase64) {
        const base64 = await convertToBase64();
        requestBody.imageBase64 = base64;
      } else if (imageUrl) {
        requestBody.imageUrl = imageUrl;
      } else if (uploadedImage && !useBase64) {
        // Convert to data URL
        const base64 = await convertToBase64();
        requestBody.imageBase64 = base64;
      }

      // Make API request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const results: FaceSearchResult = await response.json();

      if (!results.success) {
        throw new Error(results.error || 'Search failed');
      }

      setSearchResults(results);
      onSearchComplete?.(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Suche fehlgeschlagen: ${errorMessage}`);
      console.error('Face search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear Search
  const handleClear = () => {
    setUploadedImage(null);
    setImageUrl('');
    setPreviewUrl('');
    setSearchResults(null);
    setError('');
    setPersonName(defaultPersonName);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Risk Level Color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/20 border-red-700 text-red-200';
      case 'high':
        return 'bg-orange-900/20 border-orange-700 text-orange-200';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-700 text-yellow-200';
      case 'low':
        return 'bg-blue-900/20 border-blue-700 text-blue-200';
      default:
        return 'bg-green-900/20 border-green-700 text-green-200';
    }
  };

  // Export Results as JSON
  const handleExportResults = () => {
    if (!searchResults) return;
    const dataStr = JSON.stringify(searchResults, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `face-search-${personName}-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Gesichtssuche im Web</h2>
        <p className="text-gray-400">
          Finde wo ein Gesicht im Internet auftaucht - Bilder, Videos, Deepfakes und Inhalte
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-200 font-medium">Fehler</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!searchResults && (
        <div className="mb-6 space-y-4">
          {/* Image Upload Zone */}
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files?.[0]) {
                handleImageUpload({
                  target: { files },
                } as any);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Bild hier hochladen</p>
            <p className="text-gray-400 text-sm">oder klicken zum durchsuchen</p>
            <p className="text-gray-500 text-xs mt-2">PNG, JPG, WebP (max 10MB)</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-400 text-sm">oder</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Image URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bild-URL</label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={300}
                className="w-full max-w-sm mx-auto rounded-lg border border-gray-600"
              />
              <button
                onClick={() => {
                  setPreviewUrl('');
                  setUploadedImage(null);
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Person Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name (optional)</label>
            <input
              type="text"
              placeholder="z.B. John Doe"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {showDeepfakeCheck && (
              <label className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-300">Deepfake-Analyse</span>
              </label>
            )}
            {showNSFWCheck && (
              <label className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-300">NSFW-Erkennung</span>
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleFaceSearch}
              disabled={isSearching || (!uploadedImage && !imageUrl)}
              className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isSearching ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Suche läuft...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Gesichtssuche starten
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
          >
            Neue Suche
          </button>

          {/* Risk Assessment */}
          {searchResults.data && (
            <>
              <div className={`p-6 rounded-lg border ${getRiskColor(searchResults.data.risk_assessment.overall_risk)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">Risikobewertung</p>
                    <p className="text-sm opacity-90 mt-1">
                      {searchResults.data.risk_assessment.exposure_level}
                    </p>
                  </div>
                  {searchResults.data.risk_assessment.overall_risk === 'safe' ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-75">Risikostufe</p>
                    <p className="font-bold text-lg mt-1">
                      {searchResults.data.risk_assessment.overall_risk.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-75">Konfidenz</p>
                    <p className="font-bold text-lg mt-1">
                      {searchResults.data.risk_assessment.confidence_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Bilder gefunden</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">
                    {searchResults.data.search_summary.total_images}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Videos</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">
                    {searchResults.data.search_summary.videos_found}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Deepfakes</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">
                    {searchResults.data.search_summary.deepfakes}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">NSFW-Inhalte</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">
                    {searchResults.data.search_summary.nsfw_content}
                  </p>
                </div>
              </div>

              {/* Top Matches */}
              {searchResults.data.top_matches.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Top Ergebnisse</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.data.top_matches.slice(0, 10).map((match, idx) => (
                      <a
                        key={idx}
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500 hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {match.imageUrl && (
                            <div className="flex-shrink-0">
                              <Image
                                src={match.imageUrl}
                                alt="Match"
                                width={60}
                                height={60}
                                className="rounded w-16 h-16 object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">{match.title || match.url}</p>
                            <p className="text-xs text-gray-500 mt-1">{match.source}</p>
                            {match.similarity_score && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-cyan-500"
                                    style={{ width: `${match.similarity_score}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{match.similarity_score}%</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {match.contains_deepfake && (
                                <span className="px-2 py-1 bg-orange-900/30 text-orange-300 text-xs rounded border border-orange-700">
                                  Deepfake
                                </span>
                              )}
                              {match.is_nsfw && (
                                <span className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded border border-red-700">
                                  NSFW
                                </span>
                              )}
                              {match.is_video && (
                                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700">
                                  Video
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {searchResults.data.recommendations.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h3 className="font-bold text-blue-200 mb-3">Empfehlungen</h3>
                  <ul className="space-y-2">
                    {searchResults.data.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-blue-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportResults}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Ergebnisse als JSON exportieren
              </button>
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
          <p className="text-gray-400">Suche läuft... Dies kann 10-25 Sekunden dauern</p>
          <p className="text-gray-500 text-sm mt-2">Durchsuche FaceOnLive, Yandex und weitere Quellen</p>
        </div>
      )}
    </div>
  );
};

export default FaceSearchPanel;
