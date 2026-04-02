/**
 * LeakCheckWidget Component
 * User-facing component for checking email leaks and password strength
 */

import React, { useState } from 'react';
import apiClient, { LeakCheckResult, PasswordStrengthResult } from '../lib/api-client';

interface LeakCheckWidgetProps {
  onResultChange?: (result: LeakCheckResult | null) => void;
}

export const LeakCheckWidget: React.FC<LeakCheckWidgetProps> = ({ onResultChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeakCheckResult | null>(null);
  const [passwordResult, setPasswordResult] = useState<PasswordStrengthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailCheck = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.checkEmailLeak(email);
      setResult(result);
      onResultChange?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check email');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCheck = async () => {
    if (!password || password.length < 1) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.checkPasswordStrength(password);
      setPasswordResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check password');
      setPasswordResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'safe':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔒 TrustShield Check</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Email Check Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📧 Check Email for Leaks</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleEmailCheck}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {/* Email Result */}
        {result && (
          <div className={`mt-4 p-4 border rounded-lg ${getRiskColor(result.summary.riskLevel)}`}>
            <div className="font-semibold mb-2">{result.summary.message}</div>

            {result.email && (
              <div className="mt-2">
                <p className="mb-1">
                  <strong>Breaches:</strong>{' '}
                  {result.email.found ? `${result.email.breaches} found` : 'None detected'}
                </p>
                {result.email.found && result.email.sources.length > 0 && (
                  <p className="mb-1">
                    <strong>Sources:</strong> {result.email.sources.slice(0, 3).join(', ')}
                    {result.email.sources.length > 3 && `... and ${result.email.sources.length - 3} more`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Strength Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🔑 Check Password Strength</h3>
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handlePasswordCheck}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {/* Password Result */}
        {passwordResult && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Strength:</span>
                <span className="capitalize font-bold">{passwordResult.strength}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStrengthColor(passwordResult.strength)}`}
                  style={{ width: `${passwordResult.score}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{passwordResult.score}/100</span>
            </div>

            {passwordResult.isPwned && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                ⚠️ This password has been compromised! Choose a different one.
              </div>
            )}

            {passwordResult.suggestions.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {passwordResult.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-2">ℹ️ How it works</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Email leaks are checked against known data breaches</li>
          <li>• Passwords are checked using k-anonymity (secure & private)</li>
          <li>• Your data is never stored or logged</li>
          <li>• Powered by: LeakCheck.io, HIBP, and Hugging Face</li>
        </ul>
      </div>
    </div>
  );
};

export default LeakCheckWidget;
