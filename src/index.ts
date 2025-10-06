/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 * - Legacy compatibility functions
 */

// Main exports
export { GCSUtils } from './gcs-utils';
export { CAFS } from './cafs';

// Type exports
export * from './types';

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

// Legacy exports for backward compatibility with the original gcs-utils.ts
import { GCSUtils } from './gcs-utils';

const defaultGCSUtils = new GCSUtils();

/**
 * Legacy function: Reads a number value from a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
export async function readFromGCS(filePath: string): Promise<number> {
    return defaultGCSUtils.readFromGCS(filePath);
}

/**
 * Legacy function: Writes a number value to a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
export async function writeToGCS(filePath: string, semanticIdentity: number): Promise<void> {
    return defaultGCSUtils.writeToGCS(filePath, semanticIdentity);
}
