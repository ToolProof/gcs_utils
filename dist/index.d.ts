/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 */
export { GCSUtils } from './gcs-utils.js';
export { CAFS } from './cafs.js';
export * from './types/index.js';
/**
 * Convenience function to create a GCSUtils instance
 * @param bucketName Optional bucket name
 * @returns GCSUtils instance
 */
export declare function createGCSUtils(bucketName?: string): any;
/**
 * Convenience function to create a CAFS instance
 * @param config Optional configuration
 * @returns CAFS instance
 */
export declare function createCAFS(config?: any): any;
