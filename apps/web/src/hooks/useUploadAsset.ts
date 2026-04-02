'use client';

import { useState } from 'react';

export interface UploadIntentResponse {
  assetId: string;
  presignedUrl: string;
  headers?: Record<string, string>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseUploadAssetOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (assetId: string) => void;
  onError?: (error: Error) => void;
}

export function useUploadAsset(options: UseUploadAssetOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(null);

      // Step 1: Request upload intent (presigned URL)
      const intentResponse = await fetch('/api/v1/assets/upload-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          mimeType: file.type,
          fileSize: file.size,
          filename: file.name,
        }),
      });

      if (!intentResponse.ok) {
        throw new Error(`Failed to get upload intent: ${intentResponse.statusText}`);
      }

      const intent: UploadIntentResponse = await intentResponse.json();

      // Step 2: Upload file to S3 using presigned URL
      const uploadXhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        uploadXhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            const newProgress: UploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage,
            };
            setProgress(newProgress);
            options.onProgress?.(newProgress);
          }
        });

        uploadXhr.addEventListener('load', () => {
          if (uploadXhr.status >= 200 && uploadXhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${uploadXhr.statusText}`));
          }
        });

        uploadXhr.addEventListener('error', () => {
          reject(new Error('Upload failed: network error'));
        });

        uploadXhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        uploadXhr.open('PUT', intent.presignedUrl);

        if (intent.headers) {
          Object.entries(intent.headers).forEach(([key, value]) => {
            uploadXhr.setRequestHeader(key, value);
          });
        }

        uploadXhr.setRequestHeader('Content-Type', file.type);
        uploadXhr.send(file);
      });

      setAssetId(intent.assetId);
      options.onSuccess?.(intent.assetId);
      return intent.assetId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    upload,
    isLoading,
    error,
    assetId,
    progress,
    isSuccess: !isLoading && assetId && !error,
  };
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}
