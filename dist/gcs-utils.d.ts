import { ReadOptions, WriteOptions } from './types/index.js';
/**
 * Core GCS utilities for reading and writing files
 */
export declare class GCSUtils {
    private storage;
    private bucketName;
    constructor(bucketName?: string);
    /**
     * Reads a number value from a Google Cloud Storage file
     * @param filePath The path to the file in the GCS bucket
     * @param options Optional read options
     * @returns The numeric value from the file
     */
    readFromGCS(filePath: string, options?: ReadOptions): Promise<number>;
    /**
     * Writes a number value to a Google Cloud Storage file
     * @param filePath The path where to store the file in the GCS bucket
     * @param semanticIdentity The numeric value to store
     * @param options Optional write options
     */
    writeToGCS(filePath: string, semanticIdentity: number, options?: WriteOptions): Promise<void>;
    writeToFirestore(folder: string, resourceId: string, content: {
        path: string;
        timestamp: string;
    }): Promise<void>;
    /**
     * Reads raw content from GCS
     * @param filePath The path to the file in the GCS bucket
     * @returns The raw file content as string
     */
    readRawContent(filePath: string): Promise<string>;
    /**
     * Writes raw content to GCS
     * @param filePath The path where to store the file
     * @param content The content to store
     * @param contentType The MIME type of the content
     */
    writeRawContent(filePath: string, content: string, contentType?: string): Promise<void>;
    /**
     * Generates SHA-256 hash of content
     * @param content The content to hash
     * @returns The SHA-256 hash as hex string
     */
    generateContentHash(content: string): string;
    /**
     * Checks if a file exists in GCS
     * @param filePath The path to check
     * @returns True if file exists, false otherwise
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Deletes a file from GCS
     * @param filePath The path to the file to delete
     */
    deleteFile(filePath: string): Promise<void>;
    /**
     * Gets file metadata from GCS
     * @param filePath The path to the file
     * @returns File metadata
     */
    getFileMetadata(filePath: string): Promise<any>;
    /**
     * Lists files in the bucket with optional prefix
     * @param prefix Optional prefix to filter files
     * @returns Array of file names
     */
    listFiles(prefix?: string): Promise<string[]>;
}
