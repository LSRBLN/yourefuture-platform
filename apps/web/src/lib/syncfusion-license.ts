/**
 * Syncfusion License Registration
 * Essential Studio® UI Edition
 */

import { registerLicense } from '@syncfusion/ej2-base';

/**
 * Initialize Syncfusion License
 * Get your license key from: https://www.syncfusion.com/
 * 
 * License is stored in environment variable: NEXT_PUBLIC_SYNCFUSION_LICENSE
 */
export function initSyncfusionLicense() {
  const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE;

  if (!licenseKey) {
    console.warn(
      '⚠️  Syncfusion License Key not found. ' +
      'Set NEXT_PUBLIC_SYNCFUSION_LICENSE environment variable. ' +
      'Get your key at: https://www.syncfusion.com/'
    );
    return false;
  }

  try {
    registerLicense(licenseKey);
    console.log('✅ Syncfusion License initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to register Syncfusion license:', error);
    return false;
  }
}

/**
 * Check if license is valid
 */
export function isSyncfusionLicensed(): boolean {
  return !!process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE;
}
