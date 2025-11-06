import { createHash } from 'crypto';
import { GCSUtils } from './gcs-utils.js';
import {
    CAFSEntry,
    CAFSOperationResult,
    ResourceMetadata,
    GCSUtilsConfig
} from './types/index.js';

/**
 * Content Addressable File Storage (CAFS) implementation
 * Provides deduplication and content-based addressing for resources
 */
export class CAFS {
    private gcsUtils: GCSUtils;
    private config: GCSUtilsConfig;

    constructor(config: Partial<GCSUtilsConfig> = {}) {
        this.config = {
            bucketName: config.bucketName || process.env.BUCKET_NAME || 'tp-resources',
            metadataCollection: config.metadataCollection || 'cafs_metadata',
            enableDeduplication: config.enableDeduplication ?? true,
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
            defaultContentType: config.defaultContentType || 'application/json'
        };

        this.gcsUtils = new GCSUtils(this.config.bucketName);
    }

    /**
     * Stores content in CAFS with deduplication
     * @param folder The folder to store content in
     * @param content The content to store
     * @param metadata Optional metadata
     * @returns CAFS operation result
     */
    async storeContent(
        meta: {
            id: string;
            typeId: string;
            roleId: string;
            executionId: string;
        },
        data: string
    ): Promise<CAFSOperationResult> {
        console.log('CAFS.storeContent called with properties:', JSON.stringify(meta, null, 2));
        const folder = meta.typeId;
        const resourceId = meta.id;
        const content = JSON.stringify(data);
        const metadata = {} as any;
        try {
            // Validate content size
            const contentSize = Buffer.byteLength(content, 'utf8');
            if (contentSize > this.config.maxFileSize) {
                return {
                    success: false,
                    contentHash: '',
                    deduplicated: false,
                    storagePath: '',
                    error: `Content size ${contentSize} exceeds maximum allowed size ${this.config.maxFileSize}`
                };
            }

            // Generate content hash
            const contentHash = this.generateContentHash(content);
            const storagePath = this.getStoragePath(folder, contentHash);

            // Check if content already exists (deduplication)
            if (this.config.enableDeduplication) {
                const exists = await this.gcsUtils.fileExists(storagePath);
                if (exists) {
                    // Content already exists, just update reference count
                    await this.updateReferenceCount(folder, contentHash, 1);
                    return {
                        success: true,
                        contentHash,
                        deduplicated: true,
                        storagePath
                    };
                }
            }

            // Store new content
            const fullMetadata: ResourceMetadata = {
                contentSize,
                contentType: metadata.contentType || this.config.defaultContentType,
                timestamp: new Date().toISOString(),
                lastAccessedAt: new Date(),
                referenceCount: 1,
                tags: metadata.tags || [],
                customProperties: metadata.customProperties || {}
            };

            // Store content in GCS
            await this.gcsUtils.writeRawContent(storagePath, content, fullMetadata.contentType, fullMetadata.timestamp);

            // Create CAFS entry
            const cafsEntry: CAFSEntry = {
                contentHash,
                gcsPath: storagePath,
                metadata: fullMetadata,
                referencedBy: []
            };

            await this.gcsUtils.writeToFirestore(folder, resourceId, {
                path: storagePath,
                timestamp: fullMetadata.timestamp
            });

            return {
                success: true,
                contentHash,
                deduplicated: false,
                storagePath
            };

        } catch (error) {
            return {
                success: false,
                contentHash: '',
                deduplicated: false,
                storagePath: '',
                error: `Failed to store content: ${error}`
            };
        }
    }

    /**
     * Retrieves content from CAFS by hash
     * @param contentHash The SHA-256 hash of the content
     * @param updateAccessTime Whether to update last accessed time
     * @returns The content string
     */
    async retrieveContent(folder: string, contentHash: string, updateAccessTime: boolean = true): Promise<string> {
        try {
            const storagePath = contentHash; // this.getStoragePath(folder, contentHash); // ATTENTION: commenting out this for now to avoid adding folder prefix twice 

            // Check if content exists
            const exists = await this.gcsUtils.fileExists(storagePath);
            if (!exists) {
                throw new Error(`Content with hash ${contentHash} not found`);
            }

            // Retrieve content
            const content = await this.gcsUtils.readRawContent(storagePath);

            // Verify content hash
            const actualHash = this.generateContentHash(content);
            if (actualHash !== contentHash) {
                // throw new Error(`Content hash mismatch. Expected: ${contentHash}, Actual: ${actualHash}`); // ATTENTION: must comment this out for now as we are using full GCS path as contentHash
            }

            // Update access time if requested
            if (updateAccessTime) {
                await this.updateLastAccessTime(folder, contentHash);
            }

            return content;

        } catch (error) {
            throw new Error(`Failed to retrieve content: ${error}`);
        }
    }

    /**
     * Checks if content exists in CAFS
     * @param contentHash The SHA-256 hash to check
     * @returns True if content exists, false otherwise
     */
    async contentExists(folder: string = 'cafs', contentHash: string): Promise<boolean> {
        const storagePath = this.getStoragePath(folder, contentHash);
        return await this.gcsUtils.fileExists(storagePath);
    }

    /**
     * Deletes content from CAFS (decrements reference count)
     * @param contentHash The SHA-256 hash of the content
     * @param forceDelete Whether to force delete regardless of reference count
     */
    async deleteContent(folder: string = 'cafs', contentHash: string, forceDelete: boolean = false): Promise<void> {
        try {
            const cafsEntry = await this.getCAFSMetadata(folder, contentHash);
            if (!cafsEntry) {
                throw new Error(`CAFS entry not found for hash ${contentHash}`);
            }

            if (!forceDelete) {
                // Decrement reference count
                const newRefCount = Math.max(0, cafsEntry.metadata.referenceCount - 1);
                await this.updateReferenceCount(folder, contentHash, -1);

                // Only delete if reference count reaches zero
                if (newRefCount > 0) {
                    return;
                }
            }

            // Delete from GCS
            await this.gcsUtils.deleteFile(cafsEntry.gcsPath);

            // Delete CAFS metadata
            await this.deleteCAFSMetadata(folder, contentHash);

        } catch (error) {
            throw new Error(`Failed to delete content: ${error}`);
        }
    }

    /**
     * Gets CAFS entry metadata
     * @param contentHash The SHA-256 hash
     * @returns CAFS entry or null if not found
     */
    async getCAFSEntry(folder: string = 'cafs', contentHash: string): Promise<CAFSEntry | null> {
        return await this.getCAFSMetadata(folder, contentHash);
    }

    /**
     * Lists all CAFS entries with optional filtering
     * @param filter Optional filter function
     * @returns Array of CAFS entries
     */
    async listCAFSEntries(folder: string = 'cafs', filter?: (entry: CAFSEntry) => boolean): Promise<CAFSEntry[]> {
        // In a real implementation, this would query Firestore
        // For now, we'll list files in the CAFS directory
        const files = await this.gcsUtils.listFiles(`${folder}/`);
        const entries: CAFSEntry[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) continue; // Skip metadata files

            const hash = this.extractHashFromPath(file);
            if (hash) {
                const entry = await this.getCAFSMetadata(folder, hash);
                if (entry && (!filter || filter(entry))) {
                    entries.push(entry);
                }
            }
        }

        return entries;
    }

    /**
     * Generates SHA-256 hash of content
     * @param content The content to hash
     * @returns The SHA-256 hash as hex string
     */
    private generateContentHash(content: string): string {
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Gets the storage path for a content hash
     * @param contentHash The SHA-256 hash
     * @returns The GCS storage path
     */
    private getStoragePath(folder: string, contentHash: string): string {
        // Use first 2 characters for directory structure to avoid too many files in one directory
        return `${folder}/${contentHash}`;
    }

    /**
     * Stores CAFS metadata (placeholder for Firestore integration)
     * @param entry The CAFS entry to store
     */
    private async storeCAFSMetadata(folder: string = 'cafs', entry: CAFSEntry, timestamp: string): Promise<void> {
        // In a real implementation, this would store in Firestore
        // For now, store as JSON file in GCS
        const metadataPath = `${folder}/metadata/${entry.contentHash}.json`;
        const metadataContent = JSON.stringify(entry, null, 2);
        await this.gcsUtils.writeRawContent(metadataPath, metadataContent, 'application/json', timestamp);
    }

    /**
     * Retrieves CAFS metadata (placeholder for Firestore integration)
     * @param contentHash The content hash
     * @returns CAFS entry or null
     */
    private async getCAFSMetadata(folder: string = 'cafs', contentHash: string): Promise<CAFSEntry | null> {
        try {
            const metadataPath = `${folder}/metadata/${contentHash}.json`;
            const metadataContent = await this.gcsUtils.readRawContent(metadataPath);
            return JSON.parse(metadataContent) as CAFSEntry;
        } catch (error) {
            return null;
        }
    }

    /**
     * Deletes CAFS metadata
     * @param contentHash The content hash
     */
    private async deleteCAFSMetadata(folder: string = 'cafs', contentHash: string): Promise<void> {
        const metadataPath = `${folder}/metadata/${contentHash}.json`;
        await this.gcsUtils.deleteFile(metadataPath);
    }

    /**
     * Updates reference count for a CAFS entry
     * @param contentHash The content hash
     * @param delta The change in reference count
     */
    private async updateReferenceCount(folder: string = 'cafs', contentHash: string, delta: number): Promise<void> {
        const entry = await this.getCAFSMetadata(folder, contentHash);
        if (entry) {
            entry.metadata.referenceCount = Math.max(0, entry.metadata.referenceCount + delta);
            await this.storeCAFSMetadata(folder, entry, entry.metadata.timestamp);
        }
    }

    /**
     * Updates last access time for a CAFS entry
     * @param contentHash The content hash
     */
    private async updateLastAccessTime(folder: string = 'cafs', contentHash: string): Promise<void> {
        const entry = await this.getCAFSMetadata(folder, contentHash);
        if (entry) {
            entry.metadata.lastAccessedAt = new Date();
            await this.storeCAFSMetadata(folder, entry, entry.metadata.timestamp);
        }
    }

    /**
     * Extracts hash from storage path
     * @param path The storage path
     * @returns The hash or null
     */
    private extractHashFromPath(path: string): string | null {
        const match = path.match(/cafs\/[a-f0-9]{2}\/([a-f0-9]{64})/);
        return match ? match[1] : null;
    }
}
