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
