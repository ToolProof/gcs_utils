import { CAFSEntry, CAFSOperationResult, ResourceMetadata, GCSUtilsConfig } from './types/index.js';
/**
 * Content Addressable File Storage (CAFS) implementation
 * Provides deduplication and content-based addressing for resources
 */
export declare class CAFS {
    private gcsUtils;
    private config;
    constructor(config?: Partial<GCSUtilsConfig>);
    /**
     * Stores content in CAFS with deduplication
     * @param content The content to store
     * @param metadata Optional metadata
     * @returns CAFS operation result
     */
    storeContent(folder: string | undefined, content: string, metadata?: Partial<ResourceMetadata>): Promise<CAFSOperationResult>;
    /**
     * Retrieves content from CAFS by hash
     * @param contentHash The SHA-256 hash of the content
     * @param updateAccessTime Whether to update last accessed time
     * @returns The content string
     */
    retrieveContent(folder: string | undefined, contentHash: string, updateAccessTime?: boolean): Promise<string>;
    /**
     * Checks if content exists in CAFS
     * @param contentHash The SHA-256 hash to check
     * @returns True if content exists, false otherwise
     */
    contentExists(folder: string | undefined, contentHash: string): Promise<boolean>;
    /**
     * Deletes content from CAFS (decrements reference count)
     * @param contentHash The SHA-256 hash of the content
     * @param forceDelete Whether to force delete regardless of reference count
     */
    deleteContent(folder: string | undefined, contentHash: string, forceDelete?: boolean): Promise<void>;
    /**
     * Gets CAFS entry metadata
     * @param contentHash The SHA-256 hash
     * @returns CAFS entry or null if not found
     */
    getCAFSEntry(folder: string | undefined, contentHash: string): Promise<CAFSEntry | null>;
    /**
     * Lists all CAFS entries with optional filtering
     * @param filter Optional filter function
     * @returns Array of CAFS entries
     */
    listCAFSEntries(folder?: string, filter?: (entry: CAFSEntry) => boolean): Promise<CAFSEntry[]>;
    /**
     * Gets the storage path for a content hash
     * @param contentHash The SHA-256 hash
     * @returns The GCS storage path
     */
    private getStoragePath;
    /**
     * Stores CAFS metadata (placeholder for Firestore integration)
     * @param entry The CAFS entry to store
     */
    private storeCAFSMetadata;
    /**
     * Retrieves CAFS metadata (placeholder for Firestore integration)
     * @param contentHash The content hash
     * @returns CAFS entry or null
     */
    private getCAFSMetadata;
    /**
     * Deletes CAFS metadata
     * @param contentHash The content hash
     */
    private deleteCAFSMetadata;
    /**
     * Updates reference count for a CAFS entry
     * @param contentHash The content hash
     * @param delta The change in reference count
     */
    private updateReferenceCount;
    /**
     * Updates last access time for a CAFS entry
     * @param contentHash The content hash
     */
    private updateLastAccessTime;
    /**
     * Extracts hash from storage path
     * @param path The storage path
     * @returns The hash or null
     */
    private extractHashFromPath;
}
