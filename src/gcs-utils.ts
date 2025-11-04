import { Storage } from '@google-cloud/storage';
import { createHash } from 'crypto';
import { IntegerInstance, ReadOptions, WriteOptions } from './types/index.js';
import { dbAdmin } from './firebaseAdminInit.js';
import { time } from 'console';

/**
 * Core GCS utilities for reading and writing files
 */
export class GCSUtils {
    private storage: Storage;
    private bucketName: string;

    constructor(bucketName?: string) {
        if (!bucketName || !process.env.BUCKET_NAME) {
            throw new Error('BUCKET_NAME environment variable is not set');
        }
        this.storage = new Storage();
        this.bucketName = bucketName || process.env.BUCKET_NAME;
    }

    /**
     * Reads a number value from a Google Cloud Storage file
     * @param filePath The path to the file in the GCS bucket
     * @param options Optional read options
     * @returns The numeric value from the file
     */
    async readFromGCS(filePath: string, options: ReadOptions = {}): Promise<number> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            // Check if file exists
            const [exists] = await file.exists();
            if (!exists) {
                throw new Error(`File ${filePath} does not exist in bucket ${this.bucketName}`);
            }

            const [fileContents] = await file.download();
            const jsonData: IntegerInstance = JSON.parse(fileContents.toString());

            if (typeof jsonData.semanticIdentity !== 'number') {
                throw new Error(`File ${filePath} does not contain a valid number value`);
            }

            // Validate content hash if requested
            if (options.validateHash) {
                const contentHash = this.generateContentHash(fileContents.toString());
                const [metadata] = await file.getMetadata();
                const storedHash = metadata.metadata?.contentHash;

                if (storedHash && storedHash !== contentHash) {
                    throw new Error(`Content hash mismatch for file ${filePath}`);
                }
            }

            return jsonData.semanticIdentity;
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }

    /**
     * Writes a number value to a Google Cloud Storage file
     * @param filePath The path where to store the file in the GCS bucket
     * @param semanticIdentity The numeric value to store
     * @param options Optional write options
     */
    async writeToGCS(
        filePath: string,
        semanticIdentity: number,
        options: WriteOptions = {}
    ): Promise<void> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            const jsonData: IntegerInstance = { semanticIdentity };
            const jsonString = JSON.stringify(jsonData, null, 2);
            const contentHash = this.generateContentHash(jsonString);

            // Check if file exists and overwrite is not allowed
            if (!options.overwrite) {
                const [exists] = await file.exists();
                if (exists) {
                    throw new Error(`File ${filePath} already exists and overwrite is not allowed`);
                }
            }

            const metadata: any = {
                contentType: options.contentType || 'application/json',
                metadata: {
                    contentHash,
                    createdAt: new Date().toISOString(),
                    ...options.metadata
                }
            };

            if (options.tags && options.tags.length > 0) {
                metadata.metadata.tags = options.tags.join(',');
            }

            await file.save(jsonString, metadata);
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error}`);
        }
    }

    async writeToFirestore(
        folder: string,
        resourceId: string,
        content: { path: string; timestamp: string }
    ): Promise<void> {
        try {
            const col = dbAdmin.collection('resources').doc(folder).collection('members');
            const docRef = col.doc(resourceId);
            await docRef.set(content);
        } catch (error) {
            throw new Error(`Failed to write to Firestore: ${error}`);
        }
    }

    /**
     * Reads raw content from GCS
     * @param filePath The path to the file in the GCS bucket
     * @returns The raw file content as string
     */
    async readRawContent(filePath: string): Promise<string> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            const [exists] = await file.exists();
            if (!exists) {
                throw new Error(`File ${filePath} does not exist in bucket ${this.bucketName}`);
            }

            const [fileContents] = await file.download();
            return fileContents.toString();
        } catch (error) {
            throw new Error(`Failed to read raw content from ${filePath}: ${error}`);
        }
    }

    /**
     * Writes raw content to GCS
     * @param filePath The path where to store the file
     * @param content The content to store
     * @param contentType The MIME type of the content
     */
    async writeRawContent(
        filePath: string,
        content: string,
        contentType: string = 'text/plain',
        timestamp: string
    ): Promise<void> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);
            const contentHash = this.generateContentHash(content);

            await file.save(content, {
                metadata: {
                    contentType,
                    metadata: {
                        contentHash,
                        timestamp
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to write raw content to ${filePath}: ${error}`);
        }
    }

    /**
     * Generates SHA-256 hash of content
     * @param content The content to hash
     * @returns The SHA-256 hash as hex string
     */
    generateContentHash(content: string): string {
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Checks if a file exists in GCS
     * @param filePath The path to check
     * @returns True if file exists, false otherwise
     */
    async fileExists(filePath: string): Promise<boolean> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            return exists;
        } catch (error) {
            return false;
        }
    }

    /**
     * Deletes a file from GCS
     * @param filePath The path to the file to delete
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);
            await file.delete();
        } catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error}`);
        }
    }

    /**
     * Gets file metadata from GCS
     * @param filePath The path to the file
     * @returns File metadata
     */
    async getFileMetadata(filePath: string): Promise<any> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);
            const [metadata] = await file.getMetadata();
            return metadata;
        } catch (error) {
            throw new Error(`Failed to get metadata for file ${filePath}: ${error}`);
        }
    }

    /**
     * Lists files in the bucket with optional prefix
     * @param prefix Optional prefix to filter files
     * @returns Array of file names
     */
    async listFiles(prefix?: string): Promise<string[]> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const [files] = await bucket.getFiles({ prefix });
            return files.map(file => file.name);
        } catch (error) {
            throw new Error(`Failed to list files: ${error}`);
        }
    }
}
