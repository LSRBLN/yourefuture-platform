import type { CheckType, ReviewPriority, SourceType, SupportRequestType } from './status.js';
export type CreateCheckInputContract = {
    email?: string;
    username?: string;
    phone?: string;
    domain?: string;
    passwordHashPrefix?: string;
    assetId?: string;
    submittedSourceIds?: string[];
};
export type CreateCheckRequestContract = {
    type: CheckType;
    input: CreateCheckInputContract;
};
export type CreateSourceRequestContract = {
    sourceType: SourceType;
    sourceUrl: string;
    platformName?: string;
    pageTitle?: string;
    notes?: string;
    assetId?: string;
    checkId?: string;
};
export type CreateSupportRequestContract = {
    requestType: SupportRequestType;
    priority?: ReviewPriority;
    checkId?: string;
    assetId?: string;
    removalCaseId?: string;
    preferredContact?: string;
    message: string;
};
export type IntakeOrchestratorContract = {
    concern: string;
    payload: {
        check: CreateCheckRequestContract;
        source: CreateSourceRequestContract;
        support: CreateSupportRequestContract;
    };
};
export type ContractValidationIssue = {
    path: string;
    message: string;
};
export type ContractValidationResult<T> = {
    success: true;
    data: T;
    issues: [];
} | {
    success: false;
    data?: undefined;
    issues: ContractValidationIssue[];
};
/**
 * Generic Breach/Leak Result from any provider
 */
export type BreachResult = {
    providerName: string;
    breachName: string;
    breachDate: string;
    dataClasses: string[];
    description?: string;
    isVerified: boolean;
    isRetired?: boolean;
    isFabricated?: boolean;
    sourceUrl?: string;
};
/**
 * Aggregated leak check result across all providers
 */
export type AggregatedLeakCheckResult = {
    email?: string;
    username?: string;
    phone?: string;
    domain?: string;
    breaches: BreachResult[];
    summary: string;
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    recommendedActions: string[];
    timestamp: string;
};
/**
 * Provider Connector Interface
 */
export interface ILeakProvider {
    name: string;
    enabled: boolean;
    /**
     * Search for breaches containing an email
     */
    searchEmail(email: string): Promise<BreachResult[]>;
    /**
     * Search for breaches containing a username
     */
    searchUsername(username: string): Promise<BreachResult[]>;
    /**
     * Search for breaches containing a phone
     */
    searchPhone(phone: string): Promise<BreachResult[]>;
    /**
     * Search for breaches containing a domain
     */
    searchDomain(domain: string): Promise<BreachResult[]>;
    /**
     * Health check for the provider API
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Image/Video Analysis Result
 */
export type MediaAnalysisResult = {
    providerName: string;
    assetId: string;
    flags: {
        nsfw?: boolean;
        deepfake?: boolean;
        malware?: boolean;
        suspicious?: boolean;
    };
    confidence: number;
    details?: Record<string, unknown>;
    timestamp: string;
};
/**
 * Media Analysis Provider Interface
 */
export interface IMediaProvider {
    name: string;
    enabled: boolean;
    /**
     * Analyze an image for deepfakes, NSFW content, etc.
     */
    analyzeImage(imageUrl: string, assetId: string): Promise<MediaAnalysisResult>;
    /**
     * Analyze a video for deepfakes, frame extraction, etc.
     */
    analyzeVideo(videoUrl: string, assetId: string): Promise<MediaAnalysisResult>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Removal Request for external platforms
 */
export type RemovalRequest = {
    removalCaseId: string;
    targetUrl: string;
    platform: string;
    legalBasis: string;
    evidenceUrl?: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
};
/**
 * Removal Response from external platform
 */
export type RemovalResponse = {
    ticketId: string;
    status: 'submitted' | 'under_review' | 'removed' | 'rejected' | 'unknown';
    message: string;
    nextSteps?: string[];
    estimatedResolutionDate?: string;
};
/**
 * Removal Platform Adapter Interface
 */
export interface IRemovalPlatformAdapter {
    platform: string;
    enabled: boolean;
    /**
     * Submit a removal request to the external platform
     */
    submitRemoval(request: RemovalRequest): Promise<RemovalResponse>;
    /**
     * Check status of a previously submitted removal
     */
    checkRemovalStatus(ticketId: string): Promise<RemovalResponse>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
