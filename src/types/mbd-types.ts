import { Service, ServiceType } from "@elizaos/core";


export enum LabelCategory {
    TOPICS = 'topics',
    SENTIMENT = 'sentiment',
    EMOTION = 'emotion',
    MODERATION = 'moderation',
    ALL = 'all'
}


export enum EventType {
    LIKE = 'like',
    SHARE = 'share',
    COMMENT = 'comment',
    ALL = 'all'
}


export enum ScoringType {
    ALL = 'all',
    ONE_DAY = '1day'
}


export interface MBDFilters {
    promotion_filters?: PromotionFilter[];
}


export interface PromotionFilter {
    promotion_type: 'feed' | 'items';
    feed_id?: string;
    percent?: number;
    items?: string[];
    ranks?: number[];
}


export interface MBDCastFeedResponse {
    data: MBDCast[];
    pagination?: {
        total: number;
        page_size: number;
        page_number: number;
    };
    success: boolean;
    message?: string;
}


export interface MBDCast {
    item_id: string;
    text: string;
    author: {
        fid: string;
        username: string;
        display_name?: string;
        avatar_url?: string;
        verified?: boolean;
    };
    timestamp: number;
    embeds?: any[];
    replies_count?: number;
    recasts_count?: number;
    reactions_count?: number;
    likes_count?: number;
    thread_hash?: string;
    parent_hash?: string;
    parent_url?: string;
    parent_author?: {
        fid: string;
        username: string;
    };
    mentioned_profiles?: any[];
    channel?: {
        name: string;
        url: string;
    };
    ai_labels?: {
        [key: string]: number;
    };
    metadata?: any;
}


export interface MBDLabelsResponse {
    data: {
        [item_id: string]: {
            [label: string]: number;
        };
    };
    success: boolean;
    message?: string;
}


export interface MBDTextLabelsResponse {
    data: {
        [index: number]: {
            [label: string]: number;
        };
    };
    success: boolean;
    message?: string;
}


export interface MBDUserFeedResponse {
    data: MBDUser[];
    pagination?: {
        total: number;
        page_size: number;
        page_number: number;
    };
    success: boolean;
    message?: string;
}


export interface MBDUser {
    fid: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    verified?: boolean;
    followers_count?: number;
    following_count?: number;
    bio?: string;
    profile_url?: string;
    score?: number;
    ai_labels?: {
        [key: string]: number;
    };
}


export interface MBDSemanticSearchResponse {
    data: MBDCast[];
    success: boolean;
    message?: string;
}


export interface MBDUserSearchResponse {
    data: MBDUser[];
    success: boolean;
    message?: string;
}


/**
 * MBD API Error interface extending the standard Error
 */
export interface MBDError extends Error {
    /** HTTP status code if applicable */
    status?: number;

    /** Error code from the API if available */
    code?: string;

    /** Context where the error occurred */
    context?: string;

    /** Original request details */
    request?: {
        endpoint?: string;
        params?: Record<string, any>;
    };
}

/**
 * Promotion filter for controlling item placement in feeds
 */
export interface PromotionFilter {
    /** Type of promotion to apply */
    promotion_type: 'feed' | 'items';

    /** ID of feed to promote from (if type is 'feed') */
    feed_id?: string;

    /** Percentage of results to include from promotion source */
    percent?: number;

    /** Specific items to promote (if type is 'items') */
    items?: string[];

    /** Specific ranks to insert promoted items */
    ranks?: number[];
}

/**
 * Content filters for MBD API requests
 */
export interface MBDFilters {
    /** Filters for promoted content */
    promotion_filters?: PromotionFilter[];

    /** User-specific filters (FIDs to include or exclude) */
    user_filters?: {
        /** Users to exclude from results */
        exclude_users?: string[];

        /** Only include these users in results */
        include_users?: string[];
    };

    /** Time-based filters */
    time_filters?: {
        /** Minimum timestamp (in milliseconds since epoch) */
        min_timestamp?: number;

        /** Maximum timestamp (in milliseconds since epoch) */
        max_timestamp?: number;
    };

    /** Label-based filters */
    label_filters?: {
        /** Only include content with these labels above threshold */
        required_labels?: Record<string, number>;

        /** Exclude content with these labels above threshold */
        excluded_labels?: Record<string, number>;
    };

    /** Channel-based filters */
    channel_filters?: {
        /** Only include content from these channels */
        include_channels?: string[];

        /** Exclude content from these channels */
        exclude_channels?: string[];
    };

    /** Custom filters can be added as needed */
    [key: string]: any;
}


export const MBD_SERVICE_TYPE = ServiceType.TEXT_GENERATION;


export interface IMBDService extends Service {
    baseUrl: string;
    headers: {
        [key: string]: string;
    };
    settings: {
        appName: string;
        appUrl: string;
        debug: boolean;
    };

    
    getForYouFeed(userId: string, options?: any): Promise<MBDCastFeedResponse>;
    getTrendingFeed(options?: any): Promise<MBDCastFeedResponse>;
    getPopularFeed(options?: any): Promise<MBDCastFeedResponse>;
    semanticSearch(query: string, options?: any): Promise<MBDSemanticSearchResponse>;
    getLabelsForItems(itemsList: string[], labelCategory: LabelCategory): Promise<MBDLabelsResponse>;
    getLabelsForText(textInputs: string[], labelCategory: LabelCategory): Promise<MBDTextLabelsResponse>;
    getTopItemsByLabel(label: string, options?: any): Promise<MBDCastFeedResponse>;
    getSimilarUsers(userId: string, options?: any): Promise<MBDUserFeedResponse>;
    searchUsers(query: string, options?: any): Promise<MBDUserSearchResponse>;
    getUsersForChannel(channel: string, eventType: EventType, options?: any): Promise<MBDUserFeedResponse>;
    getUsersForItem(itemId: string, eventType: EventType, options?: any): Promise<MBDUserFeedResponse>;
    getUsersForTopic(topic: string, eventType: EventType, options?: any): Promise<MBDUserFeedResponse>;
}