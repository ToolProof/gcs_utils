/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 * - Legacy compatibility functions
 */
import { CAFS } from './cafs.js';
import { GCSUtils } from './gcs-utils.js';
/**
 * Convenience function to create a GCSUtils instance
 * @param bucketName Optional bucket name
 * @returns GCSUtils instance
*/
declare function createGCSUtils(bucketName?: string): GCSUtils;
/**
 * Convenience function to create a CAFS instance
 * @param config Optional configuration
 * @returns CAFS instance
*/
declare function createCAFS(config?: any): CAFS;
export * from './types/index.js';
export { CAFS, GCSUtils, createGCSUtils, createCAFS };
