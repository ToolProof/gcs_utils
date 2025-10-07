/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 * - Legacy compatibility functions
 */
export { GCSUtils } from './gcs-utils';
export { CAFS } from './cafs';
export * from './types';
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
/**
 * Legacy function: Reads a number value from a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
export declare function readFromGCS(filePath: string): Promise<number>;
/**
 * Legacy function: Writes a number value to a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
export declare function writeToGCS(filePath: string, semanticIdentity: number): Promise<void>;
