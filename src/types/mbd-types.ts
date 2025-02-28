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
    [key: string]: any;
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