/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 */

// Main exports
export { GCSUtils } from './gcs-utils.js';
export { CAFS } from './cafs.js';

// Type exports
export * from './types/index.js';

/**
 * Convenience function to create a GCSUtils instance
 * @param bucketName Optional bucket name
 * @returns GCSUtils instance
 */
export function createGCSUtils(bucketName?: string) {
    const { GCSUtils } = require('./gcs-utils');
    return new GCSUtils(bucketName);
}

/**
 * Convenience function to create a CAFS instance
 * @param config Optional configuration
 * @returns CAFS instance
 */
export function createCAFS(config?: any) {
    const { CAFS } = require('./cafs');
    return new CAFS(config);
}
