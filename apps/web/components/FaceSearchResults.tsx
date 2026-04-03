/**
 * Face Search Results Component
 * 
 * Displays and manages face search results with filtering, sorting, and export
 * Supports both FaceOnLive and FaceSeek results with cross-verification
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Copy,
  ExternalLink,
  Play,
  AlertTriangle,
} from 'lucide-react';

interface SearchMatch {
  url: string;
  title?: string;
  source?: string;
  domain?: string;
  imageUrl: string;
  similarity_score?: number;
  similarity?: number;
  is_video?: boolean;
  is_nsfw?: boolean;
  contains_deepfake?: boolean;
  crawlDate?: string;
  metadata?: any;
  sources?: string[]; // For merged results
  crossVerified?: boolean;
}

interface FaceSearchResultsProps {
  matches: SearchMatch[];
  personName?: string;
  totalMatches?: number;
  searchTime?: number;
  riskLevel?: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  coverage?: any;
  showFilters?: boolean;
  onMatchClick?: (match: SearchMatch) => void;
}

const FaceSearchResults: React.FC<FaceSearchResultsProps> = ({
  matches = [],
  personName = 'Unknown',
  totalMatches = 0,
  searchTime = 0,
  riskLevel = 'low',
  coverage,
  showFilters = true,
  onMatchClick,
}) => {
  // State for filtering and sorting
  const [sortBy, setSortBy] = useState<'similarity' | 'date' | 'relevance'>('similarity');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos' | 'deepfakes' | 'nsfw'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = [...matches];

    // Apply type filter
    if (filterType === 'videos') {
      filtered = filtered.filter((m) => m.is_video);
    } else if (filterType === 'deepfakes') {
      filtered = filtered.filter((m) => m.contains_deepfake);
    } else if (filterType === 'nsfw') {
      filtered = filtered.filter((m) => m.is_nsfw);
    } else if (filterType === 'images') {
      filtered = filtered.filter((m) => !m.is_video);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(query) ||
          m.domain?.toLowerCase().includes(query) ||
          m.url.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    if (sortBy === 'similarity') {
      filtered.sort((a, b) => {
        const scoreA = (a.similarity_score || a.similarity || 0) as number;
        const scoreB = (b.similarity_score || b.similarity || 0) as number;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'date' && matches[0]?.crawlDate) {
      filtered.sort((a, b) => {
        const dateA = a.crawlDate ? new Date(a.crawlDate).getTime() : 0;
        const dateB = b.crawlDate ? new Date(b.crawlDate).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [matches, filterType, sortBy, searchQuery]);

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/20 border-red-700 text-red-300';
      case 'high':
        return 'bg-orange-900/20 border-orange-700 text-orange-300';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-700 text-yellow-300';
      case 'low':
        return 'bg-blue-900/20 border-blue-700 text-blue-300';
      default:
        return 'bg-green-900/20 border-green-700 text-green-300';
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  // Export matches as CSV
  const exportAsCSV = () => {
    const headers = ['URL', 'Title', 'Source', 'Similarity', 'Type', 'Status'];
    const rows = filteredMatches.map((m) => [
      m.url,
      m.title || '',
      m.domain || m.source || '',
      `${Math.round((m.similarity_score || m.similarity || 0) * 100)}%`,
      m.is_video ? 'Video' : m.is_nsfw ? 'NSFW' : m.contains_deepfake ? 'Deepfake' : 'Image',
      m.crossVerified ? 'Verified' : 'Found',
    ]);

    const csvContent = [
      [
        `Face Search Results for ${personName}`,
        `Total Matches: ${filteredMatches.length}`,
        `Search Time: ${searchTime}s`,
      ].join(' | '),
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `face-search-${personName}-${Date.now()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Gesamt Ergebnisse</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">{filteredMatches.length}</p>
          <p className="text-xs text-gray-500 mt-1">von {totalMatches} Matches</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Videos</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {filteredMatches.filter((m) => m.is_video).length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Deepfakes</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">
            {filteredMatches.filter((m) => m.contains_deepfake).length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">NSFW</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {filteredMatches.filter((m) => m.is_nsfw).length}
          </p>
        </div>
      </div>

      {/* Coverage Info */}
      {coverage && (
        <div className={`p-4 rounded-lg border ${getRiskColor(riskLevel)}`}>
          <p className="font-semibold mb-3">Abdeckung</p>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="opacity-75">Social Media</p>
              <p className="font-bold mt-1">{coverage.socialMedia || 0}%</p>
            </div>
            <div>
              <p className="opacity-75">Web</p>
              <p className="font-bold mt-1">{coverage.web || 0}%</p>
            </div>
            <div>
              <p className="opacity-75">Videos</p>
              <p className="font-bold mt-1">{coverage.videos || 0}%</p>
            </div>
            {coverage.deepWeb && (
              <div>
                <p className="opacity-75">Deep Web</p>
                <p className="font-bold mt-1">{coverage.deepWeb}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      {showFilters && (
        <div className="space-y-4">
          {/* Search Box */}
          <div>
            <input
              type="text"
              placeholder="In Ergebnissen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Alle Typen</option>
              <option value="images">Nur Bilder</option>
              <option value="videos">Nur Videos</option>
              <option value="deepfakes">Nur Deepfakes</option>
              <option value="nsfw">Nur NSFW</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="similarity">Nach Ähnlichkeit</option>
              <option value="date">Nach Datum</option>
              <option value="relevance">Nach Relevanz</option>
            </select>

            <button
              onClick={exportAsCSV}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3 max-h-[calc(100vh-600px)] overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine Ergebnisse gefunden</p>
          </div>
        ) : (
          filteredMatches.map((match, idx) => (
            <div
              key={idx}
              onClick={() => onMatchClick?.(match)}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500 hover:bg-gray-700/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {match.imageUrl && (
                  <div className="flex-shrink-0 relative">
                    <Image
                      src={match.imageUrl}
                      alt="Match"
                      width={80}
                      height={80}
                      className="rounded w-20 h-20 object-cover border border-gray-600 group-hover:border-cyan-400"
                    />
                    {match.is_video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate font-medium">
                        {match.title || match.domain || 'Untitled'}
                      </p>
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-cyan-400 hover:text-cyan-300 truncate flex items-center gap-1 mt-1"
                      >
                        {match.url.replace(/^https?:\/\//, '').split('/')[0]}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(match.url);
                      }}
                      className="p-2 hover:bg-gray-600 rounded transition-colors"
                      title="Link kopieren"
                    >
                      {copiedUrl === match.url ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Similarity Score */}
                  {(match.similarity_score || match.similarity) && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{
                            width: `${Math.round((match.similarity_score || match.similarity || 0) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-300">
                        {Math.round((match.similarity_score || match.similarity || 0) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Metadata and Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {match.is_video && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700 flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {match.contains_deepfake && (
                      <span className="px-2 py-1 bg-orange-900/30 text-orange-300 text-xs rounded border border-orange-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Deepfake
                      </span>
                    )}
                    {match.is_nsfw && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded border border-red-700">
                        NSFW
                      </span>
                    )}
                    {match.crossVerified && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded border border-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verifiziert
                      </span>
                    )}
                    {match.crawlDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(match.crawlDate).toLocaleDateString('de-DE')}
                      </span>
                    )}
                    {match.sources && match.sources.length > 1 && (
                      <span className="text-xs text-gray-400">
                        {match.sources.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Open Link Button */}
                <a
                  href={match.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Link öffnen"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
        <p>
          {filteredMatches.length} Ergebnisse angezeigt
          {searchQuery && ` (gefiltert von ${totalMatches})`}
          {searchTime && ` • Suchzeit: ${searchTime}s`}
        </p>
      </div>
    </div>
  );
};

export default FaceSearchResults;
