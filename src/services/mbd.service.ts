import {
    elizaLogger,
    Service,
    type IAgentRuntime,
    ServiceType,
} from "@elizaos/core";

import {
    type MBDCastFeedResponse,
    type MBDSemanticSearchResponse,
    type MBDLabelsResponse,
    type MBDTextLabelsResponse,
    type MBDUserFeedResponse,
    type MBDUserSearchResponse,
    LabelCategory,
    EventType,
    type IMBDService,
    MBD_SERVICE_TYPE
} from '../types/mbd-types';

import type {
    MBDEnvironment,
    RequestOptions,
    FeedRequestOptions,
    SearchRequestOptions
} from '../types/common-types';

import { ApiClient } from './api-client';
import {
    formatCastsResponse,
    formatUsersResponse,
    formatLabelsResponse,
    formatTextLabelsResponse
} from '../utils/formatters';

export class MBDFarcasterService extends Service implements IMBDService {
    baseUrl: string;
    headers: Record<string, string>;
    settings: MBDEnvironment;
    apiKey: string;
    private apiClient: ApiClient | null = null;

    static get serviceType(): ServiceType {
        return MBD_SERVICE_TYPE;
    }

    get serviceType(): ServiceType {
        return MBD_SERVICE_TYPE;
    }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        // Get API key and other settings
        this.apiKey = runtime.getSetting("MBD_API_KEY") || "";
        this.baseUrl = "https://api.mbd.xyz/v2/farcaster";

        // Set up headers
        this.headers = {
            'content-type': 'application/json',
            'accept': 'application/json',
        };

        // Set up environment configuration
        const appUrl = runtime.getSetting("MBD_APP_URL") || "https://docs.mbd.xyz/";
        const appName = runtime.getSetting("MBD_APP_NAME") || "eliza_mbd_plugin";

        this.headers['HTTP-Referer'] = appUrl;
        this.headers['X-Title'] = appName;

        if (this.apiKey) {
            this.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        this.settings = {
            appName,
            appUrl,
            debug: runtime.getSetting("MBD_DEBUG") === "true",
            apiKey: this.apiKey
        };

        // Initialize API client
        this.apiClient = new ApiClient(this.baseUrl, this.settings);

        if (this.settings.debug) {
            elizaLogger.debug("MBD Farcaster Service initialized with:", {
                baseUrl: this.baseUrl,
                appName: this.settings.appName,
                appUrl: this.settings.appUrl,
                hasApiKey: !!this.apiKey
            });
        }

        // Warn if API key is not provided
        if (!this.apiKey) {
            elizaLogger.warn("MBD_API_KEY not defined, plugin may operate with rate limitations");
        }
    }

    /**
     * Get "For You" feed - personalized recommendations for a user
     */
    async getForYouFeed(userId: string, options: RequestOptions = {}): Promise<MBDCastFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body: Record<string, any> = {
            user_id: userId,
            ...options
        };

        return this.apiClient.post<MBDCastFeedResponse>('/casts/feed/for-you', body);
    }

    /**
     * Get trending cast feed
     */
    async getTrendingFeed(options: RequestOptions = {}): Promise<MBDCastFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        return this.apiClient.post<MBDCastFeedResponse>('/casts/feed/trending', options);
    }

    /**
     * Get popular cast feed
     */
    async getPopularFeed(options: RequestOptions = {}): Promise<MBDCastFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        return this.apiClient.post<MBDCastFeedResponse>('/casts/feed/popular', options);
    }

    /**
     * Perform semantic cast search
     */
    async semanticSearch(query: string, options: SearchRequestOptions = {}): Promise<MBDSemanticSearchResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            query,
            ...options
        };

        return this.apiClient.post<MBDSemanticSearchResponse>('/casts/search/semantic', body);
    }

    /**
     * Get AI labels for a cast list
     */
    async getLabelsForItems(itemsList: string[], labelCategory: LabelCategory): Promise<MBDLabelsResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            items_list: itemsList,
            label_category: labelCategory
        };

        return this.apiClient.post<MBDLabelsResponse>('/casts/labels/for-items', body);
    }

    /**
     * Get AI labels for texts
     */
    async getLabelsForText(textInputs: string[], labelCategory: LabelCategory): Promise<MBDTextLabelsResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            text_inputs: textInputs,
            label_category: labelCategory
        };

        return this.apiClient.post<MBDTextLabelsResponse>('/casts/labels/for-text', body);
    }

    /**
     * Get casts with the highest or lowest scores for a given label
     */
    async getTopItemsByLabel(label: string, options: RequestOptions = {}): Promise<MBDCastFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            label,
            ...options
        };

        return this.apiClient.post<MBDCastFeedResponse>('/casts/labels/top-items', body);
    }

    /**
     * Get users similar to a specific user
     */
    async getSimilarUsers(userId: string, options: RequestOptions = {}): Promise<MBDUserFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            user_id: userId,
            ...options
        };

        return this.apiClient.post<MBDUserFeedResponse>('/users/feed/similar', body);
    }

    /**
     * Search users based on text
     */
    async searchUsers(query: string, options: RequestOptions = {}): Promise<MBDUserSearchResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            query,
            ...options
        };

        return this.apiClient.post<MBDUserSearchResponse>('/users/search/semantic', body);
    }

    /**
     * Get users for a channel
     */
    async getUsersForChannel(
        channel: string,
        eventType: EventType,
        options: RequestOptions = {}
    ): Promise<MBDUserFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            channel,
            event_type: eventType,
            ...options
        };

        return this.apiClient.post<MBDUserFeedResponse>('/users/feed/for-channel', body);
    }

    /**
     * Get users for an item
     */
    async getUsersForItem(
        itemId: string,
        eventType: EventType,
        options: RequestOptions = {}
    ): Promise<MBDUserFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            item_id: itemId,
            event_type: eventType,
            ...options
        };

        return this.apiClient.post<MBDUserFeedResponse>('/users/feed/for-item', body);
    }

    /**
     * Get users for a topic
     */
    async getUsersForTopic(
        topic: string,
        eventType: EventType,
        options: RequestOptions = {}
    ): Promise<MBDUserFeedResponse> {
        if (!this.apiClient) {
            throw new Error("MBD Service not initialized");
        }

        const body = {
            topic,
            event_type: eventType,
            ...options
        };

        return this.apiClient.post<MBDUserFeedResponse>('/users/feed/for-topic', body);
    }

    // Public formatter methods that delegate to the common formatters
    formatCastsResponse(response: MBDCastFeedResponse): string {
        return formatCastsResponse(response);
    }

    formatUsersResponse(response: MBDUserFeedResponse): string {
        return formatUsersResponse(response);
    }

    formatLabelsResponse(response: MBDLabelsResponse): string {
        return formatLabelsResponse(response);
    }

    formatTextLabelsResponse(response: MBDTextLabelsResponse, textInputs: string[]): string {
        return formatTextLabelsResponse(response, textInputs);
    }
}