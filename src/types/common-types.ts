import { type MBDFilters, LabelCategory, EventType } from './mbd-types';

/**
 * Base response interface for all API responses
 */
export interface BaseResponse {
    success: boolean;
    message?: string;
}

/**
 * Pagination information returned by API
 */
export interface PaginationInfo {
    total: number;
    page_size: number;
    page_number: number;
}

/**
 * Response including pagination
 */
export interface PaginatedResponse extends BaseResponse {
    pagination?: PaginationInfo;
}

/**
 * Common request options for API calls
 */
export interface RequestOptions {
    top_k?: number;
    page_size?: number;
    page_number?: number;
    filters?: MBDFilters;
    [key: string]: any;
}

/**
 * Feed request options
 */
export interface FeedRequestOptions extends RequestOptions {
    feedType?: 'trending' | 'popular' | 'for-you';
    userId?: string;
}

/**
 * Search request options
 */
export interface SearchRequestOptions extends RequestOptions {
    query?: string;
    return_ai_labels?: boolean;
    return_metadata?: boolean;
}

/**
 * Content analysis request options
 */
export interface ContentAnalysisOptions extends RequestOptions {
    analysisType: 'items' | 'text' | 'top-items';
    labelCategory: LabelCategory;
    itemsList?: string[];
    textInputs?: string[];
    label?: string;
    reverse?: boolean;
}

/**
 * User discovery request options
 */
export interface UserDiscoveryOptions extends RequestOptions {
    discoveryType: 'similar' | 'search' | 'channel' | 'item' | 'topic';
    userId?: string;
    query?: string;
    channel?: string;
    itemId?: string;
    topic?: string;
    eventType?: EventType;
}

/**
 * MBD API Error type
 */
export interface MBDError extends Error {
    code?: string;
    status?: number;
    context?: string;
}

/**
 * Environment configuration
 */
export interface MBDEnvironment {
    apiKey?: string;
    appName: string;
    appUrl: string;
    debug: boolean;
}