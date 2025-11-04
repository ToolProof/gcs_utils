/**
 * Core types and interfaces for the GCS Utils SDK
 */

/**
 * Interface for the JSON structure in storage files
 */
export interface IntegerInstance {
    semanticIdentity: number;
}

/**
 * Supported resource types in the system
 */
export type ResourceType = 'integer' | 'string' | 'object' | 'array';

/**
 * Resource identifier that encodes ResourceType, JobStep, and Job information
 */
export interface ResourceId {
    /** Unique identifier for the resource */
    id: string;
    /** Type of the resource */
    resourceType: ResourceType;
    /** ID of the job step that created this resource */
    jobStepId: string;
    /** ID of the job that contains the job step */
    jobId: string;
    /** Timestamp when the resource was created */
    createdAt: Date;
}

/**
 * Role identifier for resources within job steps
 */
export interface ResourceRoleId {
    /** Unique identifier for the resource role */
    id: string;
    /** The resource type this role applies to */
    resourceType: ResourceType;
    /** Name/description of the role */
    roleName: string;
}

/**
 * Core resource interface
 */
export interface Resource<T = any> {
    /** Unique resource identifier */
    resourceId: ResourceId;
    /** Content hash (SHA-256) used for CAFS */
    contentHash: string;
    /** The actual content/data of the resource */
    content: T;
    /** Metadata about the resource */
    metadata: ResourceMetadata;
}

/**
 * Metadata associated with a resource
 */
export interface ResourceMetadata {
    /** Size of the content in bytes */
    contentSize: number;
    /** MIME type of the content */
    contentType: string;
    /** When the resource was first created */
    timestamp: string;
    /** When the resource was last accessed */
    lastAccessedAt: Date;
    /** Number of times this resource has been referenced */
    referenceCount: number;
    /** Tags for categorization */
    tags: string[];
    /** Custom properties */
    customProperties: Record<string, any>;
}

/**
 * CAFS (Content Addressable File Storage) entry
 */
export interface CAFSEntry {
    /** SHA-256 hash of the content */
    contentHash: string;
    /** Path to the file in GCS */
    gcsPath: string;
    /** Metadata about the stored content */
    metadata: ResourceMetadata;
    /** List of resource IDs that reference this content */
    referencedBy: string[];
}

/**
 * Configuration for the GCS Utils SDK
 */
export interface GCSUtilsConfig {
    /** Google Cloud Storage bucket name */
    bucketName: string;
    /** Firestore collection name for metadata */
    metadataCollection: string;
    /** Whether to enable content deduplication */
    enableDeduplication: boolean;
    /** Maximum file size allowed (in bytes) */
    maxFileSize: number;
    /** Default content type for files */
    defaultContentType: string;
}

/**
 * Options for reading from GCS
 */
export interface ReadOptions {
    /** Whether to update last accessed timestamp */
    updateAccessTime?: boolean;
    /** Whether to validate content hash */
    validateHash?: boolean;
}

/**
 * Options for writing to GCS
 */
export interface WriteOptions {
    /** Custom metadata to include */
    metadata?: Partial<ResourceMetadata>;
    /** Whether to overwrite existing content */
    overwrite?: boolean;
    /** Content type override */
    contentType?: string;
    /** Tags to apply to the resource */
    tags?: string[];
}

/**
 * Result of a CAFS operation
 */
export interface CAFSOperationResult {
    /** Whether the operation was successful */
    success: boolean;
    /** The content hash */
    contentHash: string;
    /** Whether content was deduplicated (already existed) */
    deduplicated: boolean;
    /** Path where content is stored */
    storagePath: string;
    /** Any error message if operation failed */
    error?: string;
}

/**
 * Job step interface (simplified for CAFS integration)
 */
export interface JobStep {
    /** Unique identifier for the job step */
    id: string;
    /** ID of the parent job */
    jobId: string;
    /** Name of the job step */
    name: string;
    /** Status of the job step */
    status: 'pending' | 'running' | 'completed' | 'failed';
    /** Resources created by this job step */
    createdResources: string[];
}

/**
 * Job interface (simplified for CAFS integration)
 */
export interface Job {
    /** Unique identifier for the job */
    id: string;
    /** Name of the job */
    name: string;
    /** Status of the job */
    status: 'pending' | 'running' | 'completed' | 'failed';
    /** Job steps in this job */
    steps: JobStep[];
    /** When the job was created */
    createdAt: Date;
}
