"use strict";
/**
 * Simple GCS Utils SDK - Focused on read/write operations with optional CAFS
 *
 * This SDK provides:
 * - Simple GCS read/write operations
 * - Content Addressable File Storage (CAFS) with deduplication
 * - Legacy compatibility functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAFS = exports.GCSUtils = void 0;
exports.createGCSUtils = createGCSUtils;
exports.createCAFS = createCAFS;
exports.readFromGCS = readFromGCS;
exports.writeToGCS = writeToGCS;
// Main exports
var gcs_utils_1 = require("./gcs-utils");
Object.defineProperty(exports, "GCSUtils", { enumerable: true, get: function () { return gcs_utils_1.GCSUtils; } });
var cafs_1 = require("./cafs");
Object.defineProperty(exports, "CAFS", { enumerable: true, get: function () { return cafs_1.CAFS; } });
// Type exports
__exportStar(require("./types"), exports);
/**
 * Convenience function to create a GCSUtils instance
 * @param bucketName Optional bucket name
 * @returns GCSUtils instance
 */
function createGCSUtils(bucketName) {
    const { GCSUtils } = require('./gcs-utils');
    return new GCSUtils(bucketName);
}
/**
 * Convenience function to create a CAFS instance
 * @param config Optional configuration
 * @returns CAFS instance
 */
function createCAFS(config) {
    const { CAFS } = require('./cafs');
    return new CAFS(config);
}
// Legacy exports for backward compatibility with the original gcs-utils.ts
const gcs_utils_2 = require("./gcs-utils");
const defaultGCSUtils = new gcs_utils_2.GCSUtils();
/**
 * Legacy function: Reads a number value from a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
async function readFromGCS(filePath) {
    return defaultGCSUtils.readFromGCS(filePath);
}
/**
 * Legacy function: Writes a number value to a Google Cloud Storage file
 * @deprecated Use GCSUtils class instead
 */
async function writeToGCS(filePath, semanticIdentity) {
    return defaultGCSUtils.writeToGCS(filePath, semanticIdentity);
}
