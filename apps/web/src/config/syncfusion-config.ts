import { initSyncfusionLicense } from '@/lib/syncfusion-license';

/**
 * Syncfusion Configuration Module
 * Handles license registration and theme setup
 */

// Register Syncfusion license at app startup
export function initializeSyncfusion(): void {
  // Call during app initialization
  initSyncfusionLicense();
}

// Syncfusion Theme Configuration
export const SYNCFUSION_THEME_CONFIG = {
  // Light themes
  MATERIAL: '@syncfusion/ej2-react-grids/styles/material.css',
  MATERIAL_DARK: '@syncfusion/ej2-react-grids/styles/material-dark.css',
  BOOTSTRAP: '@syncfusion/ej2-react-grids/styles/bootstrap.css',
  BOOTSTRAP_DARK: '@syncfusion/ej2-react-grids/styles/bootstrap-dark.css',
  BOOTSTRAP5: '@syncfusion/ej2-react-grids/styles/bootstrap5.css',
  BOOTSTRAP5_DARK: '@syncfusion/ej2-react-grids/styles/bootstrap5-dark.css',
  FLUENT: '@syncfusion/ej2-react-grids/styles/fluent.css',
  FLUENT_DARK: '@syncfusion/ej2-react-grids/styles/fluent-dark.css',
  FABRIC: '@syncfusion/ej2-react-grids/styles/fabric.css',
  FABRIC_DARK: '@syncfusion/ej2-react-grids/styles/fabric-dark.css',
  HIGHCONTRAST: '@syncfusion/ej2-react-grids/styles/highcontrast.css',
} as const;

// Get theme based on environment or user preference
export function getThemePath(): string {
  const theme = process.env.NEXT_PUBLIC_THEME || 'light';
  
  if (theme === 'dark') {
    return SYNCFUSION_THEME_CONFIG.MATERIAL_DARK;
  }
  
  return SYNCFUSION_THEME_CONFIG.MATERIAL;
}

// Syncfusion Component Defaults
export const SYNCFUSION_DEFAULTS = {
  // DataGrid
  pageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20'),
  allowPaging: true,
  allowSorting: true,
  allowFiltering: true,
  allowExcelExport: true,
  allowPdfExport: true,
  
  // Charts
  enableAnimation: true,
  chartHeight: 400,
  
  // Inputs
  floatLabelType: 'Auto' as const,
  
  // General
  locale: 'en-US',
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  retryCount: 2,
  retryDelay: 1000,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  batchOperations: process.env.NEXT_PUBLIC_ENABLE_BATCH_OPERATIONS === 'true',
  imageIndexing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_INDEXING === 'true',
} as const;

// Image Search Configuration
export const IMAGE_SEARCH_CONFIG = {
  maxBatchSize: parseInt(process.env.NEXT_PUBLIC_MAX_BATCH_IMAGES || '100'),
  similarityThreshold: parseFloat(process.env.NEXT_PUBLIC_IMAGE_SIMILARITY_THRESHOLD || '0.7'),
} as const;
